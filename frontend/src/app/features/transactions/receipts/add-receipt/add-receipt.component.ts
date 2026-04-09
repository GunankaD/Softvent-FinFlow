// ANGULAR
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

// MATERIAL
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

// SERVICES
import { ReceiptService } from '../../../../core/services/receipt/receipt.service';
import { CustomerService } from '../../../../core/services/customer/customer.service';
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';

// SHARED
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

// DTOs
import {
  ReceiptCreateRequest,
  ReceiptCreateResponse
} from '../../../../core/models/transaction.receipt.models';
import { MaxDecimalsDirective } from '../../../../shared/directives/max-decimals.directive';

import { CustomerSummaryResponse } from '../../../../core/models/customer.models';
import { PaymentMode } from '../../../../core/enums/payment-mode.enum';
import { Breadcrumb } from '../../../../shared/components/models/breadcrumb.model';

@Component({
  selector: 'app-add-receipt',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    BreadcrumbComponent,
    MaxDecimalsDirective
  ],
  templateUrl: './add-receipt.component.html',
  styleUrl: './add-receipt.component.scss'
})
export class AddReceiptComponent {

  // ========================
  // BREADCRUMB
  // ========================
  public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Transactions', route: '/transactions' },
      { label: 'Receipts', route: '/transactions', fragment: 'receipt-section' },
      { label: 'Create Receipt' }
    ];
  }

  // ========================
  // DEPENDENCIES
  // ========================
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly receiptService = inject(ReceiptService);
  private readonly customerService = inject(CustomerService);
  private readonly snackbar = inject(SnackbarService);

  protected isSubmitting = signal(false);

  // ========================
  // DATA
  // ========================
  protected customers: CustomerSummaryResponse[] = [];
  protected filteredCustomers: CustomerSummaryResponse[] = [];
  protected selectedCustomer: CustomerSummaryResponse | null = null;

  protected readonly paymentModes = Object.values(PaymentMode);

  // ========================
  // FORM
  // ========================
  protected readonly receiptGroup: FormGroup = this.fb.nonNullable.group({
    ccode: ['', Validators.required],
    receiptDate: [null as Date | null, Validators.required],
    paymentMode: [null as PaymentMode | null, Validators.required],
    referenceNumber: [''],
    totalReceived: [0, [Validators.required, Validators.min(0.01)]]
  });

  protected customerSearch = this.fb.control('');

  // ========================
  // INIT
  // ========================
  constructor() {
    this.loadCustomers();

    this.customerSearch.valueChanges.subscribe(value => {
      let v = '';

      if (typeof value === 'string') {
        v = value.toLowerCase();
      } else if (value) {
        const c = value as CustomerSummaryResponse;
        v = `${c.ccode} ${c.cname}`.toLowerCase();
      }

      this.filteredCustomers = this.customers
        .filter(c =>
          c.ccode.toLowerCase().includes(v) ||
          c.cname.toLowerCase().includes(v)
        )
        .slice(0, 10);
    });
  }

  private loadCustomers(): void {
    this.customerService.getAll().subscribe(res => {
      this.customers = res;
    });
  }

  // ========================
  // STEP 1
  // ========================
  protected onCustomerSelected(customer: CustomerSummaryResponse): void {
    this.selectedCustomer = customer;

    this.receiptGroup.patchValue({
      ccode: customer.ccode
    });

    this.customerSearch.setValue(`${customer.ccode} | ${customer.cname}`);
  }

  private formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  // ========================
  // SUBMIT
  // ========================
  protected onSubmit(): void {
    if (this.isSubmitting()) return;

    if (this.receiptGroup.invalid) return;

    this.isSubmitting.set(true);

    const payload: ReceiptCreateRequest = {
      ccode: this.receiptGroup.value.ccode,
      paymentMode: this.receiptGroup.value.paymentMode,
      referenceNumber: this.receiptGroup.value.referenceNumber || undefined,
      totalReceived: this.receiptGroup.value.totalReceived,
      receiptDate: this.formatDate(this.receiptGroup.value.receiptDate)
    };

    this.receiptService.create(payload).subscribe({
      next: (res: ReceiptCreateResponse) => {
        this.isSubmitting.set(false);
        this.snackbar.success('Receipt created', 4000);

        this.router.navigate([
          `/transactions/receipts/${res.receiptNumber}`
        ]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.snackbar.error('Failed to create receipt', 4000);
      }
    });
  }
}