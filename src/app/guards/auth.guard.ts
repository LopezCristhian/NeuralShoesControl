// src/app/guards/auth-role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { KeycloakService } from '../services/keycloak.service';

export const authRoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as string[]; // roles esperados de la ruta
  const isLoggedIn = keycloak.isLoggedIn();
  const userRoles = keycloak.getRoles(); // asegúrate de tener este método

  if (!isLoggedIn) {
    router.navigate(['/tienda']);
    return false;
  }

  const hasRole = expectedRoles.some(role => userRoles.includes(role));

  if (!hasRole) {
    router.navigate(['/tienda']);
    return false;
  }

  return true;
};
