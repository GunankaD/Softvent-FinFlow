// ANGULAR
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// MATERIAL UI
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// SERVICES & DTOs
import { CustomerService } from '../../../core/services/customer/customer.service';
import { CustomerSummaryResponse } from '../../../core/models/customer.models';

@Component({
  selector: 'app-show-customers',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './show-customers.component.html',
  styleUrls: ['./show-customers.component.scss']
})
export class ShowCustomersComponent implements OnInit {

  // DEPENDENCIES
  private readonly customerService = inject(CustomerService);
  private readonly snackBar = inject(MatSnackBar);

  // SIGNALS
  readonly loading = signal(false);
  readonly customers = signal<CustomerSummaryResponse[]>([]);

  readonly displayedColumns: string[] = [
    'ccode',
    'cname',
    'city',
    'state',
    'mobileNumber',
    'emailId',
    'createdAt'
  ];

  // Lifecycle Hook
  ngOnInit(): void {
    this.loadCustomers();
  }
  
  private loadCustomers(): void {

    this.loading.set(true);

    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.message ?? 'Failed to load customers',
          'Close',
          { duration: 4000 }
        );
        this.loading.set(false);
      }
    });
  }
}
