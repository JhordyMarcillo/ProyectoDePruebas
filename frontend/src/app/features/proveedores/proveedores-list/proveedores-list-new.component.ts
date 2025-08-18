import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProveedoresService, Proveedor } from '../../../core/services/proveedores.service';

@Component({
  selector: 'app-proveedores-list',
  templateUrl: './proveedores-list.component.html',
  styleUrls: ['./proveedores-list.component.scss']
})
export class ProveedoresListComponent implements OnInit {
  proveedores: Proveedor[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private proveedoresService: ProveedoresService
  ) {}

  ngOnInit(): void {
    this.loadProveedores();
  }

  loadProveedores(): void {
    this.loading = true;
    this.error = null;
    
    this.proveedoresService.getProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.error = 'Error al cargar los proveedores';
        this.loading = false;
        // Fallback a datos de ejemplo
        this.proveedores = [
          {
            id: 1,
            nombre: 'Tech Solutions S.A.',
            ruc: '20123456789',
            telefono: '555-0100',
            email: 'contacto@techsolutions.com',
            direccion: 'Av. Tecnología 123',
            contacto: 'Juan Pérez'
          },
          {
            id: 2,
            nombre: 'Distribuidora Global',
            ruc: '20987654321',
            telefono: '555-0200',
            email: 'ventas@distribuidoraglobal.com',
            direccion: 'Jr. Comercio 456',
            contacto: 'María García'
          }
        ];
      }
    });
  }

  createProveedor(): void {
    this.router.navigate(['/proveedores/nuevo']);
  }

  editProveedor(id: number): void {
    this.router.navigate(['/proveedores/editar', id]);
  }

  deleteProveedor(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este proveedor?')) {
      this.proveedoresService.deleteProveedor(id).subscribe({
        next: () => {
          this.loadProveedores();
        },
        error: (error) => {
          console.error('Error al eliminar proveedor:', error);
          alert('Error al eliminar el proveedor');
        }
      });
    }
  }

  viewProveedor(id: number): void {
    this.router.navigate(['/proveedores/ver', id]);
  }
}
