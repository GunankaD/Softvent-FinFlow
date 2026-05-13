// ANGULAR
import { Component, OnInit, inject, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

// RXJS
import { forkJoin } from 'rxjs';
import { startWith, map, debounceTime } from 'rxjs/operators';

// MATERIAL
import { MatStepper } from '@angular/material/stepper';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// SERVICES
import { CustomerService } from '../../../core/services/customer/customer.service';
import { PaymentApplicationService } from '../../../core/services/payment-application/payment-application.service';
import { PaymentApplicationStore } from '../../../core/services/payment-application/payment-application.store';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';

// SHARED
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { Breadcrumb } from '../../../shared/components/models/breadcrumb.model';
import { GridTableComponent } from '../../../shared/components/grid-table/grid-table.component';

// DTOs
import { CustomerSummaryResponse } from '../../../core/models/customer.models';
import { InvoiceSummaryResponse } from '../../../core/models/transaction.invoice.models';
import { ReceiptSummaryResponse } from '../../../core/models/transaction.receipt.models';
import { TableColumn } from '../../../shared/components/models/table-column.model';

@Component({
  selector: 'app-payment-application',
  standalone: true,
  templateUrl: './payment-application.component.html',
  styleUrls: ['./payment-application.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,

    BreadcrumbComponent,
    GridTableComponent
  ]
})
export class PaymentApplicationComponent {

  public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Transactions', route: '/transactions' },
      { label: 'Payment Application' }
    ];
  }

  @ViewChild(MatStepper) stepper!: MatStepper;

  // =========================
  // INJECTIONS
  // =========================

  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly paymentService = inject(PaymentApplicationService);
  private readonly store = inject(PaymentApplicationStore);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);


  // =========================
  // LOCAL STATE
  // =========================

  public readonly loading = signal<boolean>(false);

  protected customers: CustomerSummaryResponse[] = [];
  protected selectedCustomer: CustomerSummaryResponse | null = null;

  protected readonly customerGroup: FormGroup = this.fb.nonNullable.group({
    customer: [null as CustomerSummaryResponse | null, Validators.required]
  });
  protected customerSearch = this.fb.control('');
  protected filteredCustomers: CustomerSummaryResponse[] = [];


  // =========================
  // STORE ACCESS (Signals)
  // =========================

  public readonly mode = this.store.mode$;
  public readonly selectedInvoice = this.store.selectedInvoice$;
  public readonly selectedReceipt = this.store.selectedReceipt$;

  public readonly selectedReceipts = this.store.selectedReceipts;
  public readonly selectedInvoices = this.store.selectedInvoices;

  public readonly totalApplied = this.store.totalApplied;
  public readonly remainingBalance = this.store.remainingBalance;


  // =========================
  // LIFECYCLE
  // =========================

  constructor() {
    this.loadCustomers();

    this.customerSearch.valueChanges.subscribe(value => {
      let v = '';

      if (typeof value === 'string') {
        v = value.toLowerCase();
      } else if (value) {
        const customer = value as CustomerSummaryResponse;
        v = `${customer.ccode} ${customer.cname}`.toLowerCase();
      }

      this.filteredCustomers = this.customers
        .filter(c =>
          c.ccode.toLowerCase().includes(v) ||
          c.cname.toLowerCase().includes(v)
        )
        .slice(0, 10);
    });
  }

  // =========================
  // STEP 1
  // =========================

  private loadCustomers(): void {
    this.loading.set(true);

    this.customerService.getAll().subscribe({
      next: (response: CustomerSummaryResponse[]) => {
        this.customers = response;
        this.loading.set(false);
      },
      error: () => {
        this.snackbar.error('Failed to load customers');
        this.loading.set(false);
      }
    });
  }

  protected onCustomerSelected(customer: CustomerSummaryResponse): void {

    this.selectedCustomer = customer;

    this.customerGroup.patchValue({
      customer
    });

    this.customerSearch.setValue(
      `${customer.ccode} | ${customer.cname}`
    );

    this.ccode = customer.ccode;

    // STORE
    this.store.setCustomer(customer);

    // LOAD STEP 2 DATA
    this.loadInvoices();
    this.loadReceipts();
  }


  // =========================
  // STEP 2
  // =========================
  protected readonly invoices = signal<InvoiceSummaryResponse[]>([]);
  protected readonly receipts = signal<ReceiptSummaryResponse[]>([]);

  protected readonly loadingInvoices = signal(false);
  protected readonly loadingReceipts = signal(false);

  protected invoiceFilter: string = 'pending';
  protected receiptFilter: string = 'available';

  protected ccode: string = '';
  readonly invoiceColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice No',   flex: 1.2, minWidth: 140, type: 'text'     },
    { key: 'totalAmount',   label: 'Total ₹',      flex: 1.5, minWidth: 130, type: 'currency' },
    { key: 'balanceAmount', label: 'Balance ₹',    flex: 1.5, minWidth: 130, type: 'currency' },
    { key: 'status',        label: 'Status',       flex: 1,   minWidth: 120, type: 'text'     },
    { key: 'invoiceDate',   label: 'Invoice Date', flex: 1,   minWidth: 160, type: 'date'     },
    { key: 'dueDate',       label: 'Due Date',     flex: 1,   minWidth: 160, type: 'date'     },
    { key: 'viewIcon',      label: 'View',         flex: 0.5, minWidth: 70,  type: 'viewIcon' }
  ];

  readonly receiptColumns: TableColumn[] = [
    { key: 'receiptNumber',   label: 'Receipt No',  flex: 1.2, minWidth: 140, type: 'text'     },
    { key: 'paymentMode',     label: 'Mode',        flex: 1,   minWidth: 120, type: 'text'     },
    { key: 'totalReceived',   label: 'Total ₹',     flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'unappliedAmount', label: 'Unapplied ₹', flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'receiptDate',     label: 'Date',        flex: 1.5, minWidth: 160, type: 'date'     },
    { key: 'viewIcon',        label: 'View',        flex: 0.5, minWidth: 70,  type: 'viewIcon' }
  ];

  protected loadInvoices(): void {
    this.loadingInvoices.set(true);

    this.customerService.getCustomerInvoices(this.ccode, this.invoiceFilter).subscribe({
      next: (response: InvoiceSummaryResponse[]) => {
        this.invoices.set(response);
        this.store.setInvoices(response);
        this.loadingInvoices.set(false);
      },
      error: () => {
        this.loadingInvoices.set(false);
        this.snackbar.error('Failed to load invoices');
      }
    });
  }

  protected loadReceipts(): void {
    this.loadingReceipts.set(true);

    this.customerService.getCustomerReceipts(this.ccode, this.receiptFilter).subscribe({
      next: (response: ReceiptSummaryResponse[]) => {
        this.receipts.set(response);
        this.store.setReceipts(response);
        this.loadingReceipts.set(false);
      },
      error: () => {
        this.loadingReceipts.set(false);
        this.snackbar.error('Failed to load receipts');
      }
    });
  }

  public onSelectMode(mode: 'INVOICE' | 'RECEIPT'): void {
    this.store.setMode(mode);
  }

  // NAVIGATE
  protected onInvoiceView(row: any): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/transactions/invoices', row.invoiceNumber])
    );

    window.open(url, '_blank');
  }

  protected onReceiptView(row: any): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/transactions/receipts', row.receiptNumber])
    );

    window.open(url, '_blank');
  }

  // SELECT
  protected onInvoiceSelect(row: InvoiceSummaryResponse): void {
    this.store.setMode('INVOICE');
    this.store.selectInvoice(row);
  }
  protected onReceiptSelect(row: ReceiptSummaryResponse): void {
    this.store.setMode('RECEIPT');
    this.store.selectReceipt(row);
  }

  protected getGridHeight(rowCount: number, filter = true): string {
    const header = 50;
    const rowHeight = 42.2;
    const filterHeight = filter ? 49 : 0;

    const minRows = 4;
    const maxRows = 10;

    const height = rowCount === 0 ? 
      header + rowHeight + filterHeight
      : rowCount <= maxRows ?
        header + filterHeight + rowCount * rowHeight
        : header + filterHeight + maxRows * rowHeight;

    return `${height}px`;
  }

  protected readonly hasSelection = computed(() => {
    return !!this.selectedInvoice() || !!this.selectedReceipt();
  });


  // =========================
  // STEP 3 (INVOICE MODE)
  // =========================

  readonly allocationTopReceiptColumns: TableColumn[] = [
    { key: 'receiptNumber',   label: 'Receipt No',  flex: 1.5, minWidth: 140, type: 'text'     },
    { key: 'unappliedAmount', label: 'Balance ₹',   flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'receiptDate',     label: 'Date',        flex: 1.5, minWidth: 160, type: 'date'     },
    { key: 'viewIcon',        label: 'View',        flex: 0.5, minWidth: 70,  type: 'viewIcon' }
  ];

  public onAddReceipt(receipt: ReceiptSummaryResponse): void {
    this.store.addReceiptToInvoice(receipt);
  }

  public onUpdateReceiptAmount(receiptNumber: string, amount: number): void {
    this.store.updateReceiptAmount(receiptNumber, amount);
  }

  public onRemoveReceipt(receiptNumber: string): void {
    this.store.removeReceipt(receiptNumber);
  }

  readonly availableReceipts = computed(() => {
    const selected = new Set(
      this.store.selectedReceipts().map(r => r.receiptNumber)
    );

    return this.receipts().filter(r => !selected.has(r.receiptNumber));
  });


  // =========================
  // STEP 3 (RECEIPT MODE)
  // =========================

  readonly allocationTopInvoiceColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice No', flex: 1.5, minWidth: 140, type: 'text'     },
    { key: 'balanceAmount', label: 'Balance ₹',  flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'invoiceDate',   label: 'Date',       flex: 1.5, minWidth: 160, type: 'date'     },
    { key: 'viewIcon',      label: 'View',       flex: 0.5, minWidth: 70,  type: 'viewIcon' }
  ];

  public onAddInvoice(invoice: InvoiceSummaryResponse): void {
    this.store.addInvoiceToReceipt(invoice);
  }

  public onUpdateInvoiceAmount(invoiceNumber: string, amount: number): void {
    this.store.updateInvoiceAmount(invoiceNumber, amount);
  }

  public onRemoveInvoice(invoiceNumber: string): void {
    this.store.removeInvoice(invoiceNumber);
  }

  readonly availableInvoices = computed(() => {
    const selected = new Set(
      this.store.selectedInvoices().map(i => i.invoiceNumber)
    );

    return this.invoices().filter(i => !selected.has(i.invoiceNumber));
  });

  // =========================
  // STEP 3 ALLOCATION
  // =========================
  readonly allocationReceiptColumns: TableColumn[] = [
    { key: 'receiptNumber',  label: 'Receipt No',  flex: 1.5, minWidth: 110, type: 'text'     },
    { key: 'receiptDate',    label: 'Date',        flex: 1.5, minWidth: 120, type: 'date'     },
    { key: 'unappliedAmount',label: 'Balance ₹',   flex: 1,   minWidth: 140, type: 'currency' },
    { key: 'appliedAmount',  label: 'Applied ₹',   flex: 1,   minWidth: 120, type: 'input'    },
    { key: 'viewIcon',       label: 'View',        flex: 0.5, minWidth: 70,  type: 'viewIcon' },
    { key: 'deleteIcon',     label: 'Remove',      flex: 0.5, minWidth: 70,  type: 'deleteIcon' }
  ];

  readonly allocationInvoiceColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice No', flex: 1.5, minWidth: 110, type: 'text'     },
    { key: 'invoiceDate',   label: 'Date',       flex: 1.5, minWidth: 120, type: 'date'     },
    { key: 'balanceAmount', label: 'Balance ₹',  flex: 1,   minWidth: 140, type: 'currency' },
    { key: 'appliedAmount', label: 'Applied ₹',  flex: 1,   minWidth: 120, type: 'input'    },
    { key: 'viewIcon',      label: 'View',       flex: 0.5, minWidth: 70,  type: 'viewIcon' },
    { key: 'deleteIcon',    label: 'Remove',     flex: 0.5, minWidth: 70,  type: 'deleteIcon' }
  ];
  
  protected get allocationRows(): any[] {

    if (this.store.mode$() === 'INVOICE') {
      return this.store.selectedReceipts();
    }

    if (this.store.mode$() === 'RECEIPT') {
      return this.store.selectedInvoices();
    }

    return [];
  }



  // =========================
  // 🔹 STEP 4 (SUBMIT)
  // =========================
  protected isSubmitting = signal(false);

  readonly reviewReceiptColumns: TableColumn[] = [
    { key: 'receiptNumber',   label: 'Receipt No',  flex: 1.5, minWidth: 140, type: 'text'     },
    { key: 'receiptDate',     label: 'Date',        flex: 1.5, minWidth: 160, type: 'date'     },
    { key: 'unappliedAmount', label: 'Balance ₹',   flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'appliedAmount',   label: 'Applied ₹',   flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'viewIcon',        label: 'View',        flex: 0.5, minWidth: 70,  type: 'viewIcon' }
  ];

  readonly reviewInvoiceColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice No', flex: 1.5, minWidth: 140, type: 'text'     },
    { key: 'invoiceDate',   label: 'Date',       flex: 1.5, minWidth: 160, type: 'date'     },
    { key: 'balanceAmount', label: 'Balance ₹',  flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'appliedAmount', label: 'Applied ₹',  flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'viewIcon',      label: 'View',       flex: 0.5, minWidth: 70,  type: 'viewIcon' }
  ];

  protected async onSubmit(): Promise<void> {

    const map = this.store.getApplicationsMap();

    if (map.size === 0) {
      this.snackbar.error('No applications to submit');
      return;
    }

    this.isSubmitting.set(true);

    try {
      for (const [receiptNumber, applications] of map) {
        await this.paymentService
          .applyPayment({ receiptNumber, applications })
          .toPromise();
      }

      this.snackbar.success('Payment applied successfully');

      this.store.resetAll();

    } catch (error) {
      this.snackbar.error('Failed to apply payment');
    } finally {
      this.isSubmitting.set(false);
    }
  }


  // =========================
  // NAVIGATION (STEPPER)
  // =========================

  public onBackToStep2(): void {
    this.store.resetStep3();
  }

  public onBackToStep1(): void {
    this.store.resetStep2();
    this.store.resetStep3();
  }

}