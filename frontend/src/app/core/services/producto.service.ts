import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getProductos(page = 1, limit = 10, search = '', categoria = ''): Observable<any> {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (categoria) params.categoria = categoria;
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  createProducto(producto: any): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  updateProducto(id: number, producto: any): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categorias`);
  }

  updateStock(id: number, cantidad: number, operacion: 'add' | 'subtract' | 'set'): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/${id}/stock`, { cantidad, operacion });
  }
}
