export interface PartnerProduct {
  id: string; // UUID
  partner_id: string; // UUID, FK to partner_profiles
  admin_product_id: string; // UUID, FK to admin_products
  partner_price: number; // NUMERIC
  partner_name?: string; // TEXT (optional, auto-filled by trigger)
  partner_description?: string; // TEXT (optional, auto-filled by trigger)
  partner_keywords?: string[]; // TEXT[]
  is_active: boolean;
  product_image_urls?: string[]; // TEXT[]
  thumbnail_url?: string; // TEXT
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
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
  partner_id?: string;
  admin_product_id?: string;
  partner_price?: number;
  partner_name?: string;
  partner_description?: string;
  partner_keywords?: string[];
  is_active?: boolean;
  product_image_urls?: string[];
  thumbnail_url?: string;
}

export interface PartnerProductImages {
  id: string;
  product_image_urls?: string[];
  thumbnail_url?: string;
}
