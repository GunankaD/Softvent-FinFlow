// ANGULAR
import { Injectable, signal, computed } from '@angular/core';

// DTOs
import { CustomerSummaryResponse } from '../../models/customer.models';
import { InvoiceSummaryResponse } from '../../models/transaction.invoice.models';
import { ReceiptSummaryResponse } from '../../models/transaction.receipt.models';
import { PaymentApplicationItems } from '../../models/transaction.payment-application.model';

type Mode = 'INVOICE' | 'RECEIPT';

// UI EXTENSIONS
export type SelectedReceipt = ReceiptSummaryResponse & {
  appliedAmount: number;
};

export type SelectedInvoice = InvoiceSummaryResponse & {
  appliedAmount: number;
};

@Injectable({
  providedIn: 'root'
})
export class PaymentApplicationStore {

  // =========================
  // STATE (Signals)
  // =========================

  private readonly mode = signal<Mode | null>(null);

  private readonly customer = signal<CustomerSummaryResponse | null>(null);

  private readonly selectedInvoice = signal<InvoiceSummaryResponse | null>(null);
  private readonly selectedReceipt = signal<ReceiptSummaryResponse | null>(null);

  /**
   * Core structure:
   * Map<receiptNumber, PaymentApplicationItems[]>
   */
  private readonly applicationsMap = signal<
    Map<string, PaymentApplicationItems[]>
  >(new Map());


  // =========================
  // GETTERS (Signals access)
  // =========================

  public readonly mode$ = this.mode.asReadonly();
  public readonly customer$ = this.customer.asReadonly();

  public readonly selectedInvoice$ = this.selectedInvoice.asReadonly();
  public readonly selectedReceipt$ = this.selectedReceipt.asReadonly();

  public readonly applicationsMap$ = this.applicationsMap.asReadonly();


  // =========================
  // COMPUTED VALUES
  // =========================

  public readonly totalApplied = computed<number>(() => {
    return 0;
  });

  public readonly remainingBalance = computed<number>(() => {
    return 0;
  });

  public readonly selectedReceipts = computed<SelectedReceipt[]>(() => {
    return [];
  });

  public readonly selectedInvoices = computed<SelectedInvoice[]>(() => {
    return [];
  });


  // =========================
  // CORE SETTERS (Step 1 & 2)
  // =========================

  public setMode(mode: Mode): void {}

  public setCustomer(customer: CustomerSummaryResponse): void {}

  public selectInvoice(invoice: InvoiceSummaryResponse): void {}

  public selectReceipt(receipt: ReceiptSummaryResponse): void {}


  // =========================
  // STEP 3 ACTIONS (Invoice Mode)
  // =========================

  public addReceiptToInvoice(
    receipt: ReceiptSummaryResponse,
    amount?: number
  ): void {}

  public updateReceiptAmount(
    receiptNumber: string,
    amount: number
  ): void {}

  public removeReceipt(
    receiptNumber: string
  ): void {}


  // =========================
  // STEP 3 ACTIONS (Receipt Mode)
  // =========================

  public addInvoiceToReceipt(
    invoice: InvoiceSummaryResponse,
    amount?: number
  ): void {}

  public updateInvoiceAmount(
    invoiceNumber: string,
    amount: number
  ): void {}

  public removeInvoice(
    invoiceNumber: string
  ): void {}


  // =========================
  // HELPERS
  // =========================

  public getApplicationsMap(): Map<string, PaymentApplicationItems[]> {
    return new Map();
  }


  // =========================
  // RESET HANDLERS
  // =========================

  public resetAll(): void {}

  public resetStep2(): void {}

  public resetStep3(): void {}

}