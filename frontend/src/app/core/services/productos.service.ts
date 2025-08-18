import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Producto {
  id?: number;
  nombre_producto: string;
  proveedor_producto: string;
  precio_compra: number;
  precio_producto: number;
  cantidad_producto: number;
  marca_producto: string;
  categoria_producto: string;
  estado?: string;
  fecha_registro?: string;
  proveedor_nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}?limit=1000`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Si viene con paginación, extraer los productos
            return response.data.productos || response.data;
          }
          return [];
        })
      );
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<{success: boolean, data: Producto}>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<{success: boolean, data: Producto}>(`${this.apiUrl}`, producto)
      .pipe(
        map(response => response.data)
      );
  }

  updateProducto(id: number, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<{success: boolean, data: Producto}>(`${this.apiUrl}/${id}`, producto)
      .pipe(
        map(response => response.data)
      );
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<{success: boolean}>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => void 0)
      );
  }

  updateStock(id: number, cantidad: number): Observable<Producto> {
    return this.http.patch<{success: boolean, data: Producto}>(`${this.apiUrl}/${id}/stock`, { cantidad })
      .pipe(
        map(response => response.data)
      );
  }

  addStock(id: number, cantidad: number): Observable<Producto> {
    return this.http.put<{success: boolean, data: Producto}>(`${this.apiUrl}/${id}/add-stock`, { cantidad })
      .pipe(
        map(response => response.data)
      );
  }

  getProductosActivos(): Observable<Producto[]> {
    return this.http.get<{success: boolean, data: Producto[]}>(`${this.apiUrl}/activos`)
      .pipe(
        map(response => response.data || [])
      );
  }
}
