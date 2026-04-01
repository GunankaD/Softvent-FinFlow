// ANGULAR
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// MATERIAL UI
import { MatSnackBarModule } from '@angular/material/snack-bar';

// DEPENDENCIES AND SERVICES
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';
import { GridTableComponent } from '../../../../shared/components/grid-table/grid-table.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { ReceiptService } from '../../../../core/services/receipt/receipt.service';

// DTOs
import { ReceiptSummaryResponse } from '../../../../core/models/transaction.receipt.models';
import { TableColumn } from '../../../../shared/components/models/table-column.model';
import { Breadcrumb } from '../../../../shared/components/models/breadcrumb.model';

@Component({
  selector: 'app-show-receipts',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    GridTableComponent,
    BreadcrumbComponent
  ],
  templateUrl: './show-receipts.component.html',
  styleUrls: ['./show-receipts.component.scss']
})
export class ShowReceiptsComponent implements OnInit {

  private readonly receiptService = inject(ReceiptService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly receipts = signal<ReceiptSummaryResponse[]>([]);

  public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Transactions', route: '/transactions' },
      { label: 'Receipts' }
    ];
  }

  readonly columns: TableColumn[] = [
    { key: 'receiptNumber',   label: 'Receipt No',      flex: 1,   minWidth: 140, type: 'text' },
    { key: 'ccode',           label: 'Customer Code',   flex: 1,   minWidth: 110, type: 'text' },
    { key: 'cname',           label: 'Customer Name',   flex: 2,   minWidth: 140, type: 'text' },
    { key: 'paymentMode',     label: 'Mode',            flex: 1,   minWidth: 140, type: 'text' },
    { key: 'totalReceived',   label: 'Total ₹',         flex: 1,   minWidth: 140, type: 'currency' },
    { key: 'unappliedAmount', label: 'Unapplied ₹',     flex: 1,   minWidth: 140, type: 'currency' },
    { key: 'receiptDate',     label: 'Receipt Date',    flex: 1.2, minWidth: 180, type: 'date' },
    { key: 'viewIcon',        label: 'View',            flex: 0.5, minWidth: 70,  type: 'viewIcon' }
  ];

  ngOnInit(): void {
    this.loadReceipts();
  }

  public loadReceipts(): void {
    this.loading.set(true);

    this.receiptService.getAll().subscribe({
      next: (response: ReceiptSummaryResponse[]) => {
        this.receipts.set([...response]);
        this.loading.set(false);
      },
      error: (err) => {
        this.snackbarService.error(
          err?.error?.message ?? 'Failed to load receipts',
          4000
        );
        this.loading.set(false);
      }
    });
  }

  public onRowClick(receipt: ReceiptSummaryResponse): void {
    this.router.navigate(['/transactions/receipts', receipt.receiptNumber]);
  }
}