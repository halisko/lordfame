-- Step 2: Update current user role and function (now that enum values are committed)
UPDATE public.profiles 
SET role = 'chief'::user_role 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'mrasul200912@gmail.com');

-- Update handle_new_user function for the new roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO 'public' 
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'mrasul200912@gmail.com' THEN 'chief'::user_role
      ELSE 'user'::user_role
    END
  );
  RETURN NEW;
END;
$$;