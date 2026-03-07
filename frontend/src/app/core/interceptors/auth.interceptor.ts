import { Injectable, inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Observable,
  throwError,
  switchMap,
  catchError
} from 'rxjs';
import { Router } from '@angular/router';

// services
import { AuthService } from '../services/auth/auth.service';
import { SnackbarService } from '../services/snackbar/snackbar.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly snackbar = inject(SnackbarService);

  // endpoints that must NOT use interceptor logic
  private readonly authEndpoints = [
    '/auth/login',
    '/auth/refresh',
    '/auth/signup',
    '/auth/reset'
  ];

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    // skip auth endpoints  
    if (this.authEndpoints.some(url => request.url.includes(url))) {
      return next.handle(request.clone({ withCredentials: true }));
    }

    // can exist (valid or expired) OR be null (wiped from memory after refresh)
    const token = this.authService.getAccessToken();

    let authRequest = request.clone({
      withCredentials: true
    });

    if (token) {
      authRequest = authRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authRequest).pipe(

      catchError((error: HttpErrorResponse) => {

        if (error.status !== 401) {
          return throwError(() => error);
        }

        // attempt refresh through shared pipeline
        return this.authService.refresh().pipe(

          switchMap(response => {

            const retryRequest = request.clone({
              withCredentials: true,
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`
              }
            });

            return next.handle(retryRequest);
          }),

          catchError(err => {
            this.authService.clearSession();
            this.snackbar.error('Session expired. Please log in again.', 6000);
            this.router.navigate(['/login']);
            return throwError(() => err);
          })

        );

      })

    );

  }

}