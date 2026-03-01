// ANGULAR
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// MATERIAL UI
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// SERVICES
import { CustomerValidatorsService } from '../../../core/services/customer/customer-validators.service';
import { CustomerService } from '../../../core/services/customer/customer.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';

// DTOs
import { 
  CustomerCreateRequest, 
  CustomerSummaryResponse 
} from '../../../core/models/customer.models';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss'
})
export class AddCustomerComponent implements OnDestroy {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly customerValidators = inject(CustomerValidatorsService);
  private readonly customerService = inject(CustomerService);
  private readonly snackbar = inject(SnackbarService);  


  protected isSubmitting = signal(false);

  protected readonly customerForm: FormGroup = this.fb.nonNullable.group({
    businessDetails: this.fb.nonNullable.group({
      ccode: this.fb.control(
        '',
        {
          validators: [Validators.required, Validators.maxLength(20)],
          asyncValidators: [this.customerValidators.ccodeAvailabilityValidator()],
          updateOn: 'blur'
        }
      ),

      cname: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],

      countryCode: ['+91', [
        Validators.required,
        Validators.pattern(/^\+\d{1,4}$/)
      ]],

      mobileNumber: ['', [
        Validators.required,
        Validators.pattern(/^\d{6,14}$/)
      ]],

      email: this.fb.control(
        '',
        {
          validators: [
            Validators.required,
            Validators.email,
            Validators.maxLength(100)
          ],
          asyncValidators: [this.customerValidators.emailAvailabilityValidator()],
          updateOn: 'blur'
        }
      ),

      gstNo: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/)
      ]],

      panNo: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
      ]]
    }),

    addressDetails: this.fb.nonNullable.group({
      address: ['', Validators.required],

      city: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],

      state: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],

      country: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],

      pincode: ['', [
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]]
    }),

    bankDetails: this.fb.nonNullable.group({
      bankName: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],

      branchName: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],

      accountNo: ['', [
        Validators.required,
        Validators.pattern(/^\d{9,18}$/)
      ]]
    })
  });

  protected get businessDetailsGroup(): FormGroup {
    return this.customerForm.get('businessDetails') as FormGroup;
  }
  protected get addressDetailsGroup(): FormGroup {
    return this.customerForm.get('addressDetails') as FormGroup;
  }

  protected get bankDetailsGroup(): FormGroup {
    return this.customerForm.get('bankDetails') as FormGroup;
  }


  protected onCancel(): void {
    this.router.navigate(['/customers']);
  }

  ngOnDestroy(): void {
    this.customerForm.reset();
  }

  protected onSubmit(): void {

    if (this.customerForm.invalid) return;

    this.isSubmitting.set(true);

    const { businessDetails, addressDetails, bankDetails } = this.customerForm.value;

    const payload: CustomerCreateRequest = {
      ccode: businessDetails.ccode,
      cname: businessDetails.cname,
      address: addressDetails.address,
      city: addressDetails.city,
      state: addressDetails.state,
      country: addressDetails.country,
      pincode: addressDetails.pincode,
      mobileNumber: businessDetails.mobileNumber,
      // mobileNumber: businessDetails.countryCode + businessDetails.mobileNumber,
      email: businessDetails.email,
      gstNo: businessDetails.gstNo,
      panNo: businessDetails.panNo,
      bankName: bankDetails.bankName,
      branchName: bankDetails.branchName,
      accountNo: bankDetails.accountNo
    };

    this.customerService.create(payload).subscribe({
      next: (response: CustomerSummaryResponse) => {
        this.isSubmitting.set(false);
        this.snackbar.success('Customer created successfully', 6000);
        this.router.navigate([`/customers/${response.ccode}`]);
      },
      error: () => {
        this.snackbar.error('Failed to create customer', 6000);
        this.isSubmitting.set(false);
      }
    });
  }

}
