import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClientesService, Cliente } from '../../../core/services/clientes.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.scss']
})
export class ClientesListComponent implements OnInit {
  clientes: Cliente[] = [];
  loading = false;
  error: string | null = null;
  activeTab: 'list' | 'new' | 'edit' = 'list';
  isEditing = false;
  editingClienteId: number | null = null;
  
  message = '';
  messageType = '';

  nuevoCliente = {
    nombre: '',
    apellido: '',
    cedula: '',
    numero: '',
    email: '',
    fecha_nacimiento: '',
    genero: '' as 'M' | 'F' | '',
    locacion: '',
    estado: 'activo' as 'activo' | 'inactivo'
  };

  constructor(
    private router: Router,
    private clientesService: ClientesService
  ) {}

  ngOnInit(): void {
    // Cargar clientes inmediatamente al inicializar, como en el original
    this.loadClientes();
  }

  loadClientes() {
    console.log('Cargando clientes...');
    this.loading = true;
    this.error = null;
    
    this.clientesService.getClientes().subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        // Verificar si la respuesta tiene el formato correcto del backend
        if (response && response.success && response.data) {
          this.clientes = response.data;
        } else if (Array.isArray(response)) {
          // Si viene como array directo
          this.clientes = response;
        } else {
          this.clientes = [];
        }
        this.loading = false;
        console.log('Clientes cargados:', this.clientes);
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.error = 'Error al cargar los clientes. Mostrando datos de ejemplo.';
        this.loading = false;
        // Fallback a datos de ejemplo si no hay conexión
        this.clientes = [
          {
            id: 1,
            nombre: 'Juan',
            apellido: 'Pérez',
            cedula: '12345678',
            numero: '555-0123',
            email: 'juan@email.com',
            fecha_nacimiento: '1990-01-15',
            genero: 'M',
            locacion: 'Ciudad A',
            estado: 'activo'
          },
          {
            id: 2,
            nombre: 'María',
            apellido: 'González',
            cedula: '87654321',
            numero: '555-0456',
            email: 'maria@email.com',
            fecha_nacimiento: '1985-05-20',
            genero: 'F',
            locacion: 'Ciudad B',
            estado: 'activo'
          }
        ];
      }
    });
  }

  setActiveTab(tab: 'list' | 'new' | 'edit') {
    this.activeTab = tab;
    if (tab === 'new') {
      this.isEditing = false;
      this.editingClienteId = null;
      this.limpiarFormulario();
    } else if (tab === 'list') {
      this.loadClientes();
      this.isEditing = false;
      this.editingClienteId = null;
    }
    this.clearMessages();
  }

  guardarCliente() {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    const clienteData: Cliente = {
      ...this.nuevoCliente,
      genero: this.nuevoCliente.genero as 'M' | 'F' | undefined
    };

    if (this.isEditing && this.editingClienteId) {
      this.clientesService.updateCliente(this.editingClienteId, clienteData).subscribe({
        next: (response) => {
          this.showMessage('success', 'Cliente actualizado correctamente');
          this.setActiveTab('list');
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al actualizar cliente:', error);
          this.showMessage('error', 'Error al actualizar el cliente');
          this.loading = false;
        }
      });
    } else {
      this.clientesService.createCliente(clienteData).subscribe({
        next: (response) => {
          this.showMessage('success', 'Cliente creado correctamente');
          this.limpiarFormulario();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al crear cliente:', error);
          this.showMessage('error', 'Error al crear el cliente');
          this.loading = false;
        }
      });
    }
  }

  editCliente(cliente: Cliente) {
    this.isEditing = true;
    this.editingClienteId = cliente.id!;
    this.nuevoCliente = {
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      cedula: cliente.cedula,
      numero: cliente.numero,
      email: cliente.email || '',
      fecha_nacimiento: cliente.fecha_nacimiento || '',
      genero: cliente.genero || '',
      locacion: cliente.locacion || '',
      estado: cliente.estado || 'activo'
    };
    this.setActiveTab('edit');
  }

  activateCliente(id: number) {
    // Simulamos la activación por ahora
    const cliente = this.clientes.find(c => c.id === id);
    if (cliente) {
      cliente.estado = 'activo';
      this.showMessage('success', 'Cliente activado correctamente');
    }
  }

  deactivateCliente(id: number) {
    if (confirm('¿Está seguro de que desea desactivar este cliente?')) {
      const cliente = this.clientes.find(c => c.id === id);
      if (cliente) {
        cliente.estado = 'inactivo';
        this.showMessage('success', 'Cliente desactivado correctamente');
      }
    }
  }

  limpiarFormulario() {
    this.nuevoCliente = {
      nombre: '',
      apellido: '',
      cedula: '',
      numero: '',
      email: '',
      fecha_nacimiento: '',
      genero: '' as 'M' | 'F' | '',
      locacion: '',
      estado: 'activo' as 'activo' | 'inactivo'
    };
    this.clearMessages();
  }

  cancelarEdicion() {
    this.isEditing = false;
    this.editingClienteId = null;
    this.limpiarFormulario();
    this.setActiveTab('list');
  }

  validarFormulario(): boolean {
    if (!this.nuevoCliente.nombre.trim()) {
      this.showMessage('error', 'El nombre es requerido');
      return false;
    }
    if (!this.nuevoCliente.apellido.trim()) {
      this.showMessage('error', 'El apellido es requerido');
      return false;
    }
    if (!this.nuevoCliente.cedula.trim()) {
      this.showMessage('error', 'La cédula es requerida');
      return false;
    }
    if (!this.nuevoCliente.numero.trim()) {
      this.showMessage('error', 'El número de teléfono es requerido');
      return false;
    }
    if (!this.nuevoCliente.genero) {
      this.showMessage('error', 'El género es requerido');
      return false;
    }
    if (!this.nuevoCliente.fecha_nacimiento) {
      this.showMessage('error', 'La fecha de nacimiento es requerida');
      return false;
    }
    return true;
  }

  showMessage(type: 'success' | 'error', message: string) {
    this.message = message;
    this.messageType = type;

    setTimeout(() => {
      this.clearMessages();
    }, 3000);
  }

  clearMessages() {
    this.message = '';
    this.messageType = '';
  }
}
