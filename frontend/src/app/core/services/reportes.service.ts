import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Cambio {
  id: number;
  id_cambiado: number;
  usuario_id?: string;
  descripcion: string;
  tipo_cambio: 'Agregar' | 'Actualizar' | 'Activo' | 'Inactivo';
  fecha: Date | string;
  tabla_afectada: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  getCambios(page?: number, limit?: number, search?: string): Observable<{ cambios: Cambio[]; total: number; totalPages: number }> {
    let params = new HttpParams();

    // Solo agregar parámetros si se especifican (para paginación)
    if (page) {
      params = params.set('page', page.toString());
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<Cambio[]>>(`${this.apiUrl}/cambios`, { params }).pipe(
      map(response => ({
        cambios: response.data || [],
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }))
    );
  }
}
