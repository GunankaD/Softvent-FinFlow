import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// APIs
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

// DTOs
import { OutstandingSummaryResponse } from '../../models/outstanding-summary.models';

@Injectable({
  providedIn: 'root'
})
export class OutstandingSummaryService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // GET OUTSTANDING SUMMARY
  getOutstandingSummary(): Observable<OutstandingSummaryResponse[]> {

    return this.http.get<OutstandingSummaryResponse[]>(
      `${this.baseUrl}${API_ENDPOINTS.OUTSTANDING_SUMMARY.BASE}`
    );
  }
}