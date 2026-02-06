import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { RouterModule, Router } from '@angular/router';
import { merge } from 'rxjs';

// Material UI
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { 
  ReactiveFormsModule,
  FormsModule, 
  FormGroup, 
  FormControl,
  Validators,
} from '@angular/forms';

import { SignupRequest } from '../../core/models/auth.models';
import { AuthService } from '../../core/services/auth.service';

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
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {
 // FORM CONTROL FIELDS
  email = new FormControl('', [
    Validators.required,
    Validators.email,
    Validators.maxLength(100),
  ]);

  password = new FormControl('', [
    Validators.required,
    Validators.maxLength(30),
    Validators.minLength(6),
  ]);

  confirmPassword = new FormControl('', [
    Validators.required,
  ]);


  // SIGNALS
  emailError = signal('');
  passwordError = signal('');
  confirmPasswordError = signal('');

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  // SUBSCRIBE TO SIGNALS
  constructor(
    private authService: AuthService,
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

    merge(
      this.password.valueChanges,
      this.confirmPassword.valueChanges
    )
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.updateConfirmPasswordError());
  }

  // UPDATE FXS
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
      this.confirmPassword.invalid
    ) {
      return;
    }

    const payload: SignupRequest = {
      emailid: this.email.value!,
      password: this.password.value!,
    };

    this.authService.signup(payload).subscribe({
      next: () => {
        // this.snackbar.success('Account created successfully');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err.status === 409) {
          // this.snackbar.error('Account already exists');
        } else {
          // this.snackbar.error('Signup failed. Please try again.');
        }
      }
    });
  }

}
