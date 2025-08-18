import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ProductoServicio {
  id: number;
  nombre: string;
  cantidad: number;
  costo: number;
  precio?: number;
}

export interface Servicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  productos?: ProductoServicio[];
  coste_total: number;
  costo_servicio: number;
  estado: 'activo' | 'inactivo';
  fecha_creacion?: Date | string;
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
export class ServiciosService {
  private apiUrl = `${environment.apiUrl}/servicios`;

  constructor(private http: HttpClient) {}

  getServicios(page: number = 1, limit: number = 50, search?: string): Observable<{ servicios: Servicio[]; total: number; totalPages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<Servicio[]>>(this.apiUrl, { params }).pipe(
      map(response => ({
        servicios: response.data || [],
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }))
    );
  }

  getServicio(id: number): Observable<Servicio> {
    return this.http.get<ApiResponse<Servicio>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data!)
    );
  }

  createServicio(servicio: Omit<Servicio, 'id' | 'fecha_creacion'>): Observable<Servicio> {
    return this.http.post<ApiResponse<Servicio>>(this.apiUrl, servicio).pipe(
      map(response => response.data!)
    );
  }

  updateServicio(id: number, servicio: Partial<Servicio>): Observable<Servicio> {
    return this.http.put<ApiResponse<Servicio>>(`${this.apiUrl}/${id}`, servicio).pipe(
      map(response => response.data!)
    );
  }

  deleteServicio(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => void 0)
    );
  }

  toggleEstado(id: number, estado: 'activo' | 'inactivo'): Observable<Servicio> {
    return this.http.patch<ApiResponse<Servicio>>(`${this.apiUrl}/${id}/estado`, { estado }).pipe(
      map(response => response.data!)
    );
  }

  getServiciosActivos(): Observable<Servicio[]> {
    return this.http.get<ApiResponse<Servicio[]>>(`${this.apiUrl}/activos`).pipe(
      map(response => response.data || [])
    );
  }
}
