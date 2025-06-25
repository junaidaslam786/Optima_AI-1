export interface OrderItem {
  id: string; // UUID
  order_id: string; // UUID, FK to orders
  partner_product_id: string; // UUID, FK to partner_products
  quantity: number; // INTEGER
  price_at_purchase: number; // NUMERIC
  admin_revenue_share?: number; // NUMERIC
  partner_revenue_share?: number; // NUMERIC
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
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
}
