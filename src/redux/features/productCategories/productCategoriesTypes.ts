export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
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
