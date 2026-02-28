import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';

// CUSTOMER ROUTES
import { CustomersComponent } from './features/customers/customers.component';
import { ShowCustomersComponent } from './features/customers/show-customers/show-customers.component';
import { AddCustomerComponent } from './features/customers/add-customer/add-customer.component';

// AUTH ROUTES
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component'
import { SignupInitComponent } from './auth/signup-init/signup-init.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [
    // HOME
    {path: '', component: HomeComponent},

    // AUTH
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: SignupComponent },
    {path: 'signup-init', component: SignupInitComponent},
    {path: 'forgot-password', component: ForgotPasswordComponent},
    {path: 'reset-password', component: ResetPasswordComponent},

    // CUSTOMERS
    {path: 'customers', component: CustomersComponent},
    {path: 'customers/show-customers', component: ShowCustomersComponent},
    {path: 'customers/add-customer', component: AddCustomerComponent},
    {path: 'customers/:ccode',
        loadComponent: () =>
            import('./features/customers/customer-details/customer-details.component')
            .then(m => m.CustomerDetailsComponent)
    },
    {path: 'items',
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
    {path: 'items/show-items',
        loadComponent: () =>
            import('./features/items/show-items/show-items.component')
            .then(m => m.ShowItemsComponent)
    }

];

