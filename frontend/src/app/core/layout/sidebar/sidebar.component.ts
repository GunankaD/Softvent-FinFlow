import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() linkClicked = new EventEmitter<void>();
  
  onLinkClick(): void {
    this.linkClicked.emit();
  }
}
