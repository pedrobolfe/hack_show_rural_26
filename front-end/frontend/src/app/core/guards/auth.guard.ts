import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar se está autenticado (Signal ou localStorage)
  const isAuth = authService.isAuthenticated();
  const hasUserData = localStorage.getItem('user_data');

  if (isAuth || hasUserData) {
    return true;
  }

  console.log('🚫 AuthGuard: Usuário não autenticado, redirecionando para /login');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
