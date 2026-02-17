// ANGULAR
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// MATERIAL UI
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-customers',
  standalone: true,
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule
  ]
})
export class CustomersComponent {

  constructor(private readonly router: Router) {}

  public onAddCustomer(): void {
    this.router.navigate(['/customers/add-customer']);
  }

  public onViewCustomers(): void {
    this.router.navigate(['/customers/show-customers']);
  }
}
