// ANGULAR
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// SERVICES
import { InvoiceService } from '../../../../core/services/invoice/invoice.service';
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';

// SHARED
import { GridTableComponent } from '../../../../shared/components/grid-table/grid-table.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { TableColumn } from '../../../../shared/components/models/table-column.model';
import { Breadcrumb } from '../../../../shared/components/models/breadcrumb.model';

// MATERIAL
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

// DTOs
import {
  InvoiceDetailResponse,
  InvoiceItemResponse,
  InvoicePaymentResponse
} from '../../../../core/models/transaction.invoice.models';

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss'],
  imports: [
    CommonModule,
    GridTableComponent,
    BreadcrumbComponent,
    MatProgressSpinnerModule,
    MatDividerModule
  ]
})
export class InvoiceDetailsComponent implements OnInit {

  // =====================
  // INJECTS
  // =====================
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceService);
  private readonly snackbar = inject(SnackbarService);

  // =====================
  // STATE
  // =====================
  readonly invoice = signal<InvoiceDetailResponse | null>(null);
  readonly isLoadingInvoice = signal(true);

  private invoiceNumber!: string;

  // =====================
  // DERIVED
  // =====================
  readonly items = computed<InvoiceItemResponse[]>(() =>
    this.invoice()?.items ?? []
  );

  readonly payments = computed<InvoicePaymentResponse[]>(() =>
    this.invoice()?.payments ?? []
  );

  // =====================
  // BREADCRUMB
  // =====================
  public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Transactions', route: '/transactions' },
      { label: 'Invoices', route: '/transactions/invoices/show-invoices' },
      { label: this.invoice()?.invoiceNumber ?? '' }
    ];
  }

  // =====================
  // TABLE COLUMNS
  // =====================
  readonly itemColumns: TableColumn[] = [
    { key: 'itemCode',        label: 'Item Code',    flex: 1,    minWidth: 120, type: 'text' },
    { key: 'itemName',        label: 'Item Name',    flex: 2,    minWidth: 180, type: 'text' },
    { key: 'quantity',        label: 'Qty',          flex: 1,    minWidth: 100, type: 'number' },
    { key: 'rate',            label: 'Rate ₹',       flex: 1,    minWidth: 120, type: 'currency' },
    { key: 'discountPercent', label: 'Disc %',       flex: 1,    minWidth: 110, type: 'number' },
    { key: 'lineAmount',      label: 'Line Amount ₹',flex: 1.5,  minWidth: 150, type: 'currency' },
    { key: 'gstRate',         label: 'GST %',        flex: 1,    minWidth: 110, type: 'number' },
    { key: 'lineTotal',       label: 'Line Total ₹', flex: 1.5,  minWidth: 150, type: 'currency' },
    { key: 'viewIcon',        label: 'View',         flex: 0.5,  minWidth: 70,  type: 'viewIcon' }
  ];

  readonly paymentColumns: TableColumn[] = [
    { key: 'receiptNumber', label: 'Receipt No', flex: 1.5, minWidth: 160, type: 'text' },
    { key: 'appliedAmount', label: 'Amount ₹', flex: 1, minWidth: 140, type: 'currency' },
    { key: 'appliedAt', label: 'Date', flex: 1, minWidth: 140, type: 'date' },
    { key: 'viewIcon',        label: 'View',         flex: 0.5,  minWidth: 70,  type: 'viewIcon' }
  ];

  // =====================
  // LIFECYCLE
  // =====================
  ngOnInit(): void {
    this.invoiceNumber = this.route.snapshot.paramMap.get('invoiceNumber')!;
    this.loadInvoice();
  }

  // =====================
  // API CALL
  // =====================
  private loadInvoice(): void {
    this.isLoadingInvoice.set(true);

    this.invoiceService.getByNumber(this.invoiceNumber).subscribe({
      next: (response: InvoiceDetailResponse) => {
        this.invoice.set(response);
        this.isLoadingInvoice.set(false);
      },
      error: () => {
        this.isLoadingInvoice.set(false);
        this.snackbar.error('Failed to load invoice.');
        this.router.navigate(['/transactions/invoices']);
      }
    });
  }

  // =====================
  // DERIVED TOTALS
  // =====================
  readonly subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.lineAmount, 0)
  );

  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.lineTotal, 0)
  );

  readonly gstAmount = computed(() =>
    this.total() - this.subtotal()
  );

  readonly discountAmount = computed(() =>
    this.items().reduce((sum, i) => {
      const original = i.rate * i.quantity;
      return sum + (original - i.lineAmount);
    }, 0)
  );

  // =====================
  // GRID HEIGHT
  // =====================
  protected getGridHeight(rowCount: number, maxRows: number, minRows: number = 1): string {
    const header = 50;
    const rowHeight = 42.2;

    const height =
      rowCount <= minRows
        ? header + minRows * rowHeight
        : rowCount <= maxRows
          ? header + rowCount * rowHeight
          : header + maxRows * rowHeight;

    return `${height}px`;
  }

  onItemClick(row: InvoiceItemResponse): void {
    window.open(`/items/${row.itemCode}`, '_blank');
  }
  onReceiptClick(row: InvoicePaymentResponse): void {
    window.open(`/transactions/receipts/${row.receiptNumber}`, '_blank');
  }
}