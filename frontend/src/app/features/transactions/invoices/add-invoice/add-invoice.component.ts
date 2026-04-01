// ANGULAR
import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// MATERIAL
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';

// SERVICES
import { InvoiceService } from '../../../../core/services/invoice/invoice.service';
import { ItemService } from '../../../../core/services/item/item.service';
import { CustomerService } from '../../../../core/services/customer/customer.service';
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { GridTableComponent } from '../../../../shared/components/grid-table/grid-table.component' ;
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component'

// DTOs
import {
  InvoiceCreateRequest,
  InvoiceCreateResponse
} from '../../../../core/models/transaction.invoice.models';
import { Breadcrumb } from '../../../../shared/components/models/breadcrumb.model';
import { TableColumn } from '../../../../shared/components/models/table-column.model';

import { ItemSummaryResponse } from '../../../../core/models/item.models';
import { CustomerSummaryResponse } from '../../../../core/models/customer.models';

@Component({
  selector: 'app-add-invoice',
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
    BreadcrumbComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    GridTableComponent
  ],
  templateUrl: './add-invoice.component.html',
  styleUrl: './add-invoice.component.scss'
})
export class AddInvoiceComponent {

  @ViewChild(MatStepper) stepper!: MatStepper;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceService);
  private readonly itemService = inject(ItemService);
  private readonly customerService = inject(CustomerService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);

  protected isSubmitting = signal(false);

  public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Transactions', route: '/transactions' },
      { label: 'Invoices', route: '/transactions', fragment:"invoice-section"},
      { label: 'Create Invoice' }
    ];
  }

  // DATA
  protected customers: CustomerSummaryResponse[] = [];
  protected itemsMaster: ItemSummaryResponse[] = [];
  private activeIcodes = new Set<string>();
  protected selectedCustomer: CustomerSummaryResponse | null = null;

  // FORM
  protected readonly invoiceGroup: FormGroup = this.fb.nonNullable.group({
    ccode: ['', Validators.required],
    cname: [''],
    invoiceDate: [null as Date | null, Validators.required],
    dueDate: [null as Date | null, Validators.required]
  });
  
  protected itemsArray: FormArray = this.fb.array([]);

  protected get itemsControls() {
    return this.itemsArray.controls as FormGroup[];
  }

  // FILTERING
  protected customerSearch = this.fb.control('');
  protected filteredCustomers: CustomerSummaryResponse[] = [];
  protected itemSearch = this.fb.control('');
  protected filteredItems: ItemSummaryResponse[] = [];


  // INIT
  constructor() {
    this.loadInitialData();

    this.customerSearch.valueChanges.subscribe(value => {
      let v = '';

      if (typeof value === 'string') {
        v = value.toLowerCase();
      } else if (value) {
        const customer = value as CustomerSummaryResponse;
        v = `${customer.ccode} ${customer.cname}`.toLowerCase();
      }

      this.filteredCustomers = this.customers.filter(c =>
        c.ccode.toLowerCase().includes(v) ||
        c.cname.toLowerCase().includes(v)
      ).slice(0, 10);
    });

    this.itemSearch.valueChanges.subscribe(value => {
      let v = '';

      if (typeof value === 'string') {
        v = value.toLowerCase();
      } else if (value) {
        const item = value as ItemSummaryResponse;
        v = `${item.icode} ${item.name}`.toLowerCase();
      }

      this.filteredItems = this.itemsMaster
        .filter(item =>
          (
            item.icode.toLowerCase().includes(v) ||
            item.name.toLowerCase().includes(v)
          ) &&
          !this.activeIcodes.has(item.icode)
        )
        .slice(0, 10);
    });
  }

  private loadInitialData(): void {
    this.customerService.getAll().subscribe(res => this.customers = res);
    this.itemService.getAll().subscribe(res => this.itemsMaster = res);
  }

  protected onCustomerSelected(customer: CustomerSummaryResponse): void {
    this.selectedCustomer = customer;
    this.invoiceGroup.patchValue({ ccode: customer.ccode });
    this.customerSearch.setValue(`${customer.ccode} | ${customer.cname}`);
  }
  // ITEM HANDLING
  protected addItem(item: ItemSummaryResponse): void {

    const exists = this.itemsArray.value.find((i: any) => i.icode === item.icode);

    if (exists) {
      return;
    }

    const group = this.fb.nonNullable.group({
      icode: item.icode,
      name: item.name,
      quantity: [1, [Validators.required, Validators.min(1)]],
      rate: item.salesRate,
      discountPercent: [0],
      gstRate: item.gstRate,
    });

    this.itemsArray.push(group);
    this.activeIcodes.add(item.icode);
    this.itemSearch.setValue('');
  }

  protected removeItem(index: number, icode: string): void {
    this.itemsArray.removeAt(index);
    this.activeIcodes.delete(icode);
  }

  protected onItemDelete(row: any): void {
    const index = this.itemsArray.value.findIndex(
      (item: any) => item.icode === row.icode
    );
    if (index !== -1) {
      this.removeItem(index, row.icode);
    }
  }

  // CALCULATIONS
  protected getLineTotal(item: any): number {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discountPercent = Number(item.discountPercent) || 0;
    const gstRate = Number(item.gstRate) || 0;

    const base = qty * rate;
    const discount = base * discountPercent / 100;
    const afterDiscount = base - discount;
    const gst = afterDiscount * gstRate / 100;

    return afterDiscount + gst;
  }

  protected getTotal(): number {
    return this.itemsArray.value
      .reduce((sum: number, item: any) => sum + this.getLineTotal(item), 0);
  }

  // GRIDS
  protected getGridHeight(rowCount: number): string {
    const header = 50;
    const rowHeight = 42.2;

    const minRows = 4;
    const maxRows = 10;

    const height = rowCount === 0 ? 
      header + rowHeight 
      : rowCount <= maxRows ?
        header + rowCount * rowHeight
        : header + maxRows * rowHeight

    return `${height}px`;
  }

  readonly itemColumns: TableColumn[] = [
    { key: 'icode',           label: 'Item Code',   flex: 1,   minWidth: 120, type: 'text' },
    { key: 'name',            label: 'Item Name',   flex: 1.5, minWidth: 160, type: 'text' },
    { key: 'quantity',        label: 'Qty',         flex: 0.8, minWidth: 100, type: 'input' },
    { key: 'rate',            label: 'Rate',        flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'discountPercent', label: 'Discount %',  flex: 1,   minWidth: 120, type: 'input' },
    { key: 'gstRate',         label: 'GST %',       flex: 1,   minWidth: 120, type: 'number' },
    { key: 'lineTotal',       label: 'Total',       flex: 1.2, minWidth: 140, type: 'currency' },
    { key: 'deleteIcon',      label: 'Delete',      flex: 0.7, minWidth: 80,  type: 'deleteIcon' }
  ];

  protected get itemsWithTotals(): any[] {
    return this.itemsArray.value.map((item: any) => ({
      ...item,
      lineTotal: this.getLineTotal(item)
    }));
  }

  // SUMMARY STEP
  readonly reviewColumns: TableColumn[] = [
    { key: 'icode',           label: 'Item Code',   flex: 1,   minWidth: 120, type: 'text' },
    { key: 'name',            label: 'Item Name',   flex: 1.5, minWidth: 160, type: 'text' },
    { key: 'quantity',        label: 'Qty',         flex: 0.8, minWidth: 80,  type: 'number' },
    { key: 'rate',            label: 'Rate',        flex: 1,   minWidth: 120, type: 'currency' },
    { key: 'discountPercent', label: 'Discount %',  flex: 1,   minWidth: 100, type: 'number' },
    { key: 'gstRate',         label: 'GST %',       flex: 0.8, minWidth: 80,  type: 'number' },
    { key: 'lineTotal',       label: 'Total',       flex: 1.2, minWidth: 140, type: 'currency' }
  ];

  protected get reviewItems(): any[] {
    return this.itemsArray.value.map((item: any) => ({
      ...item,
      lineTotal: this.getLineTotal(item)
    }));
  }

  protected getSubtotal(): number {
    return this.itemsArray.value
      .reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0);
  }

  protected getTotalDiscount(): number {
    return this.itemsArray.value.reduce((sum: number, item: any) => {
      const base = item.quantity * item.rate;
      return sum + (base * (item.discountPercent || 0) / 100);
    }, 0);
  }

  protected getTaxableAmount(): number {
    return this.getSubtotal() - this.getTotalDiscount();
  }

  protected getTotalTax(): number {
    return this.itemsArray.value.reduce((sum: number, item: any) => {
      const base = item.quantity * item.rate;
      const afterDiscount = base - (base * (item.discountPercent || 0) / 100);
      return sum + (afterDiscount * item.gstRate / 100);
    }, 0);
  }

  // SUBMIT
  private onSubmit(): void {

    if (this.invoiceGroup.invalid || this.itemsArray.length === 0) return;

    this.isSubmitting.set(true);

    const payload: InvoiceCreateRequest = {
      ccode: this.invoiceGroup.value.ccode,
      invoiceDate: this.formatDate(this.invoiceGroup.value.invoiceDate),
      dueDate: this.formatDate(this.invoiceGroup.value.dueDate),
      items: this.itemsArray.value.map((i: any) => ({
        icode: i.icode,
        quantity: i.quantity,
        discountPercent: i.discountPercent
      }))
    };

    this.invoiceService.create(payload).subscribe({
      next: (res: InvoiceCreateResponse) => {
        this.isSubmitting.set(false);
        this.snackbar.success('Invoice created', 4000);
        this.router.navigate([`/transactions/invoices/${res.invoiceNumber}`]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.snackbar.error('Failed to create invoice', 4000);
      }
    });
  }

  protected onCreateClick(): void {
    if (this.isSubmitting()) return;
    this.onSubmit();
  }

  protected onClearItems(): void {
    if (this.isSubmitting()) return;

    if (this.itemsArray.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Clear Items',
        message: 'Are you sure you want to remove all added items?',
        confirmColor: 'red',
        confirmButtonText: 'Clear'
      },
      panelClass: 'custom-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.itemsArray.clear();
      this.activeIcodes.clear();
    });
  }

  private formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  protected onItemChange(updatedRow: any): void {

    const index = this.itemsArray.value.findIndex(
      (item: any) => item.icode === updatedRow.icode
    );

    if (index === -1) return;

    const formGroup = this.itemsArray.at(index) as FormGroup;

    formGroup.patchValue({
      quantity: updatedRow.quantity,
      discountPercent: updatedRow.discountPercent
    });

    this.itemsArray.updateValueAndValidity({ emitEvent: true });
  }
}
