// ANGULAR
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// SERVICES & DEPENDENCIES
import { CustomerService } from '../../../core/services/customer/customer.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';

// MATERIAL UI
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// DTOs
import { CustomerDetailResponse, CustomerUpdateRequest } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss'],
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class CustomerDetailsComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);

  customer!: CustomerDetailResponse;
  form!: FormGroup;

  isSaving = signal(false);
  isDeleting = signal(false);
  isLoadingCustomer = signal(false);
  protected isEditMode = signal(false);

  private ccode!: string;

  ngOnInit(): void {
    this.ccode = this.route.snapshot.paramMap.get('ccode')!;
    this.initializeForm();
    this.loadCustomer();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      cname: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pincode: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gstNo: ['', Validators.required],
      panNo: ['', Validators.required],
      bankName: ['', Validators.required],
      branchName: ['', Validators.required],
      accountNo: ['', Validators.required]
    });

    this.form.disable();
  }

  private loadCustomer(): void {
    this.isLoadingCustomer.set(true);

    this.customerService.getByCode(this.ccode).subscribe({
      next: (response) => {
        this.snackbar.success('Customer details loaded successfully.');
        this.customer = response;
        this.form.patchValue(response);
        this.isLoadingCustomer.set(false);
      },
      error: () => {
        this.isLoadingCustomer.set(false);
        this.snackbar.error('Failed to load customer.');
        this.router.navigate(['/customers']);
      }
    });
  }

  enableEdit(): void {
    this.isEditMode.set(true);
    this.form.enable();
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
    this.form.patchValue(this.customer);
    this.form.disable();
  }

  private save(): void {
    if (this.form.invalid || this.form.pending) return;

    this.isSaving.set(true);
    this.form.disable();

    const request = this.form.value;

    this.customerService.updateByCode(this.ccode, request).subscribe({
      next: (response) => {
        this.customer = response;
        this.form.patchValue(response);
        this.isEditMode.set(false);
        this.isSaving.set(false);
        this.snackbar.success('Customer updated successfully.');
      },
      error: () => {
        this.isSaving.set(false);
        this.isEditMode.set(false);
        this.snackbar.error('Failed to update customer.');
      }
    });
  }
  confirmSave(): void {
    if (
      this.form.invalid || 
      this.form.pending || 
      this.isSaving() || 
      this.isDeleting() || 
      this.isLoadingCustomer()
    ) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Save Changes',
        message: `Are you sure you want to save changes to ${this.customer.ccode}?`,
        confirmColor: 'green',
        confirmButtonText: 'Save'
      },
      panelClass: 'custom-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) { return;}
      this.save();
    });
  }


  deleteCustomer(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Customer',
        message: `Are you sure you want to delete ${this.customer.ccode}?`,
        confirmColor: 'red',
        confirmButtonText: 'Delete'
      },
      panelClass: 'custom-dialog-panel'
    });


    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (!result) return;

      this.isDeleting.set(true);
      this.form.disable();

      this.customerService.deleteByCode(this.ccode).subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.isEditMode.set(false);
          this.snackbar.success('Customer deleted successfully.');
          this.router.navigate(['/customers']);
        },
        error: (err) => {
          this.isDeleting.set(false);
          this.isEditMode.set(false);

          if (err.status === 409) {
            this.snackbar.error('Customer cannot be deleted. Transactions exist.');
          } else {
            this.snackbar.error('Failed to delete customer.');
          }
        }
      });
    });
  }
}
