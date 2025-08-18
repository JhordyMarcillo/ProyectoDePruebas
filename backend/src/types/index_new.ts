// Tipos globales para el sistema SPA basados en la estructura original

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  genero: 'M' | 'F';
  fecha_nacimiento: string;
  cedula: string;
  usuario: string;
  contraseña?: string;
  perfil: string;
  permisos?: string;
  estado: 'activo' | 'inactivo';
  fecha_creacion?: Date;
}

export interface Cliente {
  id?: number;
  nombre: string;
  apellido: string;
  cedula: string;
  numero: string;
  email?: string;
  fecha_nacimiento: string;
  genero: 'M' | 'F';
  locacion?: string;
  estado: 'activo' | 'inactivo';
  fecha_creacion?: Date;
}

export interface Proveedor {
  id?: number;
  nombre_empresa: string;
  email?: string;
  numero?: string;
  web?: string;
  estado: string;
  fecha_creacion?: Date;
}

export interface Producto {
  id?: number;
  nombre: string;
  cantidad: number;
  proveedor: string;
  precio: number;
  precio_compra: number;
  marca?: string;
  codigo?: string;
  estado: 'activo' | 'inactivo';
  fecha_creacion?: Date;
}

export interface Servicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  productos?: any[];
  coste_total: number;
  costo_servicio: number;
  estado: 'activo' | 'inactivo';
  fecha_creacion?: Date;
}

export interface Venta {
  id?: number;
  cedula_cliente: string;
  productos?: any[];
  servicios?: any[];
  iva: number;
  total_pagar: number;
  metodo: string;
  vendedor: string;
  estado: 'activo' | 'inactivo';
  fecha_creacion?: Date;
}

export interface Cambio {
  id?: number;
  id_cambiado: number;
  usuario_id: string;
  descripcion?: string;
  tipo_cambio: 'Agregar' | 'Actualizar' | 'Activo' | 'Inactivo';
  fecha?: Date;
  tabla_afectada: string;
}

export interface AuthPayload {
  userId: number;
  username: string;
  perfil: string;
  permisos: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
  filter?: Record<string, any>;
}

export interface Estadisticas {
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

export interface ReporteVentas {
  fecha: string;
  total_ventas: number;
  cantidad_transacciones: number;
  producto_mas_vendido?: string;
  vendedor_destacado?: string;
}

// Request types
export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface CreateVentaRequest {
  cedula_cliente: string;
  productos?: Array<{
    id: string;
    nombre: string;
    cantidad: number;
    costo: number;
  }>;
  servicios?: Array<{
    id: string;
    nombre: string;
    cantidad: number;
    costo: number;
    productos?: Array<{
      id: string;
      nombre: string;
      cantidad: number;
      costo: number;
    }>;
  }>;
  iva: number;
  total_pagar: number;
  metodo: string;
  vendedor: string;
}

export interface CreateClienteRequest {
  nombre: string;
  apellido: string;
  cedula: string;
  numero: string;
  email?: string;
  fecha_nacimiento: string;
  genero: 'M' | 'F';
  locacion?: string;
}

export interface CreateProductoRequest {
  nombre: string;
  cantidad: number;
  proveedor: string;
  precio: number;
  precio_compra: number;
  marca?: string;
  codigo?: string;
}

export interface CreateServicioRequest {
  nombre: string;
  descripcion?: string;
  productos?: any[];
  coste_total: number;
  costo_servicio: number;
}

export interface CreateProveedorRequest {
  nombre_empresa: string;
  email?: string;
  numero?: string;
  web?: string;
}

export interface CreateUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  genero: 'M' | 'F';
  fecha_nacimiento: string;
  cedula: string;
  usuario: string;
  contraseña: string;
  perfil: string;
  permisos?: string;
}

// Update request types
export interface UpdateClienteRequest extends Partial<CreateClienteRequest> {}
export interface UpdateProductoRequest extends Partial<CreateProductoRequest> {}
export interface UpdateServicioRequest extends Partial<CreateServicioRequest> {}
export interface UpdateProveedorRequest extends Partial<CreateProveedorRequest> {}
export interface UpdateUsuarioRequest extends Partial<CreateUsuarioRequest> {
  estado?: 'activo' | 'inactivo';
}
