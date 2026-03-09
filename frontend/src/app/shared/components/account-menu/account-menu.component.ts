import { Component, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatMenuModule, MatMenu } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth/auth.service';
import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [MatMenuModule, MatIconModule, MatDividerModule],
  templateUrl: './account-menu.component.html',
  styleUrl: './account-menu.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AccountMenuComponent {

  @ViewChild('accountMenu', { static: true }) public menu!: MatMenu;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);

  public onLogout(): void {
    // Immediately clear session and navigate — don't make user wait
    this.authService.clearSession();
    this.snackbar.success('Logged out successfully', 4000);
    this.router.navigate(['/login']);

    // Fire-and-forget — backend cleanup happens in background
    this.authService.logout().subscribe();
  }

}
