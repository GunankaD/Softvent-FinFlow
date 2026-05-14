// ANGULAR
import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// SERVICES & COMPONENTS
import { SnackbarService } from '../../core/services/snackbar/snackbar.service';
import { OutstandingSummaryService } from '../../core/services/outstanding-summary/outstanding-summary.service';

import { MatSnackBarModule } from '@angular/material/snack-bar';

import { GridTableComponent } from '../../shared/components/grid-table/grid-table.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

// DTOs
import { OutstandingSummaryResponse } from '../../core/models/outstanding-summary.models';

import { TableColumn } from '../../shared/components/models/table-column.model';
import { Breadcrumb } from '../../shared/components/models/breadcrumb.model';

@Component({
  selector: 'app-outstanding-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    GridTableComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './outstanding-summary.component.html',
  styleUrls: ['./outstanding-summary.component.scss']
})
export class OutstandingSummaryComponent implements OnInit {

  // DEPENDENCIES
  private readonly outstandingSummaryService =
    inject(OutstandingSummaryService);

  private readonly snackbarService =
    inject(SnackbarService);

  private readonly router =
    inject(Router);

  // SIGNALS
  readonly loading = signal(false);

  // BREADCRUMBS
  public breadcrumbs(): Breadcrumb[] {
    return [
      { label: 'Outstanding Summary' }
    ];
  }

  // TABLE
  readonly outstandingSummary =
    signal<OutstandingSummaryResponse[]>([]);

  readonly columns: TableColumn[] = [
    { key: 'ccode',               label: 'CCode',            flex: 1,   minWidth: 110, type: 'text'     },
    { key: 'cname',               label: 'Customer Name',    flex: 1.8, minWidth: 180, type: 'text'     },

    { key: 'totalInvoiceAmount',  label: 'Invoiced ₹',       flex: 1.2, minWidth: 170, type: 'currency' },
    { key: 'totalReceiptAmount',  label: 'Received ₹',       flex: 1.2, minWidth: 170, type: 'currency' },
    { key: 'totalAppliedAmount',  label: 'Applied ₹',        flex: 1.2, minWidth: 170, type: 'currency' },

    { key: 'netOutstanding',      label: 'Net Outstanding',  flex: 1.3, minWidth: 190, type: 'currency' },

    { key: 'viewIcon',            label: 'View',             flex: 0.5, minWidth: 70,  type: 'viewIcon' }
  ];


  // LIFECYCLE
  ngOnInit(): void {
    this.loadOutstandingSummary();
  }

  // LOADERS
  loadOutstandingSummary(): void {

    this.loading.set(true);

    this.outstandingSummaryService
      .getOutstandingSummary()
      .subscribe({

        next: (response: OutstandingSummaryResponse[]) => {
          this.outstandingSummary.set(response);
          this.loading.set(false);
        },

        error: (err) => {

          this.snackbarService.error(
            err?.error?.message ?? 'Failed to load outstanding summary',
            4000
          );

          this.loading.set(false);
        }
      });
  }

  // TABLE ACTIONS
  onRowClick(row: OutstandingSummaryResponse): void {
    this.router.navigate(['/customers', row.ccode]);
  }
}