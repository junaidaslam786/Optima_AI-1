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
    category_id   UUID          REFERENCES public.categories(id) ON DELETE SET NULL, -- Updated reference
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

-- 6) Markers (Modified)
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

-- 7) Patient Marker Values (New Table)
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

--- NEW E-COMMERCE TABLES ---

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

-- 10) Admin Products (Base Products) (Modified)
CREATE TABLE public.admin_products (
    id                       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name                     TEXT          NOT NULL,
    description              TEXT,
    base_price               NUMERIC       NOT NULL,
    sku                      TEXT          UNIQUE,
    category_ids             UUID[],        -- Array of categories.id (Updated reference)
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

-- 11) Partner Products (Partner's custom listings of admin products) (Modified)
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

-- 12) Carts (Modified to link directly to user_id)
CREATE TABLE public.carts (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID          NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE, -- Must be linked to a user
    created_at    timestamp   NOT NULL DEFAULT now(),
    updated_at    timestamp   NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO anon, service_role;

-- 13) Cart Items
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

-- 14) Orders (Modified to simplify address/payment fields, relying on new tables)
CREATE TABLE public.orders (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_user_id        UUID          NOT NULL    REFERENCES public.users(id) ON DELETE RESTRICT,
    partner_id              UUID          NOT NULL    REFERENCES public.partner_profiles(id) ON DELETE RESTRICT,
    primary_transaction_id  UUID          NOT NULL    REFERENCES public.transactions(id);
    order_date              timestamp     NOT NULL    DEFAULT now(),
    total_amount            NUMERIC       NOT NULL,
    currency                TEXT          NOT NULL    DEFAULT 'GBP',
    order_status            TEXT          NOT NULL    DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
    payment_status          TEXT          NOT NULL    DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    created_at              timestamp     NOT NULL    DEFAULT now(),
    updated_at              timestamp     NOT NULL    DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon, service_role;

-- 15) Order Items
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

-- 16) Transactions
CREATE TABLE public.transactions (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id              UUID          NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE, -- Each order has one primary transaction
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


--- Triggers & functions for updated_at timestamps ---

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

-- categories (Renamed from product_categories)
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


--- NEW: Trigger for auto-populating partner_name and partner_description ---

-- Function to automatically set partner_product_defaults
DROP FUNCTION IF EXISTS public.set_partner_product_defaults(); -- Drop if exists for clean update
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
DROP TRIGGER IF EXISTS set_partner_product_defaults_trigger ON public.partner_products; -- Drop if exists for clean update
CREATE TRIGGER set_partner_product_defaults_trigger
BEFORE INSERT ON public.partner_products
FOR EACH ROW
EXECUTE FUNCTION public.set_partner_product_defaults();