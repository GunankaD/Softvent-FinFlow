// ANGULAR
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

// MATERIAL UI
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    RouterLink,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    CommonModule
  ]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {

    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearSession();
        this.snackbar.success('Logged out successfully', 4000);
        this.router.navigate(['/login']);
      },
      error: () => {
        // even if backend fails, clear session
        this.authService.clearSession();
        this.router.navigate(['/login']);
      }
    });

  }

  isAuthPage(): boolean {
    const url = this.router.url;

    return (
      url.includes('/login') ||
      url.includes('/signup') ||
      url.includes('/forgot-password') ||
      url.includes('/reset-password')
    );
  }
}
