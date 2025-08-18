import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Proveedor {
  id?: number;
  nombre_empresa: string;
  email?: string;
  numero?: string;
  web?: string;
  estado: string;
  fecha_creacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<{success: boolean; data: Proveedor[]}>(this.apiUrl)
      .pipe(map((response: {success: boolean; data: Proveedor[]}) => response.data || []));
  }

  getProveedor(id: number): Observable<Proveedor> {
    return this.http.get<{success: boolean; data: Proveedor}>(`${this.apiUrl}/${id}`)
      .pipe(map((response: {success: boolean; data: Proveedor}) => response.data));
  }

  createProveedor(proveedor: Omit<Proveedor, 'id' | 'fecha_creacion'>): Observable<Proveedor> {
    return this.http.post<{success: boolean; data: Proveedor}>(this.apiUrl, proveedor)
      .pipe(map((response: {success: boolean; data: Proveedor}) => response.data));
  }

  updateProveedor(id: number, proveedor: Partial<Proveedor>): Observable<Proveedor> {
    return this.http.put<{success: boolean; data: Proveedor}>(`${this.apiUrl}/${id}`, proveedor)
      .pipe(map((response: {success: boolean; data: Proveedor}) => response.data));
  }

  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
