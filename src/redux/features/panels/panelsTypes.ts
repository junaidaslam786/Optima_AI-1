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
  category_id?: string;
  description?: string;
}

export interface UpdatePanel {
  id: string;
  name?: string;
  category_id?: string;
  description?: string;
}
