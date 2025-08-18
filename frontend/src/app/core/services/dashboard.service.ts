import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface DashboardStats {
  total_clientes: number;
  total_productos: number;
  total_servicios: number;
  total_proveedores: number;
  total_ventas: number;
  total_usuarios: number;
  ventas_hoy: number;
  ventas_mes: number;
  productos_bajo_stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.apiUrl}/stats`);
  }

  getVentasChart(periodo = 'mes'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ventas-chart?periodo=${periodo}`);
  }

  getProductosChart(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/productos-chart`);
  }

  getReporteRapido(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reporte-rapido`);
  }
}
