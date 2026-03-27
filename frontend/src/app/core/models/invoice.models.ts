import { InvoiceStatus } from '../enums/invoice-status.enum'

export interface InvoiceCreateRequest {
  ccode: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItemRequest[];
}

export interface InvoiceCreateResponse {
  invoiceNumber: string;
}

export interface InvoiceItemRequest {
  icode: string;
  quantity: number;
  discountPercent?: number;
}

export interface InvoiceDetailResponse {
  invid: number;
  invoiceNumber: string;

  ccode: string;
  cname: string;

  invoiceDate: string;
  dueDate: string;

  status: InvoiceStatus;

  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;

  items: InvoiceItemResponse[];
  payments: InvoicePaymentResponse[];
}

export interface InvoiceItemResponse {
  iid: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  lineAmount: number;
  gstRate: number;
  lineTotal: number;
}

export interface InvoicePaymentResponse {
  receiptNumber: string;
  appliedAmount: number;
  appliedAt: string;
}

export interface InvoiceSummaryResponse {
  invid: number;

  invoiceNumber: string;
  ccode: string;
  cname: string;

  totalAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;

  invoiceDate: string;
  dueDate: string;
}