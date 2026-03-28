import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  // On admin panel routes, prefer admin token. Elsewhere, prefer user token.
  const isAdminRoute = router.url.startsWith('/admin');
  const token = isAdminRoute
    ? (authService.getToken() || userService.getToken())
    : (userService.getToken() || authService.getToken());

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};
