-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create or update your public.users table
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT         NOT NULL UNIQUE,
  password      TEXT         NOT NULL,
  name          TEXT         NOT NULL,
  dob           DATE         NOT NULL,
  address       TEXT         NOT NULL,
  role          TEXT         NOT NULL
                     CHECK (role IN ('admin','client')),
  subscription  TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT client_must_have_subscription
    CHECK (role <> 'client' OR subscription IS NOT NULL)
);

-- 3. Create or update your public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT         NOT NULL UNIQUE,
  name          TEXT         NOT NULL,
  role          TEXT         NOT NULL CHECK (role IN ('admin','client')),
  dob           DATE         NOT NULL,
  address       TEXT         NOT NULL,
  subscription  TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT client_requires_subscription
    CHECK (role <> 'client' OR subscription IS NOT NULL)
);

-- 4. Drop any existing trigger to avoid duplicate-name errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 5. Create or replace the helper function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach the trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- 7. Enable Row Level Security on profiles
ALTER TABLE public.profiles
  ENABLE ROW LEVEL SECURITY;

-- 8. RLS policies: split into SELECT and UPDATE
CREATE POLICY "Profiles: self select"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Profiles: self update"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
