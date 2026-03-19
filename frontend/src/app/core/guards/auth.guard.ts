import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of, catchError, map } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';

export const AuthGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!environment.authEnabled) {
    return true;
  }

  // already authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // attempt refresh
  return authService.refresh().pipe(
    map(response => {
      authService.setSession(response);
      return true;
    }),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    })
  );
};