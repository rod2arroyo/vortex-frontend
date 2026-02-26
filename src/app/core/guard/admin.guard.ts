import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../auth/user.service';

export const adminGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const user = userService.currentUser();

  if (user && user.role === 'admin') {
    return true;
  }

  router.navigate(['/']);
  return false;
};
