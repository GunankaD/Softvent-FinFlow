import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { 
  LoginRequest, 
  SignupRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

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
}
