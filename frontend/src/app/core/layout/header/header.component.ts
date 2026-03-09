// ANGULAR
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

// MATERIAL UI
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AccountMenuComponent } from '../../../shared/components/account-menu/account-menu.component';

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
    CommonModule,
    AccountMenuComponent,
    MatMenuModule
  ]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly router = inject(Router);

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
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
