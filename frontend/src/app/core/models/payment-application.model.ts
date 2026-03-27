import { ReceiptApplicationResponse } from './receipt.models';

export interface PaymentApplicationRequest {
  receiptNumber: string;
  applications: PaymentApplicationItems[];
}

export interface PaymentApplicationItems {
  invoiceNumber: string;
  appliedAmount: number;
}

export interface PaymentApplicationResponse {
  receiptNumber: string;
  totalApplied: number;
  remainingAmount: number;
  applications: ReceiptApplicationResponse[];
}