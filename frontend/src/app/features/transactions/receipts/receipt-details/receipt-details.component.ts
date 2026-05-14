// ANGULAR
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// SERVICES
import { ReceiptService } from '../../../../core/services/receipt/receipt.service';
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';

// SHARED
import { GridTableComponent } from '../../../../shared/components/grid-table/grid-table.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { TableColumn } from '../../../../shared/components/models/table-column.model';
import { Breadcrumb } from '../../../../shared/components/models/breadcrumb.model';

// MATERIAL
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// DTOs
import {
  ReceiptDetailResponse,
  ReceiptApplicationResponse
} from '../../../../core/models/transaction.receipt.models';

@Component({
  selector: 'app-receipt-details',
  standalone: true,
  templateUrl: './receipt-details.component.html',
  styleUrls: ['./receipt-details.component.scss'],
  imports: [
    CommonModule,
    GridTableComponent,
    BreadcrumbComponent,
    MatProgressSpinnerModule
  ]
})
export class ReceiptDetailsComponent implements OnInit {

  // =====================
  // INJECTS
  // =====================
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly receiptService = inject(ReceiptService);
  private readonly snackbar = inject(SnackbarService);

  // =====================
  // STATE
  // =====================
  readonly receipt = signal<ReceiptDetailResponse | null>(null);
  readonly isLoadingReceipt = signal(true);

  private receiptNumber!: string;

  // =====================
  // DERIVED
  // =====================
  readonly applications = computed<ReceiptApplicationResponse[]>(() =>
    this.receipt()?.applications ?? []
  );

  readonly appliedAmount = computed(() => {
    const total = this.receipt()?.totalReceived ?? 0;
    const remaining = this.receipt()?.unappliedAmount ?? 0;
    return total - remaining;
  });

  // =====================
  // BREADCRUMB
  // =====================
  public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Transactions', route: '/transactions' },
      { label: 'Receipts', route: '/transactions/receipts/show-receipts' },
      { label: this.receipt()?.receiptNumber ?? '' }
    ];
  }

  // =====================
  // TABLE COLUMNS
  // =====================
  readonly applicationColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice No', flex: 1.5, minWidth: 160, type: 'text' },
    { key: 'appliedAmount', label: 'Amount ₹', flex: 1, minWidth: 140, type: 'currency' },
    { key: 'appliedAt', label: 'Date', flex: 1, minWidth: 140, type: 'date' },
    { key: 'viewIcon', label: 'View', flex: 0.5, minWidth: 70, type: 'viewIcon' }
  ];

  // =====================
  // LIFECYCLE
  // =====================
  ngOnInit(): void {
    this.receiptNumber = this.route.snapshot.paramMap.get('receiptNumber')!;
    this.loadReceipt();
  }

  // =====================
  // API CALL
  // =====================
  private loadReceipt(): void {
    this.isLoadingReceipt.set(true);

    this.receiptService.getByNumber(this.receiptNumber).subscribe({
      next: (response: ReceiptDetailResponse) => {
        this.receipt.set(response);
        this.isLoadingReceipt.set(false);
      },
      error: () => {
        this.isLoadingReceipt.set(false);
        this.snackbar.error('Failed to load receipt.');
        this.router.navigate(['/transactions/receipts']);
      }
    });
  }

  // =====================
  // GRID HEIGHT
  // =====================
  protected getGridHeight(rowCount: number, maxRows: number, minRows: number = 1): string {
    const header = 50;
    const rowHeight = 42.2;
    const filter = 49;

    const height =
      rowCount <= minRows
        ? header + minRows * rowHeight + filter
        : rowCount <= maxRows
          ? header + rowCount * rowHeight + filter
          : header + maxRows * rowHeight + filter;

    return `${height}px`;
  }

  // =====================
  // NAVIGATION
  // =====================
  protected onInvoiceClick(row: ReceiptApplicationResponse): void {
    window.open(`/transactions/invoices/${row.invoiceNumber}`, '_blank');
  }
}