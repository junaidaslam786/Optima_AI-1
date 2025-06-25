export interface ProductCategory {
  id: string; // UUID
  name: string;
  description?: string;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface CreateProductCategory {
  name: string;
  description?: string;
}

export interface UpdateProductCategory {
  id: string;
  name?: string;
  description?: string;
}
