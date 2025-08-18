import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Cliente {
  id?: number;
  nombre: string;
  apellido: string;
  cedula: string;
  numero: string;
  email?: string;
  fecha_nacimiento?: string;
  genero?: 'M' | 'F';
  locacion?: string;
  estado?: 'activo' | 'inactivo';
  fecha_creacion?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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
export class ClientesService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<Cliente[]> {
    return this.http.get<ApiResponse<Cliente[]>>(`${this.apiUrl}?limit=1000`)
      .pipe(map(response => response.data || []));
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http.get<ApiResponse<Cliente>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<ApiResponse<Cliente>>(this.apiUrl, cliente)
      .pipe(map(response => response.data));
  }

  updateCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<ApiResponse<Cliente>>(`${this.apiUrl}/${id}`, cliente)
      .pipe(map(response => response.data));
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }
}
