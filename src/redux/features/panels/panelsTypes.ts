export interface Panel {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePanel {
  name: string;
  description?: string;
  category_id?: string;
}

export interface UpdatePanel {
  id: string;
  name?: string;
  description?: string;
  category_id?: string;
}