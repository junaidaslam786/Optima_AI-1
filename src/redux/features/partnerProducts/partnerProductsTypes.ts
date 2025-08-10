import { AdminProduct } from "../adminProducts/adminProductsTypes";
import { PartnerProfile } from "../partnerProfiles/partnerProfilesTypes";

export interface PartnerProduct {
  id: string;
  partner_id: string;
  admin_product_id: string;
  partner_price: number;
  partner_name?: string;
  partner_description?: string;
  partner_keywords?: string[];
  is_active: boolean;
  product_image_urls?: string[];
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  admin_product?: AdminProduct;
  partner_profiles?: PartnerProfile;
}

export interface CreatePartnerProduct {
  partner_id: string;
  admin_product_id: string;
  partner_price: number;
  partner_name?: string;
  partner_description?: string;
  partner_keywords?: string[];
  is_active?: boolean;
}

export interface UpdatePartnerProduct {
  id: string;
  partner_price?: number;
  partner_name?: string;
  partner_description?: string;
  partner_keywords?: string[];
  is_active?: boolean;
  product_image_urls?: string[];
  thumbnail_url?: string;
}
