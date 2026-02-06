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
