// ANGULAR
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay } from 'rxjs';

// ENDPOINTS
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

// DTOs
import {
  InvoiceCreateRequest,
  InvoiceCreateResponse,
  InvoiceSummaryResponse,
  InvoiceDetailResponse
} from '../../models/transaction.invoice.models';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // GET ALL
  public getAll(): Observable<InvoiceSummaryResponse[]> {
    return this.http.get<InvoiceSummaryResponse[]>(
      `${this.baseUrl}${API_ENDPOINTS.INVOICES.BASE}`
    );
  }

  // GET BY INVOICE NUMBER
  public getByNumber(invoiceNumber: string): Observable<InvoiceDetailResponse> {
    return this.http.get<InvoiceDetailResponse>(
      `${this.baseUrl}${API_ENDPOINTS.INVOICES.BY_NUMBER(invoiceNumber)}`
    );
  }

  // CREATE
  public create(request: InvoiceCreateRequest): Observable<InvoiceCreateResponse> {
    return this.http.post<InvoiceCreateResponse>(
      `${this.baseUrl}${API_ENDPOINTS.INVOICES.BASE}`,
      request
    );
  }

  // DELETE (VOID)
  public deleteByNumber(invoiceNumber: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${API_ENDPOINTS.INVOICES.BY_NUMBER(invoiceNumber)}`
    );
  }
}