import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductosService, Producto } from '../../../core/services/productos.service';

@Component({
  selector: 'app-productos-list',
  templateUrl: './productos-list.component.html',
  styleUrls: ['./productos-list.component.scss']
})
export class ProductosListComponent implements OnInit {
  productos: Producto[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private productosService: ProductosService
  ) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(): void {
    this.loading = true;
    this.error = null;
    
    this.productosService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los productos';
        this.loading = false;
        // Fallback a datos de ejemplo
        this.productos = [
          {
            id: 1,
            codigo: 'PROD001',
            nombre: 'Producto de Ejemplo 1',
            descripcion: 'Descripción del producto 1',
            precio: 25.99,
            cantidad: 100,
            categoria: 'Electrónicos'
          },
          {
            id: 2,
            codigo: 'PROD002',
            nombre: 'Producto de Ejemplo 2',
            descripcion: 'Descripción del producto 2',
            precio: 45.50,
            cantidad: 50,
            categoria: 'Hogar'
          }
        ];
      }
    });
  }

  createProducto(): void {
    this.router.navigate(['/productos/nuevo']);
  }

  editProducto(id: number): void {
    this.router.navigate(['/productos/editar', id]);
  }

  deleteProducto(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
      this.productosService.deleteProducto(id).subscribe({
        next: () => {
          this.loadProductos();
        },
        error: (error) => {
          alert('Error al eliminar el producto');
        }
      });
    }
  }

  viewProducto(id: number): void {
    this.router.navigate(['/productos/ver', id]);
  }
}
