// ANGULAR
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay } from 'rxjs';

// ENDPOINTS
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

// DTOs
import {
  ReceiptCreateRequest,
  ReceiptCreateResponse,
  ReceiptSummaryResponse,
  ReceiptDetailResponse
} from '../../models/receipt.models';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // GET ALL
  public getAll(): Observable<ReceiptSummaryResponse[]> {
    return this.http.get<ReceiptSummaryResponse[]>(
      `${this.baseUrl}${API_ENDPOINTS.RECEIPTS.BASE}`
    );
  }

  // GET BY RECEIPT NUMBER
  public getByNumber(receiptNumber: string): Observable<ReceiptDetailResponse> {
    return this.http.get<ReceiptDetailResponse>(
      `${this.baseUrl}${API_ENDPOINTS.RECEIPTS.BY_NUMBER(receiptNumber)}`
    );
  }

  // CREATE
  public create(request: ReceiptCreateRequest): Observable<ReceiptCreateResponse> {
    return this.http.post<ReceiptCreateResponse>(
      `${this.baseUrl}${API_ENDPOINTS.RECEIPTS.BASE}`,
      request
    );
  }

  // DELETE
  public deleteByNumber(receiptNumber: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${API_ENDPOINTS.RECEIPTS.BY_NUMBER(receiptNumber)}`
    );
  }
}