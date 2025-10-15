-- Create streamers table
CREATE TABLE IF NOT EXISTS public.streamers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  stream_url text NOT NULL,
  streamer_name text NOT NULL,
  is_live boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.streamers ENABLE ROW LEVEL SECURITY;

-- Create policies for streamers
CREATE POLICY "Users can view their own streamers"
  ON public.streamers
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own streamers"
  ON public.streamers
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own streamers"
  ON public.streamers
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own streamers"
  ON public.streamers
  FOR DELETE
  USING (user_id = auth.uid());

-- Create bot categories table
CREATE TABLE IF NOT EXISTS public.bot_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for bot_categories
ALTER TABLE public.bot_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view bot categories"
  ON public.bot_categories
  FOR SELECT
  USING (true);

-- Update bots table to add category
ALTER TABLE public.bots 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.bot_categories(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bots_category_id ON public.bots(category_id);
CREATE INDEX IF NOT EXISTS idx_streamers_user_id ON public.streamers(user_id);

-- Insert default categories
INSERT INTO public.bot_categories (name, description) VALUES
  ('Боты для ГТА', 'Боты для стримов по GTA'),
  ('Боты для Dota 2', 'Боты для стримов по Dota 2'),
  ('Боты для CS:GO', 'Боты для стримов по CS:GO')
ON CONFLICT DO NOTHING;