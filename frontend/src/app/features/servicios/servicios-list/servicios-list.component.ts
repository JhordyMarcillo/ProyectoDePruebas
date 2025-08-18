import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ServiciosService, Servicio, ProductoServicio } from '../../../core/services/servicios.service';
import { ProductosService } from '../../../core/services/productos.service';

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './servicios-list.component.html',
  styleUrls: ['./servicios-list.component.scss']
})
export class ServiciosListComponent implements OnInit {
  servicios: Servicio[] = [];
  productos: any[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  pageSize = 50;
  total = 0;
  
  // Active tab management
  activeTab: 'list' | 'new' = 'list';
  editingServicio: Servicio | null = null;
  
  // Form data for new/edit servicio
  servicioForm = {
    nombre: '',
    descripcion: '',
    costo_servicio: 0,
    productos: [] as ProductoServicio[],
    estado: 'activo' as 'activo' | 'inactivo'
  };
  
  // Product selection
  selectedProductId: number | null = null;
  selectedProductQuantity: number = 1;
  totalCosto = 0;

  constructor(
    private serviciosService: ServiciosService,
    private productosService: ProductosService
  ) {}

  ngOnInit(): void {
    this.loadServicios();
    this.loadProductos();
  }

  // Tab management
  setActiveTab(tab: 'list' | 'new'): void {
    this.activeTab = tab;
    if (tab === 'list') {
      this.resetForm();
      this.editingServicio = null;
    }
  }

  // Load servicios with pagination
  loadServicios(): void {
    this.loading = true;
    this.error = null;
    
    console.log('Cargando servicios - página:', this.currentPage, 'límite:', this.pageSize);
    
    this.serviciosService.getServicios(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('Servicios cargados exitosamente:', response);
        this.servicios = response.servicios;
        this.total = response.total;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error detallado al cargar servicios:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
        
        // No mostrar mensaje automático, solo loggear
        this.error = null; // Quitamos el mensaje de error automático
        this.loading = false;
        this.servicios = [];
      }
    });
  }

  // Load productos for selection
  loadProductos(): void {
    console.log('Cargando productos activos...');
    this.productosService.getProductosActivos().subscribe({
      next: (productos: any) => {
        this.productos = Array.isArray(productos) ? productos : [];
        console.log('Productos cargados exitosamente:', this.productos.length, this.productos);
      },
      error: (error: any) => {
        console.error('Error al cargar productos activos:', error);
        console.log('Intentando fallback con todos los productos...');
        this.productos = [];
        
        // Fallback: try regular getProductos if activos fails
        this.productosService.getProductos().subscribe({
          next: (allProductos: any) => {
            console.log('Todos los productos obtenidos:', allProductos);
            if (Array.isArray(allProductos)) {
              this.productos = allProductos.filter((p: any) => p.estado === 'activo');
            } else if (allProductos && Array.isArray(allProductos.productos)) {
              this.productos = allProductos.productos.filter((p: any) => p.estado === 'activo');
            } else {
              this.productos = [];
            }
            console.log('Productos activos filtrados:', this.productos.length, this.productos);
          },
          error: (err: any) => {
            console.error('Error al cargar productos (fallback):', err);
            this.productos = [];
            // No mostrar mensajes de error automáticos, solo loggear
          }
        });
      }
    });
  }

  // Create new servicio
  createServicio(): void {
    if (!this.servicioForm.nombre.trim()) {
      alert('El nombre del servicio es requerido');
      return;
    }

    this.calculateTotal();
    
    const servicioData = {
      ...this.servicioForm,
      coste_total: this.totalCosto
    };

    this.serviciosService.createServicio(servicioData).subscribe({
      next: () => {
        this.loadServicios();
        this.setActiveTab('list');
        this.showMessage('success', 'Servicio creado exitosamente');
      },
      error: (error) => {
        console.error('Error al crear servicio:', error);
        this.showMessage('error', error.error?.message || 'Error al crear el servicio');
      }
    });
  }

  // Edit servicio
  editServicio(servicio: Servicio): void {
    this.editingServicio = servicio;
    this.servicioForm = {
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      costo_servicio: servicio.costo_servicio,
      productos: servicio.productos ? [...servicio.productos] : [],
      estado: servicio.estado
    };
    this.calculateTotal();
    this.setActiveTab('new');
  }

  // Update servicio
  updateServicio(): void {
    if (!this.editingServicio) return;

    this.calculateTotal();
    
    const servicioData = {
      ...this.servicioForm,
      coste_total: this.totalCosto
    };

    this.serviciosService.updateServicio(this.editingServicio.id!, servicioData).subscribe({
      next: () => {
        this.loadServicios();
        this.setActiveTab('list');
        this.showMessage('success', 'Servicio actualizado exitosamente');
      },
      error: (error) => {
        console.error('Error al actualizar servicio:', error);
        this.showMessage('error', error.error?.message || 'Error al actualizar el servicio');
      }
    });
  }

  // Toggle servicio estado (activate/deactivate)
  toggleEstado(servicio: Servicio): void {
    const newEstado = servicio.estado === 'activo' ? 'inactivo' : 'activo';
    const action = newEstado === 'activo' ? 'activar' : 'desactivar';
    
    if (confirm(`¿Está seguro de que desea ${action} este servicio?`)) {
      this.serviciosService.toggleEstado(servicio.id!, newEstado).subscribe({
        next: () => {
          this.loadServicios();
          this.showMessage('success', `Servicio ${newEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
        },
        error: (error) => {
          console.error('Error al cambiar estado del servicio:', error);
          this.showMessage('error', 'Error al cambiar el estado del servicio');
        }
      });
    }
  }

  // Delete servicio
  deleteServicio(servicio: Servicio): void {
    if (confirm('¿Está seguro de que desea eliminar este servicio? Esta acción no se puede deshacer.')) {
      this.serviciosService.deleteServicio(servicio.id!).subscribe({
        next: () => {
          this.loadServicios();
          this.showMessage('success', 'Servicio eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar servicio:', error);
          this.showMessage('error', 'Error al eliminar el servicio');
        }
      });
    }
  }

  // Product management
  addProduct(): void {
    // Convert selectedProductId to number if it's a string
    const productId = typeof this.selectedProductId === 'string' ? 
      parseInt(this.selectedProductId) : this.selectedProductId;

    if (!productId || productId <= 0 || this.selectedProductQuantity <= 0) {
      alert('Seleccione un producto y una cantidad válida');
      return;
    }

    const producto = this.productos.find(p => p.id === productId);
    if (!producto) {
      alert('Producto no encontrado');
      console.log('Producto ID buscado:', productId);
      console.log('Productos disponibles:', this.productos);
      return;
    }

    // Check if product already exists in the list
    const existingIndex = this.servicioForm.productos.findIndex(p => p.id === productId);
    
    if (existingIndex >= 0) {
      // Update quantity if product already exists
      this.servicioForm.productos[existingIndex].cantidad = this.selectedProductQuantity;
    } else {
      // Add new product
      this.servicioForm.productos.push({
        id: productId,
        nombre: producto.nombre_producto,
        cantidad: this.selectedProductQuantity,
        costo: producto.precio_producto,
        precio: producto.precio_producto
      });
    }

    this.calculateTotal();
    this.selectedProductId = null;
    this.selectedProductQuantity = 1;
  }

  removeProduct(index: number): void {
    this.servicioForm.productos.splice(index, 1);
    this.calculateTotal();
  }

  // Calculate total cost
  calculateTotal(): void {
    const productsCost = this.servicioForm.productos.reduce((total, producto) => {
      return total + (producto.costo * producto.cantidad);
    }, 0);
    
    this.totalCosto = this.servicioForm.costo_servicio + productsCost;
  }

  // Form management
  resetForm(): void {
    this.servicioForm = {
      nombre: '',
      descripcion: '',
      costo_servicio: 0,
      productos: [],
      estado: 'activo'
    };
    this.selectedProductId = null;
    this.selectedProductQuantity = 1;
    this.totalCosto = 0;
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadServicios();
    }
  }

  // Utility methods
  getProductName(id: number): string {
    const producto = this.productos.find(p => p.id === id);
    return producto ? producto.nombre_producto : 'Producto no encontrado';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-CO');
  }

  showMessage(type: 'success' | 'error', message: string): void {
    // Create a temporary message element (you can implement a proper notification service)
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messageElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      z-index: 9999;
      font-weight: bold;
      ${type === 'success' ? 'background-color: #4CAF50;' : 'background-color: #f44336;'}
    `;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 3000);
  }
}
