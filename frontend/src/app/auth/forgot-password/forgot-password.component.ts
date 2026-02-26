// ANGULAR
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// MATERIAL UI
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
import { ForgotPasswordRequest } from '../../core/models/auth.models';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
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
export class ForgotPasswordComponent {

  // FORM CONTROLS FIELDS
  email = new FormControl('', [
    Validators.required,
    Validators.email,
    Validators.maxLength(50),
  ]);

  // SIGNALS
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private snackbar: SnackbarService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.email.invalid || this.loading()) return;

    this.loading.set(true);

    const payload: ForgotPasswordRequest = {
      email: this.email.value!,
    };

    this.authService.forgotPassword(payload).subscribe({
      next: () => {
        // SAME message always (security)
        this.loading.set(false);
        this.snackbar.success(
          'If an account exists, a reset link has been sent to your email.', 6000
        );
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading.set(false);
        this.snackbar.error('Something went wrong. Please try again.');
      },
    });
  }
}
