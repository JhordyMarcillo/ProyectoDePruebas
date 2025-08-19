import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductosService, Producto } from '../../../core/services/productos.service';
import { ProveedoresService, Proveedor } from '../../../core/services/proveedores.service';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './productos-list.component.html',
  styleUrls: ['./productos-list.component.scss']
})
export class ProductosListComponent implements OnInit {
  productos: Producto[] = [];
  proveedores: Proveedor[] = [];
  loading = false;
  error: string | null = null;
  activeTab: 'list' | 'new' | 'edit' = 'list';
  isEditing = false;
  editingProductoId: number | null = null;
  
  message = '';
  messageType = '';

  nuevoProducto = {
    nombre_producto: '',
    proveedor_producto: '',
    precio_compra: 0,
    precio_producto: 0,
    cantidad_producto: 0,
    marca_producto: '',
    categoria_producto: '',
    estado: 'activo'
  };

  // Propiedades para el modal de stock
  showStockModal = false;
  stockProducto: Producto | null = null;
  stockCantidad = 0;

  constructor(
    private router: Router,
    private productosService: ProductosService,
    private proveedoresService: ProveedoresService
  ) {}

  ngOnInit(): void {
    this.loadProductos();
    this.loadProveedores();
  }

  loadProductos() {
    this.loading = true;
    this.error = null;
    
    this.productosService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar la lista de productos';
        this.loading = false;
      }
    });
  }

  loadProveedores() {
    this.proveedoresService.getProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores.filter(p => p.estado === 'activo');
      },
      error: (error) => {
      }
    });
  }

  setActiveTab(tab: 'list' | 'new' | 'edit') {
    
    this.activeTab = tab;
    if (tab === 'new') {
      this.resetForm();
      this.isEditing = false;
    }
  
  }

  resetForm() {
    this.nuevoProducto = {
      nombre_producto: '',
      proveedor_producto: '',
      precio_compra: 0,
      precio_producto: 0,
      cantidad_producto: 0,
      marca_producto: '',
      categoria_producto: '',
      estado: 'activo'
    };
    this.message = '';
    this.messageType = '';
  }

  guardarProducto() {
    // Validaciones
    if (!this.nuevoProducto.nombre_producto.trim()) {
      this.showMessage('error', 'El nombre del producto es requerido');
      return;
    }

    if (!this.nuevoProducto.proveedor_producto.trim()) {
      this.showMessage('error', 'Debe seleccionar un proveedor');
      return;
    }

    if (this.nuevoProducto.precio_compra <= 0) {
      this.showMessage('error', 'El precio de compra debe ser mayor a 0');
      return;
    }

    if (this.nuevoProducto.precio_producto <= 0) {
      this.showMessage('error', 'El precio de venta debe ser mayor a 0');
      return;
    }

    if (this.nuevoProducto.cantidad_producto < 0) {
      this.showMessage('error', 'La cantidad no puede ser negativa');
      return;
    }


    if (this.isEditing && this.editingProductoId) {
      // Actualizar producto existente
      this.productosService.updateProducto(this.editingProductoId, this.nuevoProducto).subscribe({
        next: (producto) => {
          this.showMessage('success', 'Producto actualizado exitosamente');
          this.loadProductos();
          this.setActiveTab('list');
        },
        error: (error) => {
          this.showMessage('error', 'Error al actualizar el producto');
        }
      });
    } else {
      // Crear nuevo producto
      this.productosService.createProducto(this.nuevoProducto).subscribe({
        next: (producto) => {
          this.showMessage('success', 'Producto registrado exitosamente');
          this.loadProductos();
          this.setActiveTab('list');
        },
        error: (error) => {
          this.showMessage('error', 'Error al registrar el producto');
        }
      });
    }
  }

  editarProducto(producto: Producto) {
    this.isEditing = true;
    this.editingProductoId = producto.id!;
    
    this.nuevoProducto = {
      nombre_producto: producto.nombre_producto,
      proveedor_producto: producto.proveedor_producto,
      precio_compra: producto.precio_compra,
      precio_producto: producto.precio_producto,
      cantidad_producto: producto.cantidad_producto,
      marca_producto: producto.marca_producto,
      categoria_producto: producto.categoria_producto,
      estado: producto.estado || 'activo'
    };

    this.setActiveTab('edit');
  }

  eliminarProducto(producto: Producto) {
    if (confirm(`¿Está seguro de eliminar el producto '${producto.nombre_producto}'?`)) {
      this.productosService.deleteProducto(producto.id!).subscribe({
        next: () => {
          this.showMessage('success', 'Producto eliminado exitosamente');
          this.loadProductos();
        },
        error: (error) => {
          this.showMessage('error', 'Error al eliminar el producto');
        }
      });
    }
  }

  activarDesactivarProducto(producto: Producto) {
    const nuevoEstado = producto.estado === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'activo' ? 'activar' : 'desactivar';
    
    if (confirm(`¿Está seguro de ${accion} el producto '${producto.nombre_producto}'?`)) {
      this.productosService.updateProducto(producto.id!, { estado: nuevoEstado }).subscribe({
        next: () => {
          this.showMessage('success', `Producto ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
          this.loadProductos();
        },
        error: (error) => {
          this.showMessage('error', `Error al ${accion} el producto`);
        }
      });
    }
  }

  mostrarModalStock(producto: Producto) {
    this.stockProducto = producto;
    this.stockCantidad = 0;
    this.showStockModal = true;
  }

  cerrarModalStock() {
    this.showStockModal = false;
    this.stockProducto = null;
    this.stockCantidad = 0;
  }

  addStock() {
    if (!this.stockProducto || this.stockCantidad <= 0) {
      this.showMessage('error', 'Debe ingresar una cantidad válida');
      return;
    }

    this.productosService.addStock(this.stockProducto.id!, this.stockCantidad).subscribe({
      next: () => {
        this.showMessage('success', `Se añadieron ${this.stockCantidad} unidades al producto`);
        this.loadProductos();
        this.cerrarModalStock();
      },
      error: (error) => {
        this.showMessage('error', 'Error al añadir stock');
      }
    });
  }

  showMessage(type: 'success' | 'error', message: string) {
    this.messageType = type;
    this.message = message;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  getProveedorNombre(proveedor: string): string {
    // Si ya es un nombre (no es un número), devuelve el nombre directamente
    if (isNaN(Number(proveedor))) {
      return proveedor;
    }
    
    // Si es un número, busca en la lista de proveedores
    const proveedorObj = this.proveedores.find(p => p.id === Number(proveedor));
    return proveedorObj ? proveedorObj.nombre_empresa : proveedor;
  }

  getStockStatus(cantidad: number): 'low' | 'medium' | 'high' {
    if (cantidad < 10) return 'low';
    if (cantidad < 50) return 'medium';
    return 'high';
  }
}
