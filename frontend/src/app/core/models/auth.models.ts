export interface LoginRequest {
  emailid: string;
  password: string;
}

export interface SignupRequest {
  emailid: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
}

export interface ForgotPasswordRequest {
  emailid: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

