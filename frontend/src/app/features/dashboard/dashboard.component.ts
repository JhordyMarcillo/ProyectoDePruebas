import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface DashboardStats {
  total_clientes: number;
  total_productos: number;
  total_servicios: number;
  total_proveedores: number;
  total_ventas: number;
  total_usuarios: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    total_clientes: 0,
    total_productos: 0,
    total_servicios: 0,
    total_proveedores: 0,
    total_ventas: 0,
    total_usuarios: 0
  };
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.error = null;
    
    this.http.get<any>(`${environment.apiUrl}/dashboard/stats`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        } else {
          this.error = 'Error al cargar estadísticas';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.error = 'Error de conexión';
        this.loading = false;
        // Usar datos de respaldo
        this.stats = {
          total_clientes: 0,
          total_productos: 0,
          total_servicios: 0,
          total_proveedores: 0,
          total_ventas: 0,
          total_usuarios: 1
        };
      }
    });
  }
}
