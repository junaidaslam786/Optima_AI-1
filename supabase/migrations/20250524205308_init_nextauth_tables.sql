-- 1) Enable UUID gen
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Drop any legacy next_auth schema
DROP SCHEMA IF EXISTS next_auth CASCADE;

-- 3) Create your ONE users table in public
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT         NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  name          TEXT         NOT NULL,
  role          TEXT         NOT NULL,       -- e.g. 'admin' | 'client'
  dob           DATE,                         -- optional
  address       TEXT,                         -- optional
  subscription  TEXT,                         -- optional
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE ON public.users TO postgres, service_role;

-- 4) Row-Level Security on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_self ON public.users;
DROP POLICY IF EXISTS update_self ON public.users;
CREATE POLICY select_self ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY update_self ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 5) Trigger to auto‐stamp updated_at
--    Drop trigger first, then drop/create function
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
DROP FUNCTION IF EXISTS public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- 6) Roles lookup table & link in users
CREATE TABLE IF NOT EXISTS public.roles (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT   NOT NULL UNIQUE
);
GRANT SELECT, INSERT, UPDATE ON public.roles TO postgres, service_role;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- 7) CSV uploads
CREATE TABLE IF NOT EXISTS public.uploads (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES public.users(id),
  filename    TEXT         NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status      TEXT         NOT NULL DEFAULT 'pending'
);
GRANT SELECT, INSERT, UPDATE ON public.uploads TO postgres, service_role;

-- 8) Panels & markers
CREATE TABLE IF NOT EXISTS public.panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT   NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE ON public.panels TO postgres, service_role;

CREATE TABLE IF NOT EXISTS public.markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  code        TEXT   NOT NULL,
  unit        TEXT   NOT NULL,
  normal_low  NUMERIC,
  normal_high NUMERIC
);
GRANT SELECT, INSERT, UPDATE ON public.markers TO postgres, service_role;

-- 9) Test results
CREATE TABLE IF NOT EXISTS public.results (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id   UUID         NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  marker_id   UUID    NOT NULL REFERENCES public.markers(id),
  value       NUMERIC      NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE ON public.results TO postgres, service_role;

-- 10) AI insights
CREATE TABLE IF NOT EXISTS public.insights (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id  UUID         NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
  insight    TEXT         NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE ON public.insights TO postgres, service_role;

-- 11) PDF reports
CREATE TABLE IF NOT EXISTS public.pdf_reports (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES public.users(id),
  report_url   TEXT         NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE ON public.pdf_reports TO postgres, service_role;
