// ANGULAR
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule, Router } from '@angular/router';

// RxJS
import { merge } from 'rxjs';

// MATERIAL UI
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { 
  ReactiveFormsModule,
  FormsModule, 
  FormGroup, 
  FormControl,
  Validators,
} from '@angular/forms';

// SERVICES
import { AuthService } from '../../core/services/auth/auth.service';
import { SnackbarService } from '../../core/services/snackbar/snackbar.service';

// DTOs
import { SignupCompleteRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {
 // FORM CONTROL FIELDS 
  email = new FormControl({ value: '', disabled: true });

  password = new FormControl('', [
    Validators.required,
    Validators.maxLength(30),
    Validators.minLength(6),
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

  private verificationToken!: string;

  // SUBSCRIBE TO SIGNALS
  constructor(
    private authService: AuthService,
    private snackbar: SnackbarService,
    private router: Router
  ) {
    
    const nav = this.router.getCurrentNavigation();
    const state =
      nav?.extras.state ||
      history.state;

    if (!state?.email || !state?.token) {
      this.snackbar.error('OTP verification required');
      this.router.navigate(['/signup-init']);
      return;
    }

    this.verificationToken = state.token;

    this.email.setValue(state.email);
    this.email.disable();

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

  // UPDATE FUNCTION
  private updatePasswordError() {
    if (this.password.hasError('required')) {
      this.passwordError.set('Password is required');
    } else if (this.password.hasError('maxlength')) {
      this.passwordError.set('Password too long');
    } else if (this.password.hasError('minlength')) {
      this.passwordError.set('Minimum 6 characters');
    } else {
      this.passwordError.set('defaulting');
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

  onSignup() {
    if (
      this.email.invalid ||
      this.password.invalid ||
      this.password.value != this.confirmPassword.value ||
      this.confirmPassword.invalid ||
      this.loading()
    ) {
      return;
    }

    this.loading.set(true);

    const payload: SignupCompleteRequest = {
      verificationToken: this.verificationToken,
      password: this.password.value!,
    };

    this.authService.signupComplete(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackbar.success('Account created successfully');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.snackbar.error('Account already exists');
        } else {
          this.snackbar.error('Signup failed. Please try again.');
        }
      }
    });
  }

}
