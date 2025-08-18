import { Component, OnInit } from '@angular/core';
import { UsuariosService, Usuario } from '../../../core/services/usuarios.service';

@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss']
})
export class UsuariosListComponent implements OnInit {
  activeTab: 'list' | 'new' | 'edit' = 'list';
  isEditing = false;
  loading = false;
  error = '';
  message = '';
  messageType: 'success' | 'error' | 'info' = 'info';

  usuarios: Usuario[] = [];
  nuevoUsuario: Partial<Usuario> = {};
  currentUsuario: Usuario | null = null;

  permisos = {
    Inicio: false,
    Asignar: false,
    Cliente: false,
    Ventas: false,
    Productos: false,
    Servicios: false,
    Proveedores: false,
    Reportes: false
  };

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  setActiveTab(tab: 'list' | 'new' | 'edit'): void {
    this.activeTab = tab;
    this.error = '';
    this.message = '';
    
    if (tab === 'new') {
      this.limpiarFormulario();
    }
  }

  cargarUsuarios(): void {
    this.loading = true;
    
    // Simulación de datos - reemplazar con servicio real
    setTimeout(() => {
      this.usuarios = [
        {
          id: 1,
          usuario: 'admin',
          nombre: 'Administrador',
          apellido: 'Sistema',
          email: 'admin@sistema.com',
          genero: 'M',
          fecha_nacimiento: '1980-01-01',
          cedula: '12345678',
          perfil: 'Administrador',
          estado: 'activo',
          permisos: 'Inicio,Asignar,Cliente,Ventas,Productos,Servicios,Proveedores,Reportes'
        },
        {
          id: 2,
          usuario: 'vendedor1',
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan@empresa.com',
          genero: 'M',
          fecha_nacimiento: '1990-05-15',
          cedula: '87654321',
          perfil: 'Vendedor',
          estado: 'activo',
          permisos: 'Inicio,Cliente,Ventas'
        },
        {
          id: 3,
          usuario: 'inventario1',
          nombre: 'María',
          apellido: 'García',
          email: 'maria@empresa.com',
          genero: 'F',
          fecha_nacimiento: '1985-09-22',
          cedula: '11223344',
          perfil: 'Inventario',
          estado: 'inactivo',
          permisos: 'Inicio,Productos,Proveedores'
        }
      ];
      this.loading = false;
    }, 1000);
  }

  editarUsuario(usuario: Usuario): void {
    this.currentUsuario = { ...usuario };
    this.nuevoUsuario = { ...usuario };
    this.isEditing = true;
    this.activeTab = 'edit';
    
    // Establecer permisos
    this.resetPermisos();
    if (usuario.permisos) {
      const permisosArray = usuario.permisos.split(',');
      permisosArray.forEach(permiso => {
        if (permiso in this.permisos) {
          this.permisos[permiso as keyof typeof this.permisos] = true;
        }
      });
    }
    
    this.showMessage('Usuario cargado para edición', 'info');
  }

  toggleEstadoUsuario(usuario: Usuario): void {
    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'activo' ? 'activado' : 'desactivado';
    
    if (confirm(`¿Está seguro de que desea ${accion === 'activado' ? 'activar' : 'desactivar'} al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
      usuario.estado = nuevoEstado;
      this.showMessage(`Usuario ${accion} exitosamente`, 'success');
    }
  }

  eliminarUsuario(usuario: Usuario): void {
    if (confirm(`¿Está seguro de que desea eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
      this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
      this.showMessage('Usuario eliminado exitosamente', 'success');
    }
  }

  guardarUsuario(): void {
    this.loading = true;
    
    // Preparar permisos seleccionados
    const permisosSeleccionados = Object.keys(this.permisos)
      .filter(key => this.permisos[key as keyof typeof this.permisos])
      .join(',');
    
    const usuarioData = {
      ...this.nuevoUsuario,
      permisos: permisosSeleccionados,
      estado: this.nuevoUsuario.estado || 'activo'
    };

    // Simulación de guardado
    setTimeout(() => {
      if (this.isEditing && this.currentUsuario) {
        // Actualizar usuario existente
        const index = this.usuarios.findIndex(u => u.id === this.currentUsuario!.id);
        if (index !== -1) {
          this.usuarios[index] = { ...usuarioData, id: this.currentUsuario.id } as Usuario;
          this.showMessage('Usuario actualizado exitosamente', 'success');
        }
      } else {
        // Crear nuevo usuario
        const nuevoId = Math.max(...this.usuarios.map(u => u.id || 0), 0) + 1;
        this.usuarios.push({ ...usuarioData, id: nuevoId } as Usuario);
        this.showMessage('Usuario creado exitosamente', 'success');
      }
      
      this.loading = false;
      this.limpiarFormulario();
      this.activeTab = 'list';
    }, 1000);
  }

  limpiarFormulario(): void {
    this.nuevoUsuario = {};
    this.currentUsuario = null;
    this.isEditing = false;
    this.resetPermisos();
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
    this.activeTab = 'list';
    this.showMessage('Edición cancelada', 'info');
  }

  private resetPermisos(): void {
    Object.keys(this.permisos).forEach(key => {
      this.permisos[key as keyof typeof this.permisos] = false;
    });
  }

  private showMessage(text: string, type: 'success' | 'error' | 'info'): void {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}
