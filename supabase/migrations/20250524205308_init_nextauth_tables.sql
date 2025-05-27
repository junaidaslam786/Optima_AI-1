-- 1) Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3) Users + seed admin
CREATE TABLE public.users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT         NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  name          TEXT         NOT NULL,
  role          TEXT         NOT NULL DEFAULT 'client',
  dob           DATE,
  address       TEXT,
  subscription  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.users (email, password_hash, name, role)
VALUES (
  'johndoe@gmail.com',
  '$2b$10$gEE2s91KtQ7bnlUkDpyYeOh2Q/LQBjAsKdw5TP0olSc2GkUnb7jpC',
  'John Doe',
  'admin'
);
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, service_role;

-- 4) Panels
CREATE TABLE public.panels (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT         NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.panels TO anon, service_role;

-- 5) Uploads
CREATE TABLE public.uploads (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id  UUID         NOT NULL REFERENCES public.users(id),
  client_user_id UUID         NOT NULL REFERENCES public.users(id),
  filename       TEXT         NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uploads TO anon, service_role;

-- 6) Markers
CREATE TABLE public.markers (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  csvfile_id   UUID         NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  user_id      UUID         NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  panel_id     UUID         NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  col_date     DATE         NOT NULL DEFAULT now(),
  rep_date     DATE         NOT NULL DEFAULT now(),
  marker       TEXT         NOT NULL,
  value        NUMERIC      NOT NULL,
  unit         TEXT         NOT NULL,
  normal_low   NUMERIC,
  normal_high  NUMERIC,
  status       TEXT         NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.markers TO anon, service_role;

-- 7) Insights
CREATE TABLE public.insights (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id   UUID         NOT NULL REFERENCES public.markers(id) ON DELETE CASCADE,
  insight     TEXT         NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insights TO anon, service_role;


-- 8) Triggers & functions for updated_at

-- users
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
DROP FUNCTION IF EXISTS public.set_updated_at_users();
CREATE FUNCTION public.set_updated_at_users()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_users();

-- panels
DROP TRIGGER IF EXISTS trg_panels_updated_at ON public.panels;
DROP FUNCTION IF EXISTS public.set_updated_at_panels();
CREATE FUNCTION public.set_updated_at_panels()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_panels_updated_at
  BEFORE UPDATE ON public.panels
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_panels();

-- uploads
DROP TRIGGER IF EXISTS trg_uploads_updated_at ON public.uploads;
DROP FUNCTION IF EXISTS public.set_updated_at_uploads();
CREATE FUNCTION public.set_updated_at_uploads()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_uploads_updated_at
  BEFORE UPDATE ON public.uploads
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_uploads();

-- markers
DROP TRIGGER IF EXISTS trg_markers_updated_at ON public.markers;
DROP FUNCTION IF EXISTS public.set_updated_at_markers();
CREATE FUNCTION public.set_updated_at_markers()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_markers_updated_at
  BEFORE UPDATE ON public.markers
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_markers();

-- insights
DROP TRIGGER IF EXISTS trg_insights_updated_at ON public.insights;
DROP FUNCTION IF EXISTS public.set_updated_at_insights();
CREATE FUNCTION public.set_updated_at_insights()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_insights_updated_at
  BEFORE UPDATE ON public.insights
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_insights();
