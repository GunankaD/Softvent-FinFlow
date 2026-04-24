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

  public setMode(mode: Mode): void {
    if (this.mode() === mode) return;

    this.mode.set(mode);

    // HARD RESET (mode switch = fresh flow)
    this.selectedInvoice.set(null);
    this.selectedReceipt.set(null);
    this.applicationsMap.set(new Map());
  }

  public setCustomer(customer: CustomerSummaryResponse): void {
    this.customer.set(customer);

    // Reset everything downstream
    this.resetStep2();
    this.resetStep3();
  }

  public selectInvoice(invoice: InvoiceSummaryResponse): void {
    if (this.mode() !== 'INVOICE') return;

    this.selectedInvoice.set(invoice);

    // Clear previous allocations
    this.resetStep3();
  }

  public selectReceipt(receipt: ReceiptSummaryResponse): void {
    if (this.mode() !== 'RECEIPT') return;

    this.selectedReceipt.set(receipt);

    // Clear previous allocations
    this.resetStep3();
  }


  // =========================
  // STEP 3 ACTIONS (Invoice Mode)
  // =========================

  public addReceiptToInvoice(
    receipt: ReceiptSummaryResponse,
    amount?: number
  ): void {

    if (this.mode() !== 'INVOICE' || !this.selectedInvoice()) return;

    const invoice = this.selectedInvoice()!;
    const map = new Map(this.applicationsMap());

    // Prevent duplicate receipt
    if (map.has(receipt.receiptNumber)) return;

    const appliedAmount =
      amount ??
      Math.min(invoice.balanceAmount, receipt.unappliedAmount);

    map.set(receipt.receiptNumber, [
      {
        invoiceNumber: invoice.invoiceNumber,
        appliedAmount
      }
    ]);

    this.applicationsMap.set(map);
  }


  public updateReceiptAmount(
    receiptNumber: string,
    amount: number
  ): void {

    if (this.mode() !== 'INVOICE') return;

    const map = new Map(this.applicationsMap());
    const applications = map.get(receiptNumber);

    if (!applications || applications.length === 0) return;

    applications[0].appliedAmount = amount;

    map.set(receiptNumber, [...applications]);
    this.applicationsMap.set(map);
  }


  public removeReceipt(
    receiptNumber: string
  ): void {

    if (this.mode() !== 'INVOICE') return;

    const map = new Map(this.applicationsMap());

    if (!map.has(receiptNumber)) return;

    map.delete(receiptNumber);

    this.applicationsMap.set(map);
  }


  // =========================
  // STEP 3 ACTIONS (Receipt Mode)
  // =========================

  public addInvoiceToReceipt(
    invoice: InvoiceSummaryResponse,
    amount?: number
  ): void {

    if (this.mode() !== 'RECEIPT' || !this.selectedReceipt()) return;

    const receipt = this.selectedReceipt()!;
    const map = new Map(this.applicationsMap());

    const existing = map.get(receipt.receiptNumber) ?? [];

    // Prevent duplicate invoice
    if (existing.some(app => app.invoiceNumber === invoice.invoiceNumber)) return;

    const currentTotal = existing.reduce(
      (sum, app) => sum + app.appliedAmount,
      0
    );

    const remainingReceiptBalance =
      receipt.unappliedAmount - currentTotal;

    const appliedAmount =
      amount ??
      Math.min(remainingReceiptBalance, invoice.balanceAmount);

    const updated = [
      ...existing,
      {
        invoiceNumber: invoice.invoiceNumber,
        appliedAmount
      }
    ];

    map.set(receipt.receiptNumber, updated);

    this.applicationsMap.set(map);
  }


  public updateInvoiceAmount(
    invoiceNumber: string,
    amount: number
  ): void {

    if (this.mode() !== 'RECEIPT' || !this.selectedReceipt()) return;

    const receiptNumber = this.selectedReceipt()!.receiptNumber;
    const map = new Map(this.applicationsMap());

    const applications = map.get(receiptNumber);
    if (!applications) return;

    const updated = applications.map(app =>
      app.invoiceNumber === invoiceNumber
        ? { ...app, appliedAmount: amount }
        : app
    );

    map.set(receiptNumber, updated);
    this.applicationsMap.set(map);
  }


  public removeInvoice(
    invoiceNumber: string
  ): void {

    if (this.mode() !== 'RECEIPT' || !this.selectedReceipt()) return;

    const receiptNumber = this.selectedReceipt()!.receiptNumber;
    const map = new Map(this.applicationsMap());

    const applications = map.get(receiptNumber);
    if (!applications) return;

    const updated = applications.filter(
      app => app.invoiceNumber !== invoiceNumber
    );

    if (updated.length === 0) {
      map.delete(receiptNumber);
    } else {
      map.set(receiptNumber, updated);
    }

    this.applicationsMap.set(map);
  }


  // =========================
  // HELPERS
  // =========================

  public getApplicationsMap(): Map<string, PaymentApplicationItems[]> {
    return new Map();
  }


  // =========================
  // RESET HANDLERS
  // =========================

  public resetAll(): void {
    this.mode.set(null);
    this.customer.set(null);

    this.selectedInvoice.set(null);
    this.selectedReceipt.set(null);

    this.applicationsMap.set(new Map());
  }

  public resetStep2(): void {
    this.selectedInvoice.set(null);
    this.selectedReceipt.set(null);
  }

  public resetStep3(): void {
    this.applicationsMap.set(new Map());
  }

}