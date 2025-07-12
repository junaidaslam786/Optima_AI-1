export interface ShippingDetails {
    id: string;
    order_id: string;
    recipient_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state_province?: string;
    postal_code: string;
    country: string;
    phone_number?: string;
    shipping_cost: number;
    shipping_method: string;
    estimated_delivery_date?: string;
    tracking_number?: string;
    tracking_url?: string;
    shipped_at?: string;
    delivered_at?: string;
    created_at: string;
    updated_at: string;
}

export interface UpdateShippingDetails {
    id: string;
    recipient_name?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state_province?: string;
    postal_code?: string;
    country?: string;
    phone_number?: string;
    shipping_cost?: number;
    shipping_method?: string;
    estimated_delivery_date?: string;
    tracking_number?: string;
    tracking_url?: string;
    shipped_at?: string;
    delivered_at?: string;
}
