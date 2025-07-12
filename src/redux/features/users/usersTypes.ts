export interface User {
  id: string;
  email: string;
  password_hash?: string;
  name?: string;
  role: string;
  dob?: string;
  address?: string;
  subscription?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUser {
  email: string;
  password_hash?: string;
  name?: string;
  role?: string;
  dob?: string;
  address?: string;
  subscription?: string;
  phone?: string;
}

export interface UpdateUser {
  id: string;
  email?: string;
  password_hash?: string;
  name?: string;
  role?: string;
  dob?: string;
  address?: string;
  subscription?: string;
  phone?: string;
}
