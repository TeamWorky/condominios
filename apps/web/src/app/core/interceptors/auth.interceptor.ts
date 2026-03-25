import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login') ||
         url.includes('/auth/register') ||
         url.includes('/auth/refresh') ||
         url.includes('/auth/logout');
}

function addToken(request: any, token: string) {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No agregar token a las peticiones de autenticación
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  // Agregar token si existe
  const token = authService.getAccessToken();
  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Manejar error 401 con refresh token
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          const refreshToken = authService.getRefreshToken();

          if (refreshToken) {
            return authService.refreshTokens().pipe(
              switchMap((tokens) => {
                isRefreshing = false;
                refreshTokenSubject.next(tokens.accessToken);
                return next(addToken(req, tokens.accessToken));
              }),
              catchError((err) => {
                isRefreshing = false;
                authService.logout();
                router.navigate(['/auth/login']);
                return throwError(() => err);
              })
            );
          } else {
            isRefreshing = false;
            authService.logout();
            router.navigate(['/auth/login']);
            return throwError(() => new Error('No refresh token available'));
          }
        } else {
          // Esperar a que el refresh termine
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => next(addToken(req, token!)))
          );
        }
      }
      return throwError(() => error);
    })
  );
};
