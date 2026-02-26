// ANGULAR
import { 
  Component, 
  OnInit, 
  inject, 
  signal,  
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

// SERVICES & COMPONENTS
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service'
import { CustomerService } from '../../../core/services/customer/customer.service';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component'
import { GridTableComponent } from '../../../shared/components/grid-table/grid-table.component';

// DTOs
import { CustomerSummaryResponse } from '../../../core/models/customer.models';
import { TableColumn } from '../../../shared/components/models/table-column.model'

@Component({
  selector: 'app-show-customers',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    // DataTableComponent,
    GridTableComponent,
  ],
  templateUrl: './show-customers.component.html',
  styleUrls: ['./show-customers.component.scss']
})
export class ShowCustomersComponent implements OnInit {

  // DEPENDENCIES
  private readonly customerService = inject(CustomerService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly router = inject(Router);

  // SIGNALS
  readonly loading = signal(false);

  // TABLE
  readonly customers = signal<CustomerSummaryResponse[]>([]);
  readonly columns: TableColumn[] = [
  { key: 'ccode',        label: 'CCode',         flex: 1,   minWidth: 100 },
  { key: 'cname',        label: 'Customer Name', flex: 1.5, minWidth: 150 },
  { key: 'city',         label: 'City',          flex: 1,   minWidth: 130 },
  { key: 'state',        label: 'State',         flex: 1,   minWidth: 120 },
  { key: 'mobileNumber', label: 'Mobile Number', flex: 1.5, minWidth: 140 },
  { key: 'emailid',      label: 'Email Address', flex: 2,   minWidth: 170 },
  { key: 'createdAt',    label: 'Created On',    flex: 2,   minWidth: 180 },
  { key: 'eyeIcon',      label: 'View',          flex: 0.5, minWidth: 80  }
];


  // Lifecycle Hook
  ngOnInit(): void {
    this.loadCustomers();
  }
  
  loadCustomers(): void {

    this.loading.set(true);

    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.snackbarService.error(
          err?.error?.message ?? 'Failed to load customers',
          4000
        );
      }
    });
  }

  onRowClick(customer: CustomerSummaryResponse): void {
    this.router.navigate(['/customers', customer.ccode]);
  }
}
