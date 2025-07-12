import { PartnerProduct } from "../partnerProducts/partnerProductsTypes";

export interface CartItem {
    id: string;
    cart_id: string;
    partner_product_id: string;
    quantity: number;
    price_at_addition: number;
    created_at: string;
    updated_at: string;
    partner_products?: PartnerProduct;
}

export interface CreateCartItem {
    user_id: string;
    partner_product_id: string;
    quantity: number;
}

export interface UpdateCartItem {
    id: string;
    quantity: number;
}
