export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogCategory {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateBlogCategory {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
}