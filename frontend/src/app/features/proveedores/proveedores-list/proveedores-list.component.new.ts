import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProveedoresService, Proveedor } from '../../../core/services/proveedores.service';

@Component({
  selector: 'app-proveedores-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './proveedores-list.component.html',
  styleUrls: ['./proveedores-list.component.scss']
})
export class ProveedoresListComponent implements OnInit {
  proveedores: Proveedor[] = [];
  loading = false;
  error: string | null = null;
  activeTab: 'list' | 'new' | 'edit' = 'list';
  isEditing = false;
  editingProveedorId: number | null = null;
  
  message = '';
  messageType = '';

  nuevoProveedor = {
    nombre_empresa: '',
    email: '',
    numero: '',
    web: '',
    estado: 'activo'
  };

  constructor(
    private router: Router,
    private proveedoresService: ProveedoresService
  ) {}

  ngOnInit(): void {
    this.loadProveedores();
  }

  loadProveedores() {
    this.loading = true;
    this.error = null;
    
    this.proveedoresService.getProveedores().subscribe({
      next: (proveedores) => {

        this.proveedores = proveedores;
        this.loading = false;
      },
      error: (error) => {

        this.error = 'Error al cargar la lista de proveedores';
        this.loading = false;
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
    this.nuevoProveedor = {
      nombre_empresa: '',
      email: '',
      numero: '',
      web: '',
      estado: 'activo'
    };
    this.message = '';
    this.messageType = '';
  }

  guardarProveedor() {
    // Validaciones
    if (!this.nuevoProveedor.nombre_empresa.trim()) {
      this.showMessage('error', 'El nombre de la empresa es requerido');
      return;
    }

    // Validar email si se proporciona
    if (this.nuevoProveedor.email && !this.isValidEmail(this.nuevoProveedor.email)) {
      this.showMessage('error', 'El formato del email no es válido');
      return;
    }


    if (this.isEditing && this.editingProveedorId) {
      // Actualizar proveedor existente
      this.proveedoresService.updateProveedor(this.editingProveedorId, this.nuevoProveedor).subscribe({
        next: (proveedor) => {
          this.showMessage('success', 'Proveedor actualizado exitosamente');
          this.loadProveedores();
          this.setActiveTab('list');
        },
        error: (error) => {
          console.error('Error al actualizar proveedor:', error);
          this.showMessage('error', 'Error al actualizar el proveedor');
        }
      });
    } else {
      // Crear nuevo proveedor
      this.proveedoresService.createProveedor(this.nuevoProveedor).subscribe({
        next: (proveedor) => {
          this.showMessage('success', 'Proveedor registrado exitosamente');
          this.loadProveedores();
          this.setActiveTab('list');
        },
        error: (error) => {
          console.error('Error al crear proveedor:', error);
          this.showMessage('error', 'Error al registrar el proveedor');
        }
      });
    }
  }

  editarProveedor(proveedor: Proveedor) {
    this.isEditing = true;
    this.editingProveedorId = proveedor.id!;
    
    this.nuevoProveedor = {
      nombre_empresa: proveedor.nombre_empresa,
      email: proveedor.email || '',
      numero: proveedor.numero || '',
      web: proveedor.web || '',
      estado: proveedor.estado
    };

    this.setActiveTab('edit');
  }

  eliminarProveedor(proveedor: Proveedor) {
    if (confirm(`¿Está seguro de eliminar el proveedor '${proveedor.nombre_empresa}'?`)) {
      this.proveedoresService.deleteProveedor(proveedor.id!).subscribe({
        next: () => {
          this.showMessage('success', 'Proveedor eliminado exitosamente');
          this.loadProveedores();
        },
        error: (error) => {
          console.error('Error al eliminar proveedor:', error);
          this.showMessage('error', 'Error al eliminar el proveedor');
        }
      });
    }
  }

  activarDesactivarProveedor(proveedor: Proveedor) {
    const nuevoEstado = proveedor.estado === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'activo' ? 'activar' : 'desactivar';
    
    if (confirm(`¿Está seguro de ${accion} el proveedor '${proveedor.nombre_empresa}'?`)) {
      this.proveedoresService.updateProveedor(proveedor.id!, { estado: nuevoEstado }).subscribe({
        next: () => {
          this.showMessage('success', `Proveedor ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
          this.loadProveedores();
        },
        error: (error) => {
          console.error(`Error al ${accion} proveedor:`, error);
          this.showMessage('error', `Error al ${accion} el proveedor`);
        }
      });
    }
  }

  showMessage(type: 'success' | 'error', message: string) {
    this.messageType = type;
    this.message = message;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
