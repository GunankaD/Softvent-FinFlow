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
import { InvoiceService } from '../../../../core/services/invoice/invoice.service';

// DTOs
import { InvoiceSummaryResponse } from '../../../../core/models/invoice.models';
import { TableColumn } from '../../../../shared/components/models/table-column.model';
import { Breadcrumb } from '../../../../shared/components/models/breadcrumb.model';

@Component({
  selector: 'app-show-invoices',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    GridTableComponent,
    BreadcrumbComponent
  ],
  templateUrl: './show-invoices.component.html',
  styleUrls: ['./show-invoices.component.scss']
})
export class ShowInvoicesComponent implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly invoices = signal<InvoiceSummaryResponse[]>([]);

  public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Transactions', route: '/transactions' },
      { label: 'Invoices' }
    ];
  }

  readonly columns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice No',     flex: 1,   minWidth: 140, type: 'text' },
    { key: 'ccode',         label: 'Customer Code',  flex: 1,   minWidth: 110, type: 'text' },
    { key: 'cname',         label: 'Customer Name',  flex: 2,   minWidth: 160, type: 'text' },
    { key: 'totalAmount',   label: 'Total ₹',        flex: 1,   minWidth: 140, type: 'currency' },
    { key: 'balanceAmount', label: 'Balance ₹',      flex: 1,   minWidth: 140, type: 'currency' },
    { key: 'status',        label: 'Status',         flex: 0.7, minWidth: 90,  type: 'text' },
    { key: 'invoiceDate',   label: 'Invoice Date',   flex: 1.2, minWidth: 130, type: 'date' },
    { key: 'dueDate',       label: 'Due Date',       flex: 1.2, minWidth: 130, type: 'date' },
    { key: 'viewIcon',      label: 'View',           flex: 0.5, minWidth: 70,  type: 'icon' }
  ];

  ngOnInit(): void {
    this.loadInvoices();
  }

  public loadInvoices(): void {
    this.loading.set(true);

    this.invoiceService.getAll().subscribe({
      next: (response: InvoiceSummaryResponse[]) => {
        this.invoices.set([...response]);
        this.loading.set(false);
      },
      error: (err) => {
        this.snackbarService.error(
          err?.error?.message ?? 'Failed to load invoices',
          4000
        );
        this.loading.set(false);
      }
    });
  }

  public onRowClick(invoice: InvoiceSummaryResponse): void {
    this.router.navigate(['/transactions/invoices', invoice.invoiceNumber]);
  }
}