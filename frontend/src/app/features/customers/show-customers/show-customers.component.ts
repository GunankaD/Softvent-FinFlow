// ANGULAR
import { 
  Component, 
  OnInit, 
  inject, 
  signal,  
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// SERVICES & COMPONENTS
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service'
import { CustomerService } from '../../../core/services/customer/customer.service';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component'

// DTOs
import { CustomerSummaryResponse } from '../../../core/models/customer.models';

@Component({
  selector: 'app-show-customers',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    DataTableComponent,
  ],
  templateUrl: './show-customers.component.html',
  styleUrls: ['./show-customers.component.scss']
})
export class ShowCustomersComponent implements OnInit {

  // DEPENDENCIES
  private readonly customerService = inject(CustomerService);
  private readonly snackbarService = inject(SnackbarService);

  // SIGNALS
  readonly loading = signal(false);

  // TABLE
  readonly customers = signal<CustomerSummaryResponse[]>([]);
  readonly columns = [
    { key: 'ccode', label: 'CCode' },
    { key: 'cname', label: 'Customer Name' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'mobileNumber', label: 'Mobile Number' },
    { key: 'emailId', label: 'Email Address' },
    { key: 'createdAt', label: 'Created On' }
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
}
