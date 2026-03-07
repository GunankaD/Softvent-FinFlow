import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

// APIs
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

// DTOs
import { 
  LoginRequest, 
  SignupInitRequest,
  SignupVerifyRequest,
  SignupVerifyResponse,
  SignupCompleteRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResetPasswordEmailResponse,
  LoginResponse
} from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // STATE
  private accessToken: string | null = null;
  private userEmail: string | null = null;

  // LOGIN SERVICE
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
      request,
      { withCredentials: true }
    );
  }

  // LOGOUT SERVICE
  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.LOGOUT}`,
      {}, // browser automatically attaches the cookie
      { withCredentials: true } // this tells the browser to attach the cookie
    );
  }

  // SESSION MANAGEMENT SERVICES
  setSession(response: LoginResponse): void {
    this.accessToken = response.accessToken;
    this.userEmail = response.email;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUserEmail(): string | null {
    return this.userEmail;
  }

  clearSession(): void {
    this.accessToken = null;
    this.userEmail = null;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  // REFRESH FOR NEW ACCESS TOKEN
  refresh(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
      {}, // browser automatically attaches the cookie
      { withCredentials: true } // this tells the browser to attach the cookie
    );
  }

  // SIGNUP SERVICE
  signupInit(request: SignupInitRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.SIGNUP_INIT}`,
      request
    );
  }

  signupVerify(request: SignupVerifyRequest): Observable<SignupVerifyResponse> {
    return this.http.post<SignupVerifyResponse>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.SIGNUP_VERIFY}`,
      request
    );
  }

  signupComplete(request: SignupCompleteRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.SIGNUP_COMPLETE}`,
      request
    );
  }

  // FORGOT PASSWORD SERVICE
  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`,
      request
    );
  }

  // RESET PASSWORD SERVICE
  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`,
      request
    );
  }

  // REQUEST EMAIL FOR SIGNUP PAGE THROUGH URL TOKEN
  getEmailForToken(token: string): Observable<ResetPasswordEmailResponse> {
    return this.http.get<ResetPasswordEmailResponse>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.EMAIL_FOR_TOKEN}/${token}`
    );
  }
}
