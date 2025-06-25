export interface Order {
  id: string; // UUID
  customer_user_id: string; // UUID, FK to users
  partner_id: string; // UUID, FK to partner_profiles
  order_date: string; // TIMESTAMPTZ
  total_amount: number; // NUMERIC
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
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface CreateOrder {
  customer_user_id: string;
  partner_id: string;
  order_date?: string; // Default now()
  total_amount: number;
  currency?: string; // Default 'GBP'
  order_status?:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded"; // Default 'pending'
  shipping_address?: string;
  billing_address?: string;
  payment_status?: "pending" | "paid" | "failed" | "refunded"; // Default 'pending'
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
}
