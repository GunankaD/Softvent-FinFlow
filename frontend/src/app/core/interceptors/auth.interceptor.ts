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
  catchError,
  BehaviorSubject,
  filter,
  take
} from 'rxjs';

// services
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly authService = inject(AuthService);

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

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
        return next.handle(request);
        }

        const token = this.authService.getAccessToken();

        if (!token) {
            return this.handleRefreshAndRetry(request, next);
        }

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

            // refresh already running
            if (this.isRefreshing) {

            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(token => {

                const retryRequest = request.clone({
                    withCredentials: true,
                    setHeaders: {
                    Authorization: `Bearer ${token}`
                    }
                });

                return next.handle(retryRequest);
                })
            );

            }

            // start refresh flow
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refresh().pipe(
            switchMap(response => {

                this.isRefreshing = false;

                this.authService.setSession(response);
                this.refreshTokenSubject.next(response.accessToken);

                const retryRequest = request.clone({
                withCredentials: true,
                setHeaders: {
                    Authorization: `Bearer ${response.accessToken}`
                }
                });

                return next.handle(retryRequest);
            }),
            catchError(err => {

                this.isRefreshing = false;
                this.authService.clearSession();

                return throwError(() => err);
            })
            );

        })
        );
    }

    private handleRefreshAndRetry(
        request: HttpRequest<any>,
        next: HttpHandler
        ): Observable<HttpEvent<any>> {

        this.isRefreshing = true;
        this.refreshTokenSubject.next(null);

        return this.authService.refresh().pipe(
            switchMap(response => {

                this.isRefreshing = false;

                this.authService.setSession(response);
                this.refreshTokenSubject.next(response.accessToken);

                const retryRequest = request.clone({
                    withCredentials: true,
                    setHeaders: {
                        Authorization: `Bearer ${response.accessToken}`
                    }
                });

                return next.handle(retryRequest);
            }),
            catchError(err => {

                this.isRefreshing = false;
                this.authService.clearSession();

                return throwError(() => err);
            })
        );
    }
}