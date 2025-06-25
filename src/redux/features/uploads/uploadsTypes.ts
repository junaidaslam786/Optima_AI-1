export interface Upload {
  id: string; // UUID
  admin_user_id: string; // UUID, FK to users
  client_user_id: string; // UUID, FK to users
  filename: string;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface CreateUpload {
  admin_user_id: string;
  client_user_id: string;
  filename: string;
}

export interface UpdateUpload {
  id: string;
  admin_user_id?: string;
  client_user_id?: string;
  filename?: string;
}
