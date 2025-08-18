import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error';
        let shouldShowError = true;

        // No mostrar errores automáticos para ciertas rutas GET (consultas de datos)
        if (req.method === 'GET' && (
          req.url.includes('/servicios') || 
          req.url.includes('/productos/activos')
        )) {
          shouldShowError = false;
        }

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = error.error.message;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || 'Datos inválidos';
              break;
            case 401:
              errorMessage = 'No autorizado';
              this.authService.logout();
              this.router.navigate(['/auth/login']);
              shouldShowError = false; // No mostrar ya que redirige
              break;
            case 403:
              errorMessage = 'No tienes permisos para realizar esta acción';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado';
              break;
            case 409:
              errorMessage = error.error?.message || 'Conflicto de datos';
              break;
            case 422:
              errorMessage = error.error?.message || 'Datos de entrada inválidos';
              break;
            case 500:
              errorMessage = 'Error interno del servidor';
              break;
            default:
              errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
          }
        }

        // Mostrar mensaje de error solo si no está excluido
        if (shouldShowError) {
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }

        return throwError(() => error);
      })
    );
  }
}
