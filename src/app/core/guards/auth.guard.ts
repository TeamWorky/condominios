import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no está autenticado, redirigir al login
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  // Si está en la ruta de selección de condominio, permitir acceso
  if (state.url.includes('/auth/select-condominio')) {
    return true;
  }

  // Todos los usuarios (incluyendo SUPER_ADMIN) requieren condominio seleccionado
  const selectedCondominio = authService.getSelectedCondominio();

  // Si no tiene condominio seleccionado, redirigir a selección
  if (!selectedCondominio) {
    return router.createUrlTree(['/auth/select-condominio']);
  }

  return true;
};
