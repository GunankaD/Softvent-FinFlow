import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    // HOME
    { path: '', component: HomeComponent },

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
            .then(m => m.CustomersComponent)
    },
    {
        path: 'customers/show-customers',
        loadComponent: () =>
            import('./features/customers/show-customers/show-customers.component')
            .then(m => m.ShowCustomersComponent)
    },
    {
        path: 'customers/add-customer',
        loadComponent: () =>
            import('./features/customers/add-customer/add-customer.component')
            .then(m => m.AddCustomerComponent)
    },
    {
        path: 'customers/:ccode',
        loadComponent: () =>
            import('./features/customers/customer-details/customer-details.component')
            .then(m => m.CustomerDetailsComponent)
    },

    // ITEM ROUTES
    {
        path: 'items',
        loadComponent: () =>
            import('./features/items/items.component')
            .then(m => m.ItemsComponent)
    },
    {
        path: 'items/add-item',
        loadComponent: () =>
            import('./features/items/add-item/add-item.component')
            .then(m => m.AddItemComponent)
    },
    {
        path: 'items/show-items',
        loadComponent: () =>
            import('./features/items/show-items/show-items.component')
            .then(m => m.ShowItemsComponent)
    },
    {
        path: 'items/:icode',
        loadComponent: () =>
            import('./features/items/item-details/item-details.component')
            .then(m => m.ItemDetailsComponent)
    },
];