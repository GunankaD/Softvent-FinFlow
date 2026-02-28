import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-items',
  standalone: true,
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule
  ]
})
export class ItemsComponent {

  constructor(private readonly router: Router) {}

  public onAddItem(): void {
    this.router.navigate(['/items/add-item']);
  }

  public onViewItems(): void {
    this.router.navigate(['/items/show-items']);
  }
}