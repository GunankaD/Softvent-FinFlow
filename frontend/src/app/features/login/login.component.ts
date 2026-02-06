import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
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

import { LoginRequest } from '../../core/models/auth.models';
import { AuthService } from '../../core/services/auth.service';

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
    Validators.maxLength(100),
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
  }

  // UPDATE FXS
  updateEmailError() {
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

  updatePasswordError() {
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

  onLogin() {
    if (this.email.invalid || this.password.invalid) return;

    const payload: LoginRequest = {
      emailid: this.email.value!,
      password: this.password.value!,
    };

    this.authService.login(payload).subscribe({
      next: () => {
        this.router.navigate(['/'])
      },
      error: (err) => {
        if (err.status === 401) {
          this.passwordError.set('Invalid email or password');
        }
      }
    });
  }
}

