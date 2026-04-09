// ANGULAR
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// MATERIAL UI
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-transactions',
  standalone: true,
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    RouterModule
  ]
})
export class TransactionsComponent {

  constructor(private readonly router: Router) {}

  public onViewInvoices(): void {
    this.router.navigate(['/transactions/invoices/show-invoices']);
  }

  public onAddInvoice(): void {
    this.router.navigate(['/transactions/invoices/add-invoice']);
  }

  public onViewReceipts(): void {
    this.router.navigate(['/transactions/receipts/show-receipts']);
  }

  public onAddReceipt(): void {
    this.router.navigate(['/transactions/receipts/add-receipt']);
  }

  public onApplyPayment(): void {
    this.router.navigate(['/transactions/payment-applications']);
  }
}