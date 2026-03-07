export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordEmailResponse{
  email: string;
}

export interface SignupInitRequest {
  email: string;
}

export interface SignupVerifyRequest {
  email: string;
  otp: string;
}

export interface SignupVerifyResponse {
  verificationToken: string;
}

export interface SignupCompleteRequest {
  verificationToken: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
}