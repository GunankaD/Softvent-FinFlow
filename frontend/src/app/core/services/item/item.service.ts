import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ENDPOINTS
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

// DTOs
import {
  ItemCreateRequest,
  ItemUpdateRequest,
  ItemSummaryResponse,
  ItemDetailResponse,
  ItemGroupResponse,
  AvailabilityResponse
} from '../../models/item.models';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getAll(): Observable<ItemSummaryResponse[]> {
    return this.http.get<ItemSummaryResponse[]>(
      `${this.baseUrl}${API_ENDPOINTS.ITEMS.BASE}`
    );
  }

  getByCode(icode: string): Observable<ItemDetailResponse> {
    return this.http.get<ItemDetailResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ITEMS.BY_ICODE(icode)}`
    );
  }

  create(request: ItemCreateRequest): Observable<ItemDetailResponse> {
    return this.http.post<ItemDetailResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ITEMS.BASE}`,
      request
    );
  }

  updateByCode(icode: string, request: ItemUpdateRequest): Observable<ItemDetailResponse> {
    return this.http.put<ItemDetailResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ITEMS.BY_ICODE(icode)}`,
      request
    );
  }

  deleteByCode(icode: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${API_ENDPOINTS.ITEMS.BY_ICODE(icode)}`
    );
  }

  checkIcodeAvailability(icode: string): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ITEMS.AVAILABILITY(icode)}`
    );
  }

  getAllGroups(): Observable<ItemGroupResponse[]> {
    return this.http.get<ItemGroupResponse[]>(
      `${this.baseUrl}${API_ENDPOINTS.ITEM_GROUPS.BASE}`
    );
  }

  getGroupById(igid: number): Observable<ItemGroupResponse> {
    return this.http.get<ItemGroupResponse>(
      `${this.baseUrl}${API_ENDPOINTS.ITEM_GROUPS.BY_IGD(igid)}`
    );
  }
}