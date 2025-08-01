export interface AdminProduct {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  sku?: string;
  category_ids: string[];
  intended_use?: string;
  test_type?: string;
  marker_ids: string[];
  result_timeline?: string;
  additional_test_information?: string;
  corresponding_panels: string[];
  admin_user_id?: string;
  product_image_urls?: string[];
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminProduct {
  name: string;
  description?: string;
  base_price: number;
  sku?: string;
  category_ids?: string[];
  intended_use?: string;
  test_type?: string;
  marker_ids?: string[];
  result_timeline?: string;
  additional_test_information?: string;
  corresponding_panels?: string[];
  admin_user_id: string;
}

export interface UpdateAdminProduct {
  id: string;
  name?: string;
  description?: string;
  base_price?: number;
  sku?: string;
  category_ids?: string[];
  intended_use?: string;
  test_type?: string;
  marker_ids?: string[];
  result_timeline?: string;
  additional_test_information?: string;
  corresponding_panels?: string[];
  admin_user_id?: string;
  product_image_urls?: string[];
  thumbnail_url?: string;
}