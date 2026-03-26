import { PaymentMode } from '../enums/payment-mode.enum';

export interface ReceiptSummaryResponse {
  receiptNumber: string;
  ccode: string;
  cname: string;
  paymentMode: PaymentMode;

  totalReceived: number;
  unappliedAmount: number;

  receiptDate: string; // ISO date
}

export interface ReceiptCreateResponse{

}

export interface ReceiptCreateRequest{

}

export interface ReceiptDetailResponse{
  
}