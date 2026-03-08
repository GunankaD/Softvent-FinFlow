// ANGULAR
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';

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
import { LoginRequest, LoginResponse } from '../../core/models/auth.models';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
export class LoginComponent {

  // FORM CONTROL FIELDS
  email = new FormControl('', [
    Validators.required,
    Validators.email,
    Validators.maxLength(50),
  ]);

  password = new FormControl('', [
    Validators.required,
    Validators.maxLength(30),
    Validators.minLength(6),
  ]);


  // SIGNALS
  emailError = signal('');
  passwordError = signal('');
  hidePassword = signal(true);
  loading = signal(false);

  // SUBSCRIBE TO SIGNALS
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

    merge(
      this.password.statusChanges,
      this.password.valueChanges
    )
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.updatePasswordError());
  }

  // UPDATE FXS
  updateEmailError() {
    if (this.email.hasError('required')) {
      this.emailError.set('Email is required');
    } else if (this.email.hasError('email')) {
      this.emailError.set('Invalid email format');
    } else if (this.email.hasError('maxlength')) {
      this.emailError.set('Email too long');
    } else if (this.email.hasError('invalidAuth')) {
      this.emailError.set('Check your credentials'); 
    } else {
      this.emailError.set('');
    }
  }

  updatePasswordError() {
    if (this.password.hasError('required')) {
      this.passwordError.set('Password is required');
    } else if (this.password.hasError('maxlength')) {
      this.passwordError.set('Password too long');
    } else if (this.password.hasError('minlength')) {
      this.passwordError.set('Minimum 6 characters');
    } else if (this.password.hasError('invalidAuth')) {
      this.passwordError.set(' ');
    } else {
      this.passwordError.set('');
    }
  }

  onLogin() {
     if (this.email.invalid || this.password.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);

    const payload: LoginRequest = {
      email: this.email.value!,
      password: this.password.value!,
    };

    this.authService.login(payload).subscribe({
      next: (response: LoginResponse) => {

        this.authService.setSession(response);

        this.loading.set(false);
        this.router.navigate(['/']);
        this.snackbar.success('You have successfully logged in', 6000);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          // 1. Turn the fields red manually
          this.email.setErrors({ invalidAuth: true });
          this.password.setErrors({ invalidAuth: true });

          // 2. Mark them as "touched" so the error styling shows up immediately
          this.email.markAsTouched();
          this.password.markAsTouched();
          this.snackbar.error('Invalid email or password', 6000);
        } 
        else {
          this.snackbar.error('Login failed. Please try again.');
        }
      }
    });
  }
}

