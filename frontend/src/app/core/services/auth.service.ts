import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { LoginRequest, SignupRequest } from '../models/auth.models';

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
}
