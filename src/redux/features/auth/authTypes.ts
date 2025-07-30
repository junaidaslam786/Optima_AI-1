export interface ForgotPasswordRequest {
  email: string;
  redirectTo?: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
  accessToken: string;
}

export interface ChangePasswordResponse {
  message: string;
  user?: {
    id: string;
    email: string;
  };
}
