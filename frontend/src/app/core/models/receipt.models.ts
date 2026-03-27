import { PaymentMode } from '../enums/payment-mode.enum';

export interface ReceiptCreateRequest {
  ccode: string;
  paymentMode: PaymentMode;
  referenceNumber?: string;
  totalReceived: number;
  receiptDate: string;
}

export interface ReceiptCreateResponse {
  receiptNumber: string;
}

export interface ReceiptDetailResponse {
  receiptNumber: string;

  ccode: string;
  cname: string;

  paymentMode: PaymentMode;
  referenceNumber?: string;

  totalReceived: number;
  unappliedAmount: number;

  receiptDate: string;

  applications: ReceiptApplicationResponse[];
}

export interface ReceiptApplicationResponse {
  invoiceNumber: string;
  appliedAmount: number;
  appliedAt: string;
}

export interface ReceiptSummaryResponse {
  receiptNumber: string;
  ccode: string;
  cname: string;
  paymentMode: PaymentMode;

  totalReceived: number;
  unappliedAmount: number;

  receiptDate: string;
}