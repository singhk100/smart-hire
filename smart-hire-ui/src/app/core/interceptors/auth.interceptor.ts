import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/refresh');

  const token = auth.getAccessToken();
  let authReq = req;

  if (token && !isAuthEndpoint) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthEndpoint && auth.getRefreshToken()) {
        return auth.refreshToken().pipe(
          switchMap(() => {
            const refreshedAccessToken = auth.getAccessToken();
            if (!refreshedAccessToken) {
              auth.logout();
              return throwError(() => err);
            }

            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${refreshedAccessToken}` }
            });
            return next(retryReq);
          }),
          catchError(() => {
            auth.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
