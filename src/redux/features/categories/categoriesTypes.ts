export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategory {
  name: string;
  description?: string;
}

export interface UpdateCategory {
  id: string;
  name?: string;
  description?: string;
}