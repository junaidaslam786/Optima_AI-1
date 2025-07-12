import { PartnerProduct } from "../partnerProducts/partnerProductsTypes";

export interface OrderItem {
  id: string;
  order_id: string; // UUID of order
  partner_product_id: string; // UUID of partner_product
  quantity: number;
  price_at_purchase: number;
  admin_revenue_share?: number;
  partner_revenue_share?: number;
  created_at: string;
  updated_at: string;
  partner_products?: PartnerProduct; // Nested product details
}

export interface UpdateOrderItem {
  id: string;
  quantity?: number;
  price_at_purchase?: number;
  admin_revenue_share?: number;
  partner_revenue_share?: number;
}
