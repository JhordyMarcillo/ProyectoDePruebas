import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Venta {
  id?: number;
  cedula_cliente: string;
  productos?: any; // JSON con productos
  servicios?: any; // JSON con servicios
  iva: number;
  total_pagar: number;
  metodo: string;
  vendedor: string;
  estado: 'activo' | 'inactivo';
  fecha_creacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  getVentas(): Observable<Venta[]> {
    return this.http.get<{success: boolean; data: Venta[]}>(`${this.apiUrl}?limit=1000`)
      .pipe(map((response: {success: boolean; data: Venta[]}) => response.data || []));
  }

  getVenta(id: number): Observable<Venta> {
    return this.http.get<{success: boolean; data: Venta}>(`${this.apiUrl}/${id}`)
      .pipe(map((response: {success: boolean; data: Venta}) => response.data));
  }

  createVenta(venta: Omit<Venta, 'id' | 'fecha_creacion'>): Observable<Venta> {
    return this.http.post<{success: boolean; data: Venta}>(this.apiUrl, venta)
      .pipe(map((response: {success: boolean; data: Venta}) => response.data));
  }

  updateVenta(id: number, venta: Partial<Venta>): Observable<Venta> {
    return this.http.put<{success: boolean; data: Venta}>(`${this.apiUrl}/${id}`, venta)
      .pipe(map((response: {success: boolean; data: Venta}) => response.data));
  }

  deleteVenta(id: number): Observable<void> {
    return this.http.delete<{success: boolean}>(`${this.apiUrl}/${id}`)
      .pipe(map(() => void 0));
  }

  generarFactura(id: number): void {
    // Abrir la factura directamente en una nueva ventana (sin autenticación)
    const facturaUrl = `${environment.apiUrl}/ventas/${id}/factura`;
    window.open(facturaUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  }
}