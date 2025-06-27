export interface Upload {
  id: string;
  admin_user_id: string;
  client_user_id: string;
  filename: string;
  created_at: string;
  updated_at: string;
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
