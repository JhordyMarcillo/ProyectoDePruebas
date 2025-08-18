// Interfaces que coinciden con el backend

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
  perfil: string; // admin, ventas, bodega, etc.
  permisos?: string[]; // Array de permisos como 'Inicio', 'Cliente', 'Ventas', etc.
  estado: 'activo' | 'inactivo';
  fecha_creacion?: Date;
}

export interface Cliente {
  id?: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono?: string;
  email?: string;
  fecha_nacimiento: string;
  genero: 'M' | 'F' | 'Otro';
  direccion?: string;
  ciudad?: string;
  estado: 'activo' | 'inactivo';
  created_at?: Date;
  updated_at?: Date;
}

export interface Proveedor {
  id?: number;
  nombre: string;
  ruc?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  contacto_nombre?: string;
  estado: 'activo' | 'inactivo';
  created_at?: Date;
  updated_at?: Date;
}

export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  categoria?: string;
  marca?: string;
  cantidad_stock: number;
  stock_minimo?: number;
  precio_compra: number;
  precio_venta: number;
  proveedor_id?: number;
  estado: 'activo' | 'inactivo';
  created_at?: Date;
  updated_at?: Date;
  proveedor?: Proveedor;
}

export interface Servicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion_minutos?: number;
  productos_incluidos?: ProductoIncluido[];
  estado: 'activo' | 'inactivo';
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductoIncluido {
  producto_id: number;
  cantidad: number;
}

export interface Venta {
  id?: number;
  numero_factura: string;
  cliente_id: number;
  vendedor_id: number;
  subtotal: number;
  iva: number;
  descuento?: number;
  total: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';
  observaciones?: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
  productos?: VentaProducto[];
  servicios?: VentaServicio[];
  created_at?: Date;
  updated_at?: Date;
  cliente?: Cliente;
  vendedor?: Usuario;
}

export interface VentaProducto {
  id?: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface VentaServicio {
  id?: number;
  venta_id: number;
  servicio_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  servicio?: Servicio;
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

export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  user: Usuario;
  token: string;
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

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface CreateVentaRequest {
  cliente_id: number;
  productos?: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
  servicios?: Array<{
    servicio_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';
  observaciones?: string;
  descuento?: number;
}
