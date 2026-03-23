import { ItemType } from '../enums/item-type.enum'
import { Uom } from '../enums/uom.enum';

// REQUEST DTOs
export interface ItemCreateRequest {
  icode: string;
  name: string;
  description: string;
  hsnSacCode: string;
  itemType: ItemType;
  uom: Uom;
  isBom: boolean;
  stockable: boolean;
  purchaseRate?: number;
  salesRate?: number;
  gstRate: number;
  gstType: string;
  igid: number;
}

export interface ItemCreateResponse {
  icode: string;
}

export interface ItemUpdateRequest {
  name: string;
  description: string;
  hsnSacCode: string;
  itemType: ItemType;
  uom: Uom;
  isBom: boolean;
  stockable: boolean;
  purchaseRate?: number;
  salesRate?: number;
  gstRate: number;
  gstType: string;
  igid: number;
}

// RESPONSE DTOs
export interface ItemSummaryResponse {
  icode: string;
  name: string;
  itemType: ItemType;
  uom: Uom;
  stockable: boolean;
  purchaseRate?: number;
  salesRate?: number;
  gstRate: number;
  isActive: boolean;
  createdAt: string;
}

export interface ItemDetailResponse {
  iid: number;
  icode: string;
  name: string;
  description: string;
  hsnSacCode: string;
  itemType: ItemType;
  uom: Uom;
  isBom: boolean;
  stockable: boolean;
  purchaseRate?: number;
  salesRate?: number;
  gstRate: number;
  gstType: string;
  isActive: boolean;
  igid: number;
  groupName: string;
  createdAt: string;
  lastUpdatedAt?: string;
}

export interface ItemGroupResponse {
  igid: number;
  name: string;
  parentIgid?: number;
  isActive: boolean;
}

export interface AvailabilityResponse {
  available: boolean;
}