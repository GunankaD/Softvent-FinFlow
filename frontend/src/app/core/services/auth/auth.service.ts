import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// APIs
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

// DTOs
import { 
  LoginRequest, 
  SignupRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResetPasswordEmailResponse
} from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // login service
  login(request: LoginRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
      request
    );
  }

  // signup service
  signup(request: SignupRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.SIGNUP}`,
      request
    );
  }

  // forgot password service
  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`,
      request
    );
  }

  // reset password service
  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`,
      request
    );
  }

  // request email for a specific reset password token
  getEmailForToken(token: string): Observable<ResetPasswordEmailResponse> {
    return this.http.get<ResetPasswordEmailResponse>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.EMAIL_FOR_TOKEN}/${token}`
    );
  }
}
