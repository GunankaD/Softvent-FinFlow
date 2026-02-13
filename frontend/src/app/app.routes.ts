import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';

// CUSTOMER ROUTES
import { CustomersComponent } from './features/customers/customers.component';
import { ShowCustomersComponent } from './features/customers/show-customers/show-customers.component'

// AUTH ROUTES
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component'
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: SignupComponent },
    {path: 'forgot-password', component: ForgotPasswordComponent},
    {path: 'reset-password', component: ResetPasswordComponent},


    {path: 'customers', component: CustomersComponent},
    {path: 'customers/show-customers', component: ShowCustomersComponent}
];

