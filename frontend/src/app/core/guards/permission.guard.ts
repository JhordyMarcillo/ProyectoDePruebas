import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user || !this.authService.isAuthenticated()) {
          this.router.navigate(['/login']);
          return false;
        }

        // Obtener el permiso requerido de la ruta
        const requiredPermission = route.data['permission'] as string;
        
        if (!requiredPermission) {
          return true; // Si no se requiere un permiso específico, permitir acceso
        }

        // Verificar si el usuario tiene el permiso
        const hasPermission = this.authService.hasPermission(requiredPermission);
        
        if (!hasPermission) {
          // Redirigir al dashboard si no tiene permisos
          this.router.navigate(['/dashboard']);
          return false;
        }

        return true;
      })
    );
  }
}
