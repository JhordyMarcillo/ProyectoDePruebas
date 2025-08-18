import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@core/models';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  genero: 'M' | 'F';
  fecha_nacimiento: string;
  cedula: string;
  usuario: string;
  password?: string;
  perfil: string;
  permisos: string;
  estado: 'activo' | 'inactivo';
  fecha_creacion?: string;
}

export interface CreateUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  genero: 'M' | 'F';
  fecha_nacimiento: string;
  cedula: string;
  usuario: string;
  password: string;
  perfil: string;
  permisos?: string;
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  genero?: 'M' | 'F';
  fecha_nacimiento?: string;
  cedula?: string;
  usuario?: string;
  password?: string;
  perfil?: string;
  permisos?: string;
  estado?: 'activo' | 'inactivo';
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getAll(page?: number, limit?: number, search?: string): Observable<ApiResponse<{usuarios: Usuario[], total: number}>> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (search) params = params.set('search', search);

    return this.http.get<ApiResponse<{usuarios: Usuario[], total: number}>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`);
  }

  create(usuario: CreateUsuarioRequest): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.apiUrl, usuario);
  }

  update(id: number, usuario: UpdateUsuarioRequest): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`, usuario);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.patch<ApiResponse<Usuario>>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  changePassword(id: number, passwords: {currentPassword: string, newPassword: string, confirmPassword: string}): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/change-password`, passwords);
  }

  getStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats`);
  }
}
