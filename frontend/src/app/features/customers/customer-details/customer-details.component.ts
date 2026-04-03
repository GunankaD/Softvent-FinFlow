// ANGULAR
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// SERVICES & DEPENDENCIES
import { CustomerService } from '../../../core/services/customer/customer.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { GridTableComponent } from '../../../shared/components/grid-table/grid-table.component';

// MATERIAL UI
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

// DTOs
import { CustomerDetailResponse, CustomerUpdateRequest } from '../../../core/models/customer.models';
import { InvoiceSummaryResponse } from '../../../core/models/transaction.invoice.models';
import { ReceiptSummaryResponse } from '../../../core/models/transaction.receipt.models';
import { TableColumn } from '../../../shared/components/models/table-column.model'
import { Breadcrumb } from '../../../shared/components/models/breadcrumb.model';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss'],
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BreadcrumbComponent,
    GridTableComponent,
    MatDividerModule
  ],
})
export class CustomerDetailsComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);

    public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Customers', route: '/customers' },
      { label: 'All', route: '/customers/show-customers' },
      { label: this.customer()?.cname ?? '' }
    ];
  }

  readonly customer = signal<CustomerDetailResponse | null>(null);
  form!: FormGroup;

  isSaving = signal(false);
  isDeleting = signal(false);
  isLoadingCustomer = signal(true);
  protected isEditMode = signal(false);

  readonly invoices = signal<InvoiceSummaryResponse[]>([]);
  readonly receipts = signal<ReceiptSummaryResponse[]>([]);

  readonly loadingInvoices = signal(false);
  readonly loadingReceipts = signal(false);

  readonly invoiceColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice No',   flex: 1.2, minWidth: 140, type: 'text'     },
    { key: 'totalAmount',   label: 'Total ₹',      flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'balanceAmount', label: 'Balance ₹',    flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'status',        label: 'Status',       flex: 1,   minWidth: 120, type: 'text'     },
    { key: 'invoiceDate',   label: 'Invoice Date', flex: 1.5, minWidth: 160, type: 'date'     },
    { key: 'dueDate',       label: 'Due Date',     flex: 1.5, minWidth: 160, type: 'date'     },
    { key: 'viewIcon',      label: 'View',         flex: 0.5, minWidth: 70,  type: 'viewIcon'     }
  ];

  readonly receiptColumns: TableColumn[] = [
    { key: 'receiptNumber',  label: 'Receipt No', flex: 1.2, minWidth: 140, type: 'text'     },
    { key: 'paymentMode',    label: 'Mode',       flex: 1,   minWidth: 120, type: 'text'     },
    { key: 'totalReceived',  label: 'Total ₹',    flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'unappliedAmount',label: 'Unapplied ₹',flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'receiptDate',    label: 'Date',       flex: 1.5, minWidth: 160, type: 'date'     },
    { key: 'viewIcon',       label: 'View',       flex: 0.5, minWidth: 70,  type: 'viewIcon'     }
  ];

  protected getGridHeight(rowCount: number): string {
    const header = 50;
    const rowHeight = 42.2;
    const filterHeight = 49;

    const minRows = 4;
    const maxRows = 10;

    const height = rowCount === 0 ? 
      header + rowHeight + filterHeight
      : rowCount <= maxRows ?
        header + filterHeight + rowCount * rowHeight
        : header + filterHeight + maxRows * rowHeight

    return `${height}px`;
  }

  private ccode!: string;

  ngOnInit(): void {
    this.ccode = this.route.snapshot.paramMap.get('ccode')!;
    this.initializeForm();
    this.loadCustomer();
    this.loadInvoices();
    this.loadReceipts();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      cname: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pincode: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gstNo: ['', Validators.required],
      panNo: ['', Validators.required],
      bankName: ['', Validators.required],
      branchName: ['', Validators.required],
      accountNo: ['', Validators.required]
    });

    this.form.disable();
  }

  private loadCustomer(): void {
    this.isLoadingCustomer.set(true);

    this.customerService.getByCode(this.ccode).subscribe({
      next: (response: CustomerDetailResponse) => {
        this.customer.set(response);
        this.form.patchValue(response);
        this.isLoadingCustomer.set(false);
      },
      error: () => {
        this.isLoadingCustomer.set(false);
        this.snackbar.error('Failed to load customer.');
        this.router.navigate(['/customers']);
      }
    });
  }

  loadInvoices(): void {
    this.loadingInvoices.set(true);

    this.customerService.getCustomerInvoices(this.ccode).subscribe({
      next: (response: InvoiceSummaryResponse[]) => {
        this.invoices.set(response);
        this.loadingInvoices.set(false);
      },
      error: () => {
        this.loadingInvoices.set(false);
        this.snackbar.error('Failed to load invoices');
      }
    });
  }

  loadReceipts(): void {
    this.loadingReceipts.set(true);

    this.customerService.getCustomerReceipts(this.ccode).subscribe({
      next: (response: ReceiptSummaryResponse[]) => {
        this.receipts.set(response);
        this.loadingReceipts.set(false);
      },
      error: () => {
        this.loadingReceipts.set(false);
        this.snackbar.error('Failed to load receipts');
      }
    });
  }

  onInvoiceClick(row: any): void {
    this.router.navigate(['/transactions/invoices', row.invoiceNumber]);
  }

  onReceiptClick(row: any): void {
    this.router.navigate(['/transactions/receipts', row.receiptNumber]);
  }

  enableEdit(): void {
    if (this.isLoadingCustomer() || this.isSaving() || this.isDeleting()) return;

    this.isEditMode.set(true);
    this.form.enable();
  }

  cancelEdit(): void {
    if (this.isLoadingCustomer() || this.isSaving() || this.isDeleting()) return;

    if (!this.form.dirty) {
      this.exitEditMode();
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Discard Changes?',
        message: `You have unsaved changes. Are you sure you want to revert?`,
        confirmColor: 'red',
        confirmButtonText: 'Discard'
      },
      panelClass: 'custom-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      if (this.customer()) {
        this.form.patchValue(this.customer()!);
      }
      this.exitEditMode();
    });
  }

  private exitEditMode(): void {
    this.isEditMode.set(false);
    this.form.disable();
    this.form.markAsPristine();
  }

  private save(): void {
    if (this.form.invalid || this.form.pending) return;

    this.isSaving.set(true);
    this.form.disable();

    const request: CustomerUpdateRequest = this.form.value;

    this.customerService.updateByCode(this.ccode, request).subscribe({
      next: (response: CustomerDetailResponse) => {
        this.customer.set(response);
        this.form.patchValue(response);
        this.isEditMode.set(false);
        this.isSaving.set(false);
        this.snackbar.success('Customer updated successfully.');
      },
      error: () => {
        this.isSaving.set(false);
        this.isEditMode.set(false);
        this.snackbar.error('Failed to update customer.');
      }
    });
  }
  confirmSave(): void {
    if (
      this.form.invalid || 
      this.form.pending || 
      this.isSaving() || 
      this.isDeleting() || 
      this.isLoadingCustomer()
    ) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Save Changes',
        message: `Are you sure you want to save changes to ${this.customer()!.ccode}?`,
        confirmColor: 'green',
        confirmButtonText: 'Save'
      },
      panelClass: 'custom-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) { return;}
      this.save();
    });
  }

  deleteCustomer(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Customer',
        message: `Are you sure you want to delete ${this.customer()!.ccode}?`,
        confirmColor: 'red',
        confirmButtonText: 'Delete'
      },
      panelClass: 'custom-dialog-panel'
    });


    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (!result) return;

      this.isDeleting.set(true);
      this.form.disable();

      this.customerService.deleteByCode(this.ccode).subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.isEditMode.set(false);
          this.snackbar.success('Customer deleted successfully.');
          this.router.navigate(['/customers']);
        },
        error: (err) => {
          this.isDeleting.set(false);
          this.isEditMode.set(false);

          if (err.status === 409) {
            this.snackbar.error('Customer cannot be deleted. Transactions exist.');
          } else {
            this.snackbar.error('Failed to delete customer.');
          }
        }
      });
    });
  }
}
