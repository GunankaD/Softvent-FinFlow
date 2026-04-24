// ANGULAR
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ENDPOINTS
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

// DTOs
import {
  PaymentApplicationRequest,
  PaymentApplicationResponse
} from '../../models/transaction.payment-application.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentApplicationService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  public applyPayment(
    request: PaymentApplicationRequest
  ): Observable<PaymentApplicationResponse> {
    return this.http.post<PaymentApplicationResponse>(
      `${this.baseUrl}${API_ENDPOINTS.PAYMENT_APPLICATIONS.APPLY}`,
      request
    );
  }
}