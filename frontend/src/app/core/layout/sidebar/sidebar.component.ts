import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterModule, MatIconModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() linkClicked = new EventEmitter<void>();

  customersOpen = false;

  toggleCustomers(): void {
    this.customersOpen = !this.customersOpen;
  }
    
  onLinkClick(): void {
    this.linkClicked.emit();
  }
}
