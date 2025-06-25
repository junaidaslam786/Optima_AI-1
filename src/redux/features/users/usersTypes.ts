// Base User Interface (matches database schema)
export interface User {
  id: string; // UUID
  email: string;
  password_hash: string;
  name: string;
  role: "client" | "admin" | "partner"; // Assuming 'partner' role can be added
  dob?: string; // DATE type, often represented as string 'YYYY-MM-DD'
  address?: string;
  subscription?: string;
  phone?: string;
  created_at: string; // TIMESTAMPTZ, represented as string
  updated_at: string; // TIMESTAMPTZ, represented as string
}

// Interface for creating a new user (omits auto-generated fields)
export interface CreateUser {
  email: string;
  password_hash: string;
  name: string;
  role?: "client" | "admin" | "partner";
  dob?: string;
  address?: string;
  subscription?: string;
  phone?: string;
}

// Interface for updating an existing user (all fields optional except id)
export interface UpdateUser {
  id: string;
  email?: string;
  password_hash?: string;
  name?: string;
  role?: "client" | "admin" | "partner";
  dob?: string;
  address?: string;
  subscription?: string;
  phone?: string;
}
