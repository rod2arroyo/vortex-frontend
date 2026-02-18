import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos la señal (recuerda ejecutarla porque es una signal)
  if (authService.isLoggedIn()) {
    return true;
  }

  // Si no está logueado, lo mandamos al dashboard
  router.navigate(['/dashboard']);
  return false;
};
