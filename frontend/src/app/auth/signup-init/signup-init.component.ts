import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// RxJS
import { merge } from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

// MATERIAL
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

// SERVICES
import { AuthService } from '../../core/services/auth/auth.service';
import { SnackbarService } from '../../core/services/snackbar/snackbar.service';

// DTOs
import {
  SignupInitRequest,
  SignupVerifyRequest
} from '../../core/models/auth.models';

@Component({
  standalone: true,
  selector: 'app-signup-init',
  templateUrl: './signup-init.component.html',
  styleUrl: './signup-init.component.scss',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupInitComponent {

  // SIGNALS - STEP CONTROL
  otpSent = signal(false);
  loading = signal(false);
  emailError = signal('');

  // EMAIL CONTROL
  email = new FormControl('', [
    Validators.required,
    Validators.email,
    Validators.maxLength(50),
  ]);

  // OTP CONTROL
  otp = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(6),
  ]);

  constructor(
    private authService: AuthService,
    private snackbar: SnackbarService,
    private router: Router
  ) {
    merge(
      this.email.statusChanges,
      this.email.valueChanges
    )
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.updateEmailError());
  }

  private updateEmailError() {
    if (this.email.hasError('required')) {
      this.emailError.set('Email is required');
    } else if (this.email.hasError('email')) {
      this.emailError.set('Invalid email format');
    } else if (this.email.hasError('maxlength')) {
      this.emailError.set('Email too long');
    } else {
      this.emailError.set('defaulting');
    }
  }

  onSendOtp() {
    if (this.email.invalid || this.loading()) return;

    this.loading.set(true);

    const payload: SignupInitRequest = {
      email: this.email.value!,
    };

    this.authService.signupInit(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.otpSent.set(true);
        this.snackbar.success('OTP sent to your email.', 4000);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.snackbar.error('Account already exists');
          this.router.navigate(['/login']);
        } else {
          this.snackbar.error('Failed to send OTP. Please try again.');
        }
      },
    });
  }

  onVerifyOtp() {
    if (this.otp.invalid || this.loading()) return;

    this.loading.set(true);

    const payload: SignupVerifyRequest = {
      email: this.email.value!,
      otp: this.otp.value!,
    };

    this.authService.signupVerify(payload).subscribe({
      next: (res) => {
        this.loading.set(false);

        this.router.navigate(['/signup'], {
          state: {
            email: this.email.value!,
            token: res.verificationToken,
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.snackbar.error('Invalid or expired OTP.');
      },
    });
  }
}
