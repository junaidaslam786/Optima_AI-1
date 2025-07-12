import { User } from "../users/usersTypes";
import { PartnerProfile } from "../partnerProfiles/partnerProfilesTypes";
import { OrderItem } from "../orderItems/orderItemsTypes";
import { ShippingDetails } from "../shippingDetails/shippingDetailsTypes";
import { Transaction } from "../transactions/transactionsTypes";

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
  payment_status: "pending" | "paid" | "failed" | "refunded";
  primary_transaction_id?: string;
  created_at: string;
  updated_at: string;
  users?: User;
  partner_profiles?: PartnerProfile;
  order_items?: OrderItem[];
  shipping_details?: ShippingDetails;
  transactions?: Transaction;
}

export interface CreateOrder {
  cart_id: string;
  user_email: string;
  user_name?: string;
  shipping_details: {
    recipient_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state_province?: string;
    postal_code: string;
    country: string;
    phone_number?: string;
    shipping_cost?: number;
    shipping_method?: string;
  };
  payment_method_id: string;
  partner_id: string;
}

export interface UpdateOrder {
  id: string;
  order_status?:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  payment_status?: "pending" | "paid" | "failed" | "refunded";
  tracking_number?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  clientSecret?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  error?: string;
}
