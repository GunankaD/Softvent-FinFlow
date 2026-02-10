import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Shared Components
import { HeaderComponent } from '../app/core/layout/header/header.component';
import { FooterComponent } from '../app/core/layout/footer/footer.component';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    CommonModule
  ]
})
export class AppComponent {
  title = 'Softvent Finflow';

  sidebarOpen = false;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
