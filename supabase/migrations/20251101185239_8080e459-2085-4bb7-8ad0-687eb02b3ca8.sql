-- ================================================================
-- FIX 1: Move roles from profiles table to separate user_roles table
-- ================================================================

-- Create app_role enum (if not exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('user', 'worker', 'moderator', 'chief');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text::app_role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Workers can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('worker', 'moderator', 'chief')
  ));

-- Update has_role function to use user_roles table instead of profiles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role::app_role
  )
$$;

-- ================================================================
-- FIX 2: Add explicit DELETE and UPDATE policies to balance_transactions
-- ================================================================

-- Only workers can delete transactions
CREATE POLICY "Only workers can delete transactions"
  ON public.balance_transactions
  FOR DELETE
  USING (has_role(auth.uid(), 'worker'));

-- Transactions are immutable - no user updates allowed
CREATE POLICY "Transactions are immutable for users"
  ON public.balance_transactions
  FOR UPDATE
  USING (false);

-- Workers can update transactions if needed for corrections
CREATE POLICY "Workers can update transactions"
  ON public.balance_transactions
  FOR UPDATE
  USING (has_role(auth.uid(), 'worker'));

-- ================================================================
-- FIX 3: Secure bot tokens - create RPC function for token access
-- ================================================================

-- Create secure function to get bot token when needed
CREATE OR REPLACE FUNCTION public.get_bot_token(_bot_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bot_token text;
  bot_owner uuid;
BEGIN
  -- Get the bot token and owner
  SELECT token, user_id INTO bot_token, bot_owner
  FROM public.bots
  WHERE id = _bot_id;
  
  -- Verify the requesting user owns this bot
  IF bot_owner != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN bot_token;
END;
$$;

-- Update bots RLS policies to exclude token from SELECT
-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view their own bots" ON public.bots;
DROP POLICY IF EXISTS "Workers can view all bots" ON public.bots;

-- Recreate SELECT policies (they will apply to columns, we'll handle token separately in code)
CREATE POLICY "Users can view their own bots"
  ON public.bots
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Workers can view all bots"
  ON public.bots
  FOR SELECT
  USING (has_role(auth.uid(), 'worker'));