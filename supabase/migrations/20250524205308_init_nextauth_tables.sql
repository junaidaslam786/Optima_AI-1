-- Complete Database Schema
-- This file contains all tables, triggers, and functions for the application

-- 1) Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Users + seed admin
CREATE TABLE public.users (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT          NOT NULL UNIQUE,
    password_hash TEXT,
    name          TEXT,
    role          TEXT          NOT NULL DEFAULT 'client',
    dob           DATE,
    address       TEXT,
    subscription  TEXT,
    phone         TEXT,
    created_at    timestamp   NOT NULL DEFAULT now(),
    updated_at    timestamp   NOT NULL DEFAULT now()
);

-- Seed an admin user (password 'password')
INSERT INTO public.users (email, password_hash, name, role)
VALUES (
    'johndoe@gmail.com',
    '$2b$10$gEE2s91KtQ7bnlUkDpyYeOh2Q/LQBjAsKdw5TP0olSc2GkUnb7jpC',
    'John Doe',
    'admin'
);
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, service_role;

-- 3) Categories
CREATE TABLE public.categories (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT          NOT NULL UNIQUE,
    description   TEXT,
    created_at    timestamp   NOT NULL DEFAULT now(),
    updated_at    timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, service_role;

-- 4) Panels
CREATE TABLE public.panels (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT          NOT NULL,
    description   TEXT,
    category_id   UUID          REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at    timestamp   NOT NULL DEFAULT now(),
    updated_at    timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.panels TO anon, service_role;

-- 5) Uploads
CREATE TABLE public.uploads (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id  UUID          NOT NULL REFERENCES public.users(id),
    client_user_id UUID          REFERENCES public.users(id),
    filename       TEXT          NOT NULL,
    created_at     timestamp   NOT NULL DEFAULT now(),
    updated_at     timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uploads TO anon, service_role;

-- 6) Markers
CREATE TABLE public.markers (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id      UUID          NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
    marker        TEXT          NOT NULL,
    unit          TEXT          NOT NULL,
    normal_low    NUMERIC,
    normal_high   NUMERIC,
    created_at    timestamp   NOT NULL DEFAULT now(),
    updated_at    timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.markers TO anon, service_role;

-- 7) Patient Marker Values
CREATE TABLE public.patient_marker_values (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    csvfile_id    UUID          NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
    user_id       UUID          NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    marker_id     UUID          NOT NULL REFERENCES public.markers(id) ON DELETE RESTRICT,
    col_date      DATE          NOT NULL DEFAULT now(),
    rep_date      DATE          NOT NULL DEFAULT now(),
    value         NUMERIC       NOT NULL,
    status        TEXT          NOT NULL DEFAULT 'normal', -- 'normal', 'high', 'low', 'critical'
    created_at    timestamp   NOT NULL DEFAULT now(),
    updated_at    timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_marker_values TO anon, service_role;

-- 8) PDF Reports
CREATE TABLE public.pdf_reports (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID          NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    panel_id      UUID          NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
    report_url    TEXT          NOT NULL,
    generated_at  DATE          NOT NULL DEFAULT CURRENT_DATE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdf_reports TO anon, service_role;

--- E-COMMERCE TABLES ---

-- 9) Partner Profiles
CREATE TABLE public.partner_profiles (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID          NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE RESTRICT,
    company_name          TEXT          NOT NULL UNIQUE,
    company_slug          TEXT          NOT NULL UNIQUE, -- URL-friendly slug for subdomain
    company_description   TEXT,
    contact_person_name   TEXT,
    contact_email         TEXT          NOT NULL,
    contact_phone         TEXT,
    address               TEXT,
    country               TEXT,
    partner_status        TEXT          NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'suspended', 'deactivated'
    approval_date         timestamp,
    rejection_reason      TEXT,
    notes                 TEXT,
    created_at            timestamp   NOT NULL DEFAULT now(),
    updated_at            timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_profiles TO anon, service_role;

-- 10) Transactions (Moved up due to foreign key dependencies)
CREATE TABLE public.transactions (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id              UUID, -- Will be updated after orders table is created
    user_id               UUID          NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    transaction_amount    NUMERIC       NOT NULL,
    currency              TEXT          NOT NULL DEFAULT 'GBP',
    payment_gateway       TEXT          NOT NULL, -- e.g., 'Stripe', 'PayPal', 'Square'
    gateway_transaction_id TEXT         UNIQUE, -- ID from the payment gateway
    transaction_status    TEXT          NOT NULL DEFAULT 'pending', -- 'pending', 'succeeded', 'failed', 'refunded'
    transaction_type      TEXT          NOT NULL DEFAULT 'sale', -- 'sale', 'refund', 'authorization'
    error_message         TEXT,
    created_at            timestamp   NOT NULL DEFAULT now(),
    updated_at            timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.transactions TO anon, service_role;

-- 11) Admin Products (Base Products)
CREATE TABLE public.admin_products (
    id                       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name                     TEXT          NOT NULL,
    description              TEXT,
    base_price               NUMERIC       NOT NULL,
    sku                      TEXT          UNIQUE,
    category_ids             UUID[],        -- Array of categories.id
    intended_use             TEXT,
    test_type                VARCHAR(100),
    marker_ids               UUID[],
    result_timeline          VARCHAR(50),
    additional_test_information TEXT,
    corresponding_panels     UUID[],        -- Array of panel IDs
    admin_user_id            UUID          REFERENCES public.users(id) ON DELETE SET NULL,
    product_image_urls       TEXT[],
    thumbnail_url            TEXT,
    created_at               timestamp   NOT NULL DEFAULT now(),
    updated_at               timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_products TO anon, service_role;

-- 12) Partner Products (Partner's custom listings of admin products)
CREATE TABLE public.partner_products (
    id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id             UUID          NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
    admin_product_id       UUID          NOT NULL REFERENCES public.admin_products(id) ON DELETE RESTRICT,
    partner_price          NUMERIC       NOT NULL,
    partner_name           TEXT,
    partner_description    TEXT,
    partner_keywords       TEXT[],
    is_active              BOOLEAN       NOT NULL DEFAULT TRUE,
    product_image_urls     TEXT[],
    thumbnail_url          TEXT,
    created_at             timestamp   NOT NULL DEFAULT now(),
    updated_at             timestamp   NOT NULL DEFAULT now(),
    UNIQUE (partner_id, admin_product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_products TO anon, service_role;

-- 13) Carts
CREATE TABLE public.carts (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID          NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    created_at    timestamp   NOT NULL DEFAULT now(),
    updated_at    timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO anon, service_role;

-- 14) Cart Items
CREATE TABLE public.cart_items (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id           UUID          NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    partner_product_id UUID         NOT NULL REFERENCES public.partner_products(id) ON DELETE CASCADE,
    quantity          INTEGER       NOT NULL CHECK (quantity > 0),
    price_at_addition NUMERIC       NOT NULL,
    created_at        timestamp   NOT NULL DEFAULT now(),
    updated_at        timestamp   NOT NULL DEFAULT now(),
    UNIQUE (cart_id, partner_product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO anon, service_role;

-- 15) Orders
CREATE TABLE public.orders (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_user_id        UUID          NOT NULL    REFERENCES public.users(id) ON DELETE RESTRICT,
    partner_id              UUID          NOT NULL    REFERENCES public.partner_profiles(id) ON DELETE RESTRICT,
    primary_transaction_id  UUID          NOT NULL    REFERENCES public.transactions(id),
    order_date              timestamp     NOT NULL    DEFAULT now(),
    total_amount            NUMERIC       NOT NULL,
    currency                TEXT          NOT NULL    DEFAULT 'GBP',
    order_status            TEXT          NOT NULL    DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
    payment_status          TEXT          NOT NULL    DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    created_at              timestamp     NOT NULL    DEFAULT now(),
    updated_at              timestamp     NOT NULL    DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon, service_role;

-- Add foreign key constraint to transactions table
ALTER TABLE public.transactions 
ADD CONSTRAINT fk_transactions_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Add unique constraint to transactions.order_id
ALTER TABLE public.transactions 
ADD CONSTRAINT unique_transaction_order_id UNIQUE (order_id);

-- 16) Order Items
CREATE TABLE public.order_items (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                UUID          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    partner_product_id      UUID          NOT NULL REFERENCES public.partner_products(id) ON DELETE RESTRICT,
    quantity                INTEGER       NOT NULL,
    price_at_purchase       NUMERIC       NOT NULL,
    admin_revenue_share     NUMERIC,
    partner_revenue_share   NUMERIC,
    created_at              timestamp   NOT NULL DEFAULT now(),
    updated_at              timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO anon, service_role;

-- 17) Shipping Details
CREATE TABLE public.shipping_details (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                UUID          NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    recipient_name          TEXT          NOT NULL,
    address_line1           TEXT          NOT NULL,
    address_line2           TEXT,
    city                    TEXT          NOT NULL,
    state_province          TEXT,
    postal_code             TEXT          NOT NULL,
    country                 TEXT          NOT NULL,
    phone_number            TEXT,
    shipping_cost           NUMERIC       NOT NULL DEFAULT 0.00,
    shipping_method         TEXT          NOT NULL,
    estimated_delivery_date DATE,
    tracking_number         TEXT          UNIQUE,
    tracking_url            TEXT,
    shipped_at              timestamp,
    delivered_at            timestamp,
    created_at              timestamp   NOT NULL DEFAULT now(),
    updated_at              timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.shipping_details TO anon, service_role;

--- BLOG TABLES ---

-- 18) Blog Posts
CREATE TABLE public.blog_posts (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT        NOT NULL,
    slug          TEXT        NOT NULL UNIQUE, -- For clean URLs (e.g., /blog/my-awesome-post)
    excerpt       TEXT,                        -- A short summary of the post
    content_path  TEXT        NOT NULL UNIQUE, -- Path to the markdown file (e.g., 'posts/my-awesome-post.md')
    author_id     UUID        REFERENCES public.users(id) ON DELETE SET NULL, -- Link to the user who authored the post
    published_at  timestamp,                   -- When the post was published
    is_published  BOOLEAN     NOT NULL DEFAULT FALSE,
    seo_meta_title TEXT,                      -- For basic SEO meta tags
    seo_meta_description TEXT,                -- For basic SEO meta tags
    featured_image_url TEXT,                 -- URL for a featured image
    created_at    timestamp   NOT NULL DEFAULT now(),
    updated_at    timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, service_role; -- Publicly viewable
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO service_role; -- Only service_role (admin) can create/edit/delete

-- 19) Blog Post Categories
CREATE TABLE public.blog_post_categories (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT          NOT NULL UNIQUE,
    slug          TEXT          NOT NULL UNIQUE, -- For category URLs
    description   TEXT,
    created_at    timestamp   NOT NULL DEFAULT now(),
    updated_at    timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_post_categories TO anon, service_role;

-- 20) Junction table for many-to-many relationship between blog_posts and blog_post_categories
CREATE TABLE public.post_category_junction (
    post_id       UUID          NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    category_id   UUID          NOT NULL REFERENCES public.blog_post_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id) -- Composite primary key to ensure uniqueness
);
GRANT SELECT, INSERT, DELETE ON public.post_category_junction TO anon, service_role;

-- 21) User Consents
CREATE TABLE public.user_consents (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Link to the user who gave consent
    consent_timestamp   timestamp     NOT NULL DEFAULT now(), -- When consent was given/revoked
    consent_version     TEXT          NOT NULL, -- e.g., '1.0', '1.1' - to track changes in policy
    consent_type        TEXT          NOT NULL, -- e.g., 'cookies', 'terms_and_conditions', 'privacy_policy'
    agreed              BOOLEAN       NOT NULL DEFAULT TRUE, -- TRUE for agreement, FALSE for revocation
    ip_address          INET,                                 -- Optional: Record IP for audit trail
    user_agent          TEXT,                                 -- Optional: Record user agent for audit trail
    notes               TEXT,                                 -- Optional: Any additional notes about consent
    created_at          timestamp   NOT NULL DEFAULT now(),
    updated_at          timestamp   NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_consents_user_id ON public.user_consents (user_id);
CREATE INDEX idx_user_consents_consent_type ON public.user_consents (consent_type);

GRANT SELECT, INSERT ON public.user_consents TO anon, service_role; -- Users need to insert their consent
GRANT UPDATE ON public.user_consents TO service_role; -- Admin can update, but users should only insert new revocation records

--- TRIGGERS & FUNCTIONS FOR UPDATED_AT TIMESTAMPS ---

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

-- categories
DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
DROP FUNCTION IF EXISTS public.set_updated_at_categories();
CREATE FUNCTION public.set_updated_at_categories()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_categories();

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

-- patient_marker_values
DROP TRIGGER IF EXISTS trg_patient_marker_values_updated_at ON public.patient_marker_values;
DROP FUNCTION IF EXISTS public.set_updated_at_patient_marker_values();
CREATE FUNCTION public.set_updated_at_patient_marker_values()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_patient_marker_values_updated_at
  BEFORE UPDATE ON public.patient_marker_values
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_patient_marker_values();

-- partner_profiles
DROP TRIGGER IF EXISTS trg_partner_profiles_updated_at ON public.partner_profiles;
DROP FUNCTION IF EXISTS public.set_updated_at_partner_profiles();
CREATE FUNCTION public.set_updated_at_partner_profiles()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_partner_profiles_updated_at
  BEFORE UPDATE ON public.partner_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_partner_profiles();

-- admin_products
DROP TRIGGER IF EXISTS trg_admin_products_updated_at ON public.admin_products;
DROP FUNCTION IF EXISTS public.set_updated_at_admin_products();
CREATE FUNCTION public.set_updated_at_admin_products()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_admin_products_updated_at
  BEFORE UPDATE ON public.admin_products
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_admin_products();

-- partner_products
DROP TRIGGER IF EXISTS trg_partner_products_updated_at ON public.partner_products;
DROP FUNCTION IF EXISTS public.set_updated_at_partner_products();
CREATE FUNCTION public.set_updated_at_partner_products()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_partner_products_updated_at
  BEFORE UPDATE ON public.partner_products
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_partner_products();

-- carts
DROP TRIGGER IF EXISTS trg_carts_updated_at ON public.carts;
DROP FUNCTION IF EXISTS public.set_updated_at_carts();
CREATE FUNCTION public.set_updated_at_carts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_carts();

-- cart_items
DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON public.cart_items;
DROP FUNCTION IF EXISTS public.set_updated_at_cart_items();
CREATE FUNCTION public.set_updated_at_cart_items()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_cart_items();

-- orders
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
DROP FUNCTION IF EXISTS public.set_updated_at_orders();
CREATE FUNCTION public.set_updated_at_orders()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_orders();

-- order_items
DROP TRIGGER IF EXISTS trg_order_items_updated_at ON public.order_items;
DROP FUNCTION IF EXISTS public.set_updated_at_order_items();
CREATE FUNCTION public.set_updated_at_order_items()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_order_items_updated_at
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_order_items();

-- transactions
DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
DROP FUNCTION IF EXISTS public.set_updated_at_transactions();
CREATE FUNCTION public.set_updated_at_transactions()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_transactions();

-- shipping_details
DROP TRIGGER IF EXISTS trg_shipping_details_updated_at ON public.shipping_details;
DROP FUNCTION IF EXISTS public.set_updated_at_shipping_details();
CREATE FUNCTION public.set_updated_at_shipping_details()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_shipping_details_updated_at
  BEFORE UPDATE ON public.shipping_details
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_shipping_details();

-- blog_posts
DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON public.blog_posts;
DROP FUNCTION IF EXISTS public.set_updated_at_blog_posts();
CREATE FUNCTION public.set_updated_at_blog_posts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_blog_posts();

-- blog_post_categories
DROP TRIGGER IF EXISTS trg_blog_post_categories_updated_at ON public.blog_post_categories;
DROP FUNCTION IF EXISTS public.set_updated_at_blog_post_categories();
CREATE FUNCTION public.set_updated_at_blog_post_categories()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_blog_post_categories_updated_at
  BEFORE UPDATE ON public.blog_post_categories
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_blog_post_categories();

-- user_consents
DROP TRIGGER IF EXISTS trg_user_consents_updated_at ON public.user_consents;
DROP FUNCTION IF EXISTS public.set_updated_at_user_consents();
CREATE FUNCTION public.set_updated_at_user_consents()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_user_consents();

--- SPECIAL TRIGGERS ---

-- Trigger for auto-populating partner_name and partner_description
DROP FUNCTION IF EXISTS public.set_partner_product_defaults();
CREATE OR REPLACE FUNCTION public.set_partner_product_defaults()
RETURNS TRIGGER AS $$
DECLARE
    admin_prod_name TEXT;
    admin_prod_description TEXT;
BEGIN
    -- Fetch the name and description from admin_products based on admin_product_id
    SELECT
        ap.name,
        ap.description
    INTO
        admin_prod_name,
        admin_prod_description
    FROM
        public.admin_products AS ap
    WHERE
        ap.id = NEW.admin_product_id;

    -- If partner_name is NOT explicitly provided by the insert, use the admin_product's name
    IF NEW.partner_name IS NULL THEN
        NEW.partner_name := admin_prod_name;
    END IF;

    -- If partner_description is NOT explicitly provided by the insert, use the admin_product's description
    IF NEW.partner_description IS NULL THEN
        NEW.partner_description := admin_prod_description;
    END IF;

    RETURN NEW; -- Return the modified new row for insertion
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function before inserting into partner_products
DROP TRIGGER IF EXISTS set_partner_product_defaults_trigger ON public.partner_products;
CREATE TRIGGER set_partner_product_defaults_trigger
BEFORE INSERT ON public.partner_products
FOR EACH ROW
EXECUTE FUNCTION public.set_partner_product_defaults();

--- ROW LEVEL SECURITY (RLS) POLICIES ---

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_marker_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_category_junction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is partner
CREATE OR REPLACE FUNCTION public.is_partner()
RETURNS BOOLEAN AS $
BEGIN
  RETURN (
    SELECT role = 'partner' 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get partner profile ID for current user
CREATE OR REPLACE FUNCTION public.get_partner_id()
RETURNS UUID AS $
BEGIN
  RETURN (
    SELECT id 
    FROM public.partner_profiles 
    WHERE user_id = auth.uid()
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

--- USERS TABLE RLS ---
-- Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile, admins can update all
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Only admins can insert users (registration handled separately)
CREATE POLICY "Only admins can insert users" ON public.users
  FOR INSERT WITH CHECK (public.is_admin());

--- CATEGORIES TABLE RLS ---
-- Everyone can read categories
CREATE POLICY "Categories are publicly readable" ON public.categories
  FOR SELECT USING (true);

-- Only admins can modify categories
CREATE POLICY "Only admins can modify categories" ON public.categories
  FOR ALL USING (public.is_admin());

--- PANELS TABLE RLS ---
-- Everyone can read panels
CREATE POLICY "Panels are publicly readable" ON public.panels
  FOR SELECT USING (true);

-- Only admins can modify panels
CREATE POLICY "Only admins can modify panels" ON public.panels
  FOR ALL USING (public.is_admin());

--- UPLOADS TABLE RLS ---
-- Users can view their own uploads or uploads they're associated with
CREATE POLICY "Users can view own uploads" ON public.uploads
  FOR SELECT USING (
    auth.uid() = admin_user_id OR 
    auth.uid() = client_user_id OR 
    public.is_admin()
  );

-- Admins can insert uploads, clients can be assigned uploads
CREATE POLICY "Admins can manage uploads" ON public.uploads
  FOR ALL USING (public.is_admin());

--- MARKERS TABLE RLS ---
-- Everyone can read markers
CREATE POLICY "Markers are publicly readable" ON public.markers
  FOR SELECT USING (true);

-- Only admins can modify markers
CREATE POLICY "Only admins can modify markers" ON public.markers
  FOR ALL USING (public.is_admin());

--- PATIENT MARKER VALUES TABLE RLS ---
-- Users can view their own marker values, admins can view all
CREATE POLICY "Users can view own marker values" ON public.patient_marker_values
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Only admins can insert marker values
CREATE POLICY "Only admins can insert marker values" ON public.patient_marker_values
  FOR INSERT WITH CHECK (public.is_admin());

-- Admins can update/delete marker values
CREATE POLICY "Only admins can modify marker values" ON public.patient_marker_values
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Only admins can delete marker values" ON public.patient_marker_values
  FOR DELETE USING (public.is_admin());

--- PDF REPORTS TABLE RLS ---
-- Users can view their own reports, admins can view all
CREATE POLICY "Users can view own reports" ON public.pdf_reports
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Only admins can manage reports
CREATE POLICY "Only admins can manage reports" ON public.pdf_reports
  FOR ALL USING (public.is_admin());

--- PARTNER PROFILES TABLE RLS ---
-- Partners can view their own profile, admins can view all
CREATE POLICY "Partners can view own profile" ON public.partner_profiles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Partners can update their own profile (except approval status), admins can update all
CREATE POLICY "Partners can update own profile" ON public.partner_profiles
  FOR UPDATE USING (
    (auth.uid() = user_id AND partner_status = OLD.partner_status) OR 
    public.is_admin()
  );

-- Anyone can apply to be a partner
CREATE POLICY "Anyone can apply as partner" ON public.partner_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

--- ADMIN PRODUCTS TABLE RLS ---
-- Everyone can read admin products
CREATE POLICY "Admin products are publicly readable" ON public.admin_products
  FOR SELECT USING (true);

-- Only admins can modify admin products
CREATE POLICY "Only admins can modify admin products" ON public.admin_products
  FOR ALL USING (public.is_admin());

--- PARTNER PRODUCTS TABLE RLS ---
-- Everyone can read active partner products
CREATE POLICY "Active partner products are publicly readable" ON public.partner_products
  FOR SELECT USING (is_active = true OR auth.uid() IN (
    SELECT user_id FROM public.partner_profiles WHERE id = partner_id
  ) OR public.is_admin());

-- Partners can manage their own products
CREATE POLICY "Partners can manage own products" ON public.partner_products
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.partner_profiles WHERE id = partner_id
    ) OR public.is_admin()
  );

--- CARTS TABLE RLS ---
-- Users can only access their own cart
CREATE POLICY "Users can access own cart" ON public.carts
  FOR ALL USING (auth.uid() = user_id);

--- CART ITEMS TABLE RLS ---
-- Users can only access items in their own cart
CREATE POLICY "Users can access own cart items" ON public.cart_items
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.carts WHERE id = cart_id
    )
  );

--- ORDERS TABLE RLS ---
-- Customers can view their own orders, partners can view orders for their products, admins can view all
CREATE POLICY "Users can view relevant orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = customer_user_id OR
    auth.uid() IN (
      SELECT user_id FROM public.partner_profiles WHERE id = partner_id
    ) OR
    public.is_admin()
  );

-- Only customers can create orders for themselves
CREATE POLICY "Customers can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_user_id);

-- Partners can update their orders (status changes), admins can update all
CREATE POLICY "Partners and admins can update orders" ON public.orders
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.partner_profiles WHERE id = partner_id
    ) OR public.is_admin()
  );

--- ORDER ITEMS TABLE RLS ---
-- Users can view order items for orders they have access to
CREATE POLICY "Users can view accessible order items" ON public.order_items
  FOR SELECT USING (
    auth.uid() IN (
      SELECT customer_user_id FROM public.orders WHERE id = order_id
    ) OR
    auth.uid() IN (
      SELECT pp.user_id FROM public.partner_profiles pp
      JOIN public.orders o ON pp.id = o.partner_id
      WHERE o.id = order_id
    ) OR
    public.is_admin()
  );

-- Only admins can modify order items
CREATE POLICY "Only admins can modify order items" ON public.order_items
  FOR ALL USING (public.is_admin());

--- TRANSACTIONS TABLE RLS ---
-- Users can view their own transactions, partners can view transactions for their orders, admins can view all
CREATE POLICY "Users can view relevant transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT pp.user_id FROM public.partner_profiles pp
      JOIN public.orders o ON pp.id = o.partner_id
      WHERE o.id = order_id
    ) OR
    public.is_admin()
  );

-- Only service can insert transactions (payment processing)
CREATE POLICY "Only service can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR public.is_admin());

-- Only admins and service can update transactions
CREATE POLICY "Only service and admins can update transactions" ON public.transactions
  FOR UPDATE USING (auth.role() = 'service_role' OR public.is_admin());

--- SHIPPING DETAILS TABLE RLS ---
-- Same access as orders
CREATE POLICY "Users can view relevant shipping details" ON public.shipping_details
  FOR SELECT USING (
    auth.uid() IN (
      SELECT customer_user_id FROM public.orders WHERE id = order_id
    ) OR
    auth.uid() IN (
      SELECT pp.user_id FROM public.partner_profiles pp
      JOIN public.orders o ON pp.id = o.partner_id
      WHERE o.id = order_id
    ) OR
    public.is_admin()
  );

-- Partners and admins can update shipping details
CREATE POLICY "Partners and admins can update shipping" ON public.shipping_details
  FOR ALL USING (
    auth.uid() IN (
      SELECT pp.user_id FROM public.partner_profiles pp
      JOIN public.orders o ON pp.id = o.partner_id
      WHERE o.id = order_id
    ) OR public.is_admin()
  );

--- BLOG POSTS TABLE RLS ---
-- Everyone can read published blog posts
CREATE POLICY "Published blog posts are publicly readable" ON public.blog_posts
  FOR SELECT USING (is_published = true OR public.is_admin());

-- Only admins can manage blog posts
CREATE POLICY "Only admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (public.is_admin());

--- BLOG POST CATEGORIES TABLE RLS ---
-- Everyone can read blog categories
CREATE POLICY "Blog categories are publicly readable" ON public.blog_post_categories
  FOR SELECT USING (true);

-- Only admins can modify blog categories
CREATE POLICY "Only admins can modify blog categories" ON public.blog_post_categories
  FOR ALL USING (public.is_admin());

--- POST CATEGORY JUNCTION TABLE RLS ---
-- Everyone can read the junction (for published posts)
CREATE POLICY "Post category junction is publicly readable" ON public.post_category_junction
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM public.blog_posts WHERE is_published = true
    ) OR public.is_admin()
  );

-- Only admins can modify the junction
CREATE POLICY "Only admins can modify post category junction" ON public.post_category_junction
  FOR ALL USING (public.is_admin());

--- USER CONSENTS TABLE RLS ---
-- Users can view their own consents, admins can view all
CREATE POLICY "Users can view own consents" ON public.user_consents
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Users can insert their own consents
CREATE POLICY "Users can insert own consents" ON public.user_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can update consents (for audit purposes)
CREATE POLICY "Only admins can update consents" ON public.user_consents
  FOR UPDATE USING (public.is_admin());