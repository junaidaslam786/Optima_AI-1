// types/db.ts

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  dob?: string;
  address?: string;
  subscription?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUser {
  email: string;
  password_hash: string;
  name: string;
  role: string;
  dob?: string;
  address?: string;
  subscription?: string;
  phone?: string;
}

export interface UpdateUser {
  id: string;
  email?: string;
  password_hash?: string;
  name?: string;
  role?: string;
  dob?: string;
  address?: string;
  subscription?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Panel {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePanel {
  name: string;
  description?: string;
}

export interface UpdatePanel {
  id: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Upload {
  id: string;
  admin_user_id: string;
  client_user_id: string;
  filename: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUpload {
  admin_user_id: string;
  client_user_id: string;
  filename: string;
}

export interface UpdateUpload {
  id: string;
  admin_user_id?: string;
  client_user_id?: string;
  filename?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Marker {
  id: string;
  csvfile_id: string;
  user_id: string;
  panel_id: string;
  col_date: string;
  rep_date: string;
  marker: string;
  value: number;
  unit: string;
  normal_low?: number;
  normal_high?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMarker {
  csvfile_id: string;
  user_id: string;
  panel_id: string;
  col_date: string;
  rep_date: string;
  marker: string;
  value: number;
  unit: string;
  normal_low?: number;
  normal_high?: number;
  status: string;
}

export interface UpdateMarker {
  id: string;
  csvfile_id?: string;
  user_id?: string;
  panel_id?: string;
  col_date?: string;
  rep_date?: string;
  marker?: string;
  value?: number;
  unit?: string;
  normal_low?: number;
  normal_high?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PdfReport {
  id: string;
  user_id: string;
  panel_id: string;
  report_url: string;
  generated_at: string;
}

export interface CreatePdfReport {
  user_id: string;
  panel_id: string;
  report_url: string;
}

export interface UpdatePdfReport {
  id: string;
  user_id?: string;
  panel_id?: string;
  report_url?: string;
  generated_at?: string;
}

export interface PartnerProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_slug: string;
  company_description?: string;
  contact_person_name?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  country?: string;
  partner_status:
    | "pending"
    | "approved"
    | "rejected"
    | "suspended"
    | "deactivated";
  approval_date?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerProfile {
  user_id: string;
  company_name: string;
  company_slug: string;
  company_description?: string;
  contact_person_name?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  country?: string;
  partner_status:
    | "pending"
    | "approved"
    | "rejected"
    | "suspended"
    | "deactivated";
  approval_date?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface UpdatePartnerProfile {
  id: string;
  user_id?: string;
  company_name?: string;
  company_slug?: string;
  company_description?: string;
  contact_person_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  country?: string;
  partner_status?:
    | "pending"
    | "approved"
    | "rejected"
    | "suspended"
    | "deactivated";
  approval_date?: string;
  rejection_reason?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  sku?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  stock_quantity: number;
  is_active: boolean;
  admin_user_id?: string;
  manufacturer?: string;
  model_number?: string;
  intended_use?: string;
  test_type?: string;
  sample_type?: string[];
  results_time?: string;
  storage_conditions?: string;
  regulatory_approvals?: string[];
  kit_contents_summary?: string;
  user_manual_url?: string;
  warnings_and_precautions?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateAdminProduct {
  name: string;
  description?: string;
  base_price: number;
  sku?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  stock_quantity: number;
  is_active: boolean;
  admin_user_id?: string;
  manufacturer?: string;
  model_number?: string;
  intended_use?: string;
  test_type?: string;
  sample_type?: string[];
  results_time?: string;
  storage_conditions?: string;
  regulatory_approvals?: string[];
  kit_contents_summary?: string;
  user_manual_url?: string;
  warnings_and_precautions?: string[];
}

export interface UpdateAdminProduct {
  id: string;
  name?: string;
  description?: string;
  base_price?: number;
  sku?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  stock_quantity?: number;
  is_active?: boolean;
  admin_user_id?: string;
  manufacturer?: string;
  model_number?: string;
  intended_use?: string;
  test_type?: string;
  sample_type?: string[];
  results_time?: string;
  storage_conditions?: string;
  regulatory_approvals?: string[];
  kit_contents_summary?: string;
  user_manual_url?: string;
  warnings_and_precautions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AdminProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  sort_order?: number;
  is_thumbnail: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminProductImage {
  product_id: string;
  image_url: string;
  alt_text?: string;
  sort_order?: number;
  is_thumbnail: boolean;
}

export interface UpdateAdminProductImage {
  id: string;
  product_id?: string;
  image_url?: string;
  alt_text?: string;
  sort_order?: number;
  is_thumbnail?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PartnerProduct {
  id: string;
  partner_id: string;
  admin_product_id: string;
  partner_price: number;
  partner_name?: string;
  partner_description?: string;
  partner_keywords?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerProduct {
  partner_id: string;
  admin_product_id: string;
  partner_price: number;
  partner_name?: string;
  partner_description?: string;
  partner_keywords?: string[];
  is_active: boolean;
}

export interface UpdatePartnerProduct {
  id: string;
  partner_id?: string;
  admin_product_id?: string;
  partner_price?: number;
  partner_name?: string;
  partner_description?: string;
  partner_keywords?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PartnerProductImage {
  id: string;
  partner_product_id: string;
  image_url: string;
  alt_text?: string;
  sort_order?: number;
  is_thumbnail: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerProductImage {
  partner_product_id: string;
  image_url: string;
  alt_text?: string;
  sort_order?: number;
  is_thumbnail: boolean;
}

export interface UpdatePartnerProductImage {
  id: string;
  partner_product_id?: string;
  image_url?: string;
  alt_text?: string;
  sort_order?: number;
  is_thumbnail?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  customer_user_id: string;
  partner_id: string;
  order_date: string;
  total_amount: number;
  currency: string;
  order_status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  shipping_address?: string;
  billing_address?: string;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  shipping_method?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrder {
  customer_user_id: string;
  partner_id: string;
  order_date: string;
  total_amount: number;
  currency: string;
  order_status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  shipping_address?: string;
  billing_address?: string;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  shipping_method?: string;
  tracking_number?: string;
}

export interface UpdateOrder {
  id: string;
  customer_user_id?: string;
  partner_id?: string;
  order_date?: string;
  total_amount?: number;
  currency?: string;
  order_status?:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  shipping_address?: string;
  billing_address?: string;
  payment_status?: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  shipping_method?: string;
  tracking_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  partner_product_id: string;
  quantity: number;
  price_at_purchase: number;
  admin_revenue_share?: number;
  partner_revenue_share?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderItem {
  order_id: string;
  partner_product_id: string;
  quantity: number;
  price_at_purchase: number;
  admin_revenue_share?: number;
  partner_revenue_share?: number;
}

export interface UpdateOrderItem {
  id: string;
  order_id?: string;
  partner_product_id?: string;
  quantity?: number;
  price_at_purchase?: number;
  admin_revenue_share?: number;
  partner_revenue_share?: number;
  created_at?: string;
  updated_at?: string;
}

export type PartnerProductWithDetails = PartnerProduct & {
  partner_profiles: { company_name: string } | null;
  admin_products: { name: string; base_price: number } | null;
};

export type OrderWithDetails = Order & {
  users: { name?: string; email: string } | null;
  partner_profiles: { company_name: string } | null;
};

export type OrderItemWithProductDetails = OrderItem & {
  partner_products: { name: string; partner_price: number } | null;
};
