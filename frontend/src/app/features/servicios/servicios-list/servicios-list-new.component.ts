import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiciosService, Servicio } from '../../../core/services/servicios.service';

@Component({
  selector: 'app-servicios-list',
  templateUrl: './servicios-list.component.html',
  styleUrls: ['./servicios-list.component.scss']
})
export class ServiciosListComponent implements OnInit {
  servicios: Servicio[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private serviciosService: ServiciosService
  ) {}

  ngOnInit(): void {
    this.loadServicios();
  }

  loadServicios(): void {
    this.loading = true;
    this.error = null;
    
    this.serviciosService.getServicios().subscribe({
      next: (servicios) => {
        this.servicios = servicios;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        this.error = 'Error al cargar los servicios';
        this.loading = false;
        // Fallback a datos de ejemplo
        this.servicios = [
          {
            id: 1,
            codigo: 'SERV001',
            nombre: 'Consultoría IT',
            descripcion: 'Servicio de consultoría en tecnología',
            precio: 150.00,
            categoria: 'Tecnología'
          },
          {
            id: 2,
            codigo: 'SERV002',
            nombre: 'Soporte Técnico',
            descripcion: 'Servicio de soporte técnico especializado',
            precio: 75.00,
            categoria: 'Soporte'
          }
        ];
      }
    });
  }

  createServicio(): void {
    this.router.navigate(['/servicios/nuevo']);
  }

  editServicio(id: number): void {
    this.router.navigate(['/servicios/editar', id]);
  }

  deleteServicio(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este servicio?')) {
      this.serviciosService.deleteServicio(id).subscribe({
        next: () => {
          this.loadServicios();
        },
        error: (error) => {
          console.error('Error al eliminar servicio:', error);
          alert('Error al eliminar el servicio');
        }
      });
    }
  }

  viewServicio(id: number): void {
    this.router.navigate(['/servicios/ver', id]);
  }
}
