import { InvoiceStatus } from '../enums/invoice-status.enum'

export interface InvoiceSummaryResponse {
  invid: number;

  invoiceNumber: string;
  ccode: string;
  cname: string;

  totalAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;

  invoiceDate: string; // ISO date
  dueDate: string;
}

export interface InvoiceDetailResponse {

}

export interface InvoiceCreateRequest {

}

export interface InvoiceCreateResponse {
  
}