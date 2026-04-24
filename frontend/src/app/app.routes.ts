import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // HOME
    { path: '', component: HomeComponent, canActivate: [AuthGuard]},

    // AUTH ROUTES
    {
        path: 'login',
        loadComponent: () =>
            import('./auth/login/login.component')
            .then(m => m.LoginComponent)
    },
    {
        path: 'signup',
        loadComponent: () =>
            import('./auth/signup/signup.component')
            .then(m => m.SignupComponent)
    },
    {
        path: 'signup-init',
        loadComponent: () =>
            import('./auth/signup-init/signup-init.component')
            .then(m => m.SignupInitComponent)
    },
    {
        path: 'forgot-password',
        loadComponent: () =>
            import('./auth/forgot-password/forgot-password.component')
            .then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'reset-password',
        loadComponent: () =>
            import('./auth/reset-password/reset-password.component')
            .then(m => m.ResetPasswordComponent)
    },

    // CUSTOMER ROUTES
    {
        path: 'customers',
        loadComponent: () =>
            import('./features/customers/customers.component')
            .then(m => m.CustomersComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'customers/show-customers',
        loadComponent: () =>
            import('./features/customers/show-customers/show-customers.component')
            .then(m => m.ShowCustomersComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'customers/add-customer',
        loadComponent: () =>
            import('./features/customers/add-customer/add-customer.component')
            .then(m => m.AddCustomerComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'customers/:ccode',
        loadComponent: () =>
            import('./features/customers/customer-details/customer-details.component')
            .then(m => m.CustomerDetailsComponent),
        canActivate: [AuthGuard]
    },

    // ITEM ROUTES
    {
        path: 'items',
        loadComponent: () =>
            import('./features/items/items.component')
            .then(m => m.ItemsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'items/add-item',
        loadComponent: () =>
            import('./features/items/add-item/add-item.component')
            .then(m => m.AddItemComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'items/show-items',
        loadComponent: () =>
            import('./features/items/show-items/show-items.component')
            .then(m => m.ShowItemsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'items/:icode',
        loadComponent: () =>
            import('./features/items/item-details/item-details.component')
            .then(m => m.ItemDetailsComponent),
        canActivate: [AuthGuard]
    },

    // TRANSACTIONS ROUTES
    {
        path: 'transactions',
        loadComponent: () =>
            import('./features/transactions/transactions.component')
            .then(m => m.TransactionsComponent),
        canActivate: [AuthGuard]
    },

    // INVOICE ROUTES
    {
        path: 'transactions/invoices/show-invoices',
        loadComponent: () =>
            import('./features/transactions/invoices/show-invoices/show-invoices.component')
            .then(m => m.ShowInvoicesComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'transactions/invoices/add-invoice',
        loadComponent: () =>
            import('./features/transactions/invoices/add-invoice/add-invoice.component')
            .then(m => m.AddInvoiceComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'transactions/invoices/:invoiceNumber',
        loadComponent: () =>
            import('./features/transactions/invoices/invoice-details/invoice-details.component')
            .then(m => m.InvoiceDetailsComponent),
        canActivate: [AuthGuard]
    },

    // RECEIPT ROUTES
    {
        path: 'transactions/receipts/show-receipts',
        loadComponent: () =>
            import('./features/transactions/receipts/show-receipts/show-receipts.component')
            .then(m => m.ShowReceiptsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'transactions/receipts/add-receipt',
        loadComponent: () =>
            import('./features/transactions/receipts/add-receipt/add-receipt.component')
            .then(m => m.AddReceiptComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'transactions/receipts/:receiptNumber',
        loadComponent: () =>
            import('./features/transactions/receipts/receipt-details/receipt-details.component')
            .then(m => m.ReceiptDetailsComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'transactions/payment-applications',
        loadComponent: () =>
            import('./features/transactions/payment-application/payment-application.component')
            .then(m => m.PaymentApplicationComponent),
        canActivate: [AuthGuard]
    },


    // WILDCARD ROUTE TO HOME
    {
        path: '**',
        redirectTo: ''
    }
];