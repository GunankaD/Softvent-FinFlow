import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';

// APIs
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

// DTOs
import {
  CustomerCreateRequest,
  CustomerSummaryResponse,
  CustomerDetailResponse,
  AvailabilityResponse,
  CustomerUpdateRequest
} from '../../models/customer.models'

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // GET CUSTOMERS
  getAll(): Observable<CustomerSummaryResponse[]> {
    return this.http.get<CustomerSummaryResponse[]>(`${this.baseUrl}${API_ENDPOINTS.CUSTOMERS.BASE}`);
  }

  // GET customers by code: Full details
  getByCode(ccode: string): Observable<CustomerDetailResponse> {
    return this.http.get<CustomerDetailResponse>(
      `${this.baseUrl}${API_ENDPOINTS.CUSTOMERS.BY_CCODE(ccode)}`
    );
  }

  // POST CUSTOMERS
  create(request: CustomerCreateRequest): Observable<CustomerSummaryResponse> {
    return this.http.post<CustomerSummaryResponse>(`${this.baseUrl}${API_ENDPOINTS.CUSTOMERS.BASE}`, request);
  }

  // PUT CUSTOMERS
  updateByCode(ccode: string, request: CustomerUpdateRequest): Observable<CustomerDetailResponse> {
    return this.http.put<CustomerDetailResponse>(
      `${this.baseUrl}${API_ENDPOINTS.CUSTOMERS.BY_CCODE(ccode)}`,
      request
    );
  }

  // DELETE CUSTOMERS
  deleteByCode(ccode: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${API_ENDPOINTS.CUSTOMERS.BY_CCODE(ccode)}`
    );
  }


  // AVAILABILITY GETTERS
  checkCcodeAvailability(ccode: string): Observable<AvailabilityResponse> {
    const params = new HttpParams().set('ccode', ccode);

    return this.http.get<AvailabilityResponse>(
      `${this.baseUrl}${API_ENDPOINTS.CUSTOMERS.AVAILABILITY_CCODE}`,
      { params }
    );
  }

  // GET email availability
  checkEmailAvailability(email: string): Observable<AvailabilityResponse> {
    const params = new HttpParams().set('email', email);

    return this.http.get<AvailabilityResponse>(
      `${this.baseUrl}${API_ENDPOINTS.CUSTOMERS.AVAILABILITY_EMAIL}`,
      { params }
    );
  }
}
