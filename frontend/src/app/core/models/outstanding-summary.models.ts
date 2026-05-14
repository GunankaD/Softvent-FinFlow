export interface OutstandingSummaryResponse {

  ccode: string;
  cname: string;

  totalInvoiceAmount: number;
  totalReceiptAmount: number;
  totalAppliedAmount: number;

  netOutstanding: number;
}