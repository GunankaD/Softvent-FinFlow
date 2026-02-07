import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth/auth.service';
import { SnackbarService } from '../../core/services/snackbar/snackbar.service';
import { ResetPasswordRequest } from '../../core/models/auth.models';

import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {

  private token: string | null = null;

  // FORM CONTROL FIELDS
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(30),
  ]);

  confirmPassword = new FormControl('', [
    Validators.required,
  ]);

  // SIGNALS
  passwordError = signal('');
  confirmPasswordError = signal('');

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  
  loading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackbar: SnackbarService,
    private router: Router
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.snackbar.error('Invalid reset link');
      this.router.navigate(['/login']);
    }

    merge(
      this.password.statusChanges,
      this.password.valueChanges
    )
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.updatePasswordError());

    merge(
      this.password.valueChanges,
      this.confirmPassword.valueChanges
    )
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.updateConfirmPasswordError());
  }

  private updatePasswordError() {
    if (this.password.hasError('required')) {
      this.passwordError.set('Password is required');
    } else if (this.password.hasError('minlength')) {
      this.passwordError.set('Minimum 6 characters');
    } else if (this.password.hasError('maxlength')) {
      this.passwordError.set('Password too long');
    } else {
      this.passwordError.set('');
    }
  }

  private updateConfirmPasswordError() {
    if (this.confirmPassword.hasError('required')) {
      this.confirmPasswordError.set('Confirm password is required');
      return;
    }

    if (this.password.value !== this.confirmPassword.value) {
      this.confirmPasswordError.set('Passwords do not match');
      this.confirmPassword.setErrors({ mismatch: true });
    } else {
      this.confirmPassword.setErrors(null);
      this.confirmPasswordError.set('');
    }
  }

  onSubmit() {
    if (
      !this.token ||
      this.password.invalid ||
      this.confirmPassword.invalid ||
      this.password.value != this.confirmPassword.value ||
      this.loading()
    ) {
      return;
    }

    this.loading.set(true);

    const payload: ResetPasswordRequest = {
      token: this.token,
      newPassword: this.password.value!,
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackbar.success('Password reset successful. Please log in.', 5000);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);

        if (err.status === 401) {
          this.snackbar.error('Reset link is invalid or has expired', 5000);
          this.router.navigate(['/forgot-password']);
        } else {
          this.snackbar.error('Failed to reset password. Try again.');
        }
      },
    });
  }
}

