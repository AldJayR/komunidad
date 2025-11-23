import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        router.navigate(['/auth/login']);
        return false;
      }
    })
  );
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const requiredRole = route.data['role'] as 'resident' | 'official';

  return authService.userProfile$.pipe(
    filter(profile => profile !== null), // Wait for profile to be loaded
    take(1),
    map(profile => {
      if (!profile) {
        router.navigate(['/auth/login']);
        return false;
      }

      if (profile.role === requiredRole) {
        return true;
      } else {
        // Redirect to appropriate dashboard based on role
        if (profile.role === 'official') {
          router.navigate(['/official-dashboard']);
        } else {
          router.navigate(['/home']);
        }
        return false;
      }
    })
  );
};
