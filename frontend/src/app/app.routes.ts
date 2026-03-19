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
    {
        path: '**',
        redirectTo: ''
    }
];