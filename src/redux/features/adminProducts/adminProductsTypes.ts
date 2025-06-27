export interface AdminProduct {
  id: string; // UUID
  name: string;
  description?: string;
  base_price: number; // NUMERIC
  sku?: string; // TEXT UNIQUE
  category_ids?: string[]; // UUID[]
  intended_use?: string;
  test_type?: string; // VARCHAR(100)
  marker_ids?: string[]; // UUID[]
  result_timeline?: string; // VARCHAR(50)
  additional_test_information?: string;
  corresponding_panels?: string[]; // UUID[]
  admin_user_id?: string; // UUID, FK to users (ON DELETE SET NULL)
  product_image_urls?: string[]; // TEXT[] (up to 4)
  thumbnail_url?: string; // TEXT
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
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
  admin_user_id?: string;
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
