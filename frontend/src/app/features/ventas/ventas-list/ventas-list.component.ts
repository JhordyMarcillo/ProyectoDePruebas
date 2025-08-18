import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VentasService, Venta } from '../../../core/services/ventas.service';
import { ClientesService, Cliente } from '../../../core/services/clientes.service';
import { ProductosService, Producto } from '../../../core/services/productos.service';
import { ServiciosService, Servicio } from '../../../core/services/servicios.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ventas-list.component.html',
  styleUrls: ['./ventas-list.component.scss']
})
export class VentasListComponent implements OnInit {
  ventas: Venta[] = [];
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  servicios: Servicio[] = [];
  loading = false;
  error: string | null = null;
  activeTab: 'list' | 'new' | 'edit' = 'list';
  isEditing = false;
  editingVentaId: number | null = null;
  
  message = '';
  messageType = '';

  nuevaVenta = {
    cedula_cliente: '',
    productos: [] as any[],
    servicios: [] as any[],
    iva: 15,
    total_pagar: 0,
    metodo: '',
    vendedor: '',
    estado: 'activo' as 'activo' | 'inactivo'
  };

  // Cliente seleccionado
  clienteSeleccionado: Cliente | null = null;
  buscarClienteInput = '';

  // Productos y servicios temporales para agregar
  productoSeleccionado = '';
  cantidadProducto = 1;
  servicioSeleccionado = '';
  cantidadServicio = 1;

  // Para efectivo
  montoEntregado = 0;
  cambio = 0;

  constructor(
    private router: Router,
    private ventasService: VentasService,
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private serviciosService: ServiciosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadVentas();
    this.loadClientes();
    this.loadProductos();
    this.loadServicios();
    this.loadUserInfo();
  }

  loadVentas() {
    console.log('=== INICIANDO CARGA DE VENTAS ===');
    this.loading = true;
    this.error = null;
    
    this.ventasService.getVentas().subscribe({
      next: (ventas: Venta[]) => {
        console.log('=== VENTAS RECIBIDAS ===');
        console.log('Número de ventas:', ventas.length);
        console.log('Datos de ventas:', ventas);
        this.ventas = ventas;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('=== ERROR AL CARGAR VENTAS ===');
        console.error('Error completo:', error);
        this.error = 'Error al cargar la lista de ventas';
        this.loading = false;
      }
    });
  }

  loadClientes() {
    this.clientesService.getClientes().subscribe({
      next: (clientes: Cliente[]) => {
        console.log('=== CLIENTES CARGADOS PARA VENTAS ===');
        console.log('Clientes recibidos:', clientes);
        this.clientes = Array.isArray(clientes) ? clientes : [];
        console.log('Total clientes cargados:', this.clientes.length);
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
        this.clientes = []; // Asegurar que sea un array vacío en caso de error
      }
    });
  }

  loadProductos() {
    this.productosService.getProductos().subscribe({
      next: (response: Producto[]) => {
        console.log('=== PRODUCTOS CARGADOS PARA VENTAS ===');
        console.log('Productos recibidos:', response);
        // Filtrar solo productos activos y con stock > 0
        this.productos = response.filter(p => p.estado === 'activo' && p.cantidad_producto > 0);
        console.log('Productos con stock disponible:', this.productos);
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  loadServicios() {
    this.serviciosService.getServicios().subscribe({
      next: (response) => {
        this.servicios = response.servicios;
      },
      error: (error: any) => {
        console.error('Error al cargar servicios:', error);
      }
    });
  }

  loadUserInfo() {
    // Obtener información del usuario logueado
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.nombre && currentUser.apellido) {
      this.nuevaVenta.vendedor = `${currentUser.nombre} ${currentUser.apellido}`;
    } else {
      this.nuevaVenta.vendedor = 'admin admin'; // Fallback por si no hay usuario
    }
  }

  setActiveTab(tab: 'list' | 'new' | 'edit') {
    console.log('=== CAMBIANDO PESTAÑA ===');
    console.log('Pestaña anterior:', this.activeTab);
    console.log('Nueva pestaña:', tab);
    
    this.activeTab = tab;
    if (tab === 'new') {
      this.resetForm();
      this.isEditing = false;
    }
    
    console.log('Pestaña activa después del cambio:', this.activeTab);
  }

  resetForm() {
    // Obtener información del usuario actual para el vendedor
    const currentUser = this.authService.currentUserValue;
    const vendedorInfo = currentUser && currentUser.nombre && currentUser.apellido 
      ? `${currentUser.nombre} ${currentUser.apellido}` 
      : 'admin admin';

    this.nuevaVenta = {
      cedula_cliente: '',
      productos: [],
      servicios: [],
      iva: 15,
      total_pagar: 0,
      metodo: '',
      vendedor: vendedorInfo,
      estado: 'activo'
    };
    this.clienteSeleccionado = null;
    this.buscarClienteInput = '';
    this.productoSeleccionado = '';
    this.cantidadProducto = 1;
    this.servicioSeleccionado = '';
    this.cantidadServicio = 1;
    this.montoEntregado = 0;
    this.cambio = 0;
    this.message = '';
    this.messageType = '';
  }

  onCedulaInput() {
    // Buscar automáticamente cuando la cédula tenga al menos 8 caracteres
    if (this.buscarClienteInput.length >= 8) {
      this.buscarClienteAutomatico();
    } else {
      this.clienteSeleccionado = null;
      this.nuevaVenta.cedula_cliente = '';
    }
  }

  buscarClienteAutomatico() {
    const cliente = this.clientes.find(c => c.cedula === this.buscarClienteInput.trim());
    if (cliente) {
      this.clienteSeleccionado = cliente;
      this.nuevaVenta.cedula_cliente = cliente.cedula;
      console.log('Cliente encontrado automáticamente:', this.clienteSeleccionado);
    } else {
      this.clienteSeleccionado = null;
      this.nuevaVenta.cedula_cliente = '';
    }
  }

  buscarCliente() {
    console.log('=== BUSCANDO CLIENTE ===');
    console.log('Cédula a buscar:', this.buscarClienteInput.trim());
    
    if (!this.buscarClienteInput.trim()) {
      this.showMessage('error', 'Ingrese una cédula para buscar');
      return;
    }

    const cliente = this.clientes.find(c => c.cedula === this.buscarClienteInput.trim());
    console.log('Cliente encontrado:', cliente);
    console.log('Lista completa de clientes:', this.clientes);
    
    if (cliente) {
      this.clienteSeleccionado = cliente;
      this.nuevaVenta.cedula_cliente = cliente.cedula;
      console.log('Cliente seleccionado:', this.clienteSeleccionado);
      this.showMessage('success', `Cliente encontrado: ${cliente.nombre} ${cliente.apellido}`);
    } else {
      this.showMessage('error', 'Cliente no encontrado con esa cédula');
      this.clienteSeleccionado = null;
      this.nuevaVenta.cedula_cliente = '';
    }
  }

  agregarProducto() {
    if (!this.productoSeleccionado || this.cantidadProducto <= 0) {
      this.showMessage('error', 'Seleccione un producto y cantidad válida');
      return;
    }

    const producto = this.productos.find(p => p.id?.toString() === this.productoSeleccionado);
    if (!producto) {
      this.showMessage('error', 'Producto no encontrado');
      return;
    }

    // Verificar stock
    if (producto.cantidad_producto < this.cantidadProducto) {
      this.showMessage('error', 'Stock insuficiente');
      return;
    }

    // Agregar al array de productos
    const productoVenta = {
      id: producto.id,
      nombre: producto.nombre_producto,
      cantidad: this.cantidadProducto,
      costo: producto.precio_producto
    };

    this.nuevaVenta.productos.push(productoVenta);
    this.calcularTotal();
    this.showMessage('success', 'Producto agregado');

    // Limpiar selección
    this.productoSeleccionado = '';
    this.cantidadProducto = 1;
  }

  agregarServicio() {
    if (!this.servicioSeleccionado || this.cantidadServicio <= 0) {
      this.showMessage('error', 'Seleccione un servicio y cantidad válida');
      return;
    }

    const servicio = this.servicios.find(s => s.id?.toString() === this.servicioSeleccionado);
    if (!servicio) {
      this.showMessage('error', 'Servicio no encontrado');
      return;
    }

    // Agregar al array de servicios
    const servicioVenta = {
      id: servicio.id,
      nombre: servicio.nombre,
      cantidad: this.cantidadServicio,
      costo: servicio.coste_total
    };

    this.nuevaVenta.servicios.push(servicioVenta);
    this.calcularTotal();
    this.showMessage('success', 'Servicio agregado');

    // Limpiar selección
    this.servicioSeleccionado = '';
    this.cantidadServicio = 1;
  }

  eliminarProducto(index: number) {
    this.nuevaVenta.productos.splice(index, 1);
    this.calcularTotal();
  }

  eliminarServicio(index: number) {
    this.nuevaVenta.servicios.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    let subtotal = 0;

    // Sumar productos
    this.nuevaVenta.productos.forEach(p => {
      subtotal += p.cantidad * p.costo;
    });

    // Sumar servicios
    this.nuevaVenta.servicios.forEach(s => {
      subtotal += s.cantidad * s.costo;
    });

    // Calcular IVA
    const ivaAmount = (subtotal * this.nuevaVenta.iva) / 100;
    this.nuevaVenta.total_pagar = subtotal + ivaAmount;
  }

  onMetodoChange() {
    if (this.nuevaVenta.metodo !== 'efectivo') {
      this.montoEntregado = 0;
      this.cambio = 0;
    }
  }

  onMontoEntregadoChange() {
    if (this.nuevaVenta.metodo === 'efectivo') {
      this.cambio = this.montoEntregado - this.nuevaVenta.total_pagar;
      if (this.cambio < 0) {
        this.showMessage('error', 'Efectivo insuficiente');
      }
    }
  }

  guardarVenta() {
    // Validaciones
    if (!this.clienteSeleccionado) {
      this.showMessage('error', 'Debe seleccionar un cliente');
      return;
    }

    if (this.nuevaVenta.productos.length === 0 && this.nuevaVenta.servicios.length === 0) {
      this.showMessage('error', 'Debe agregar al menos un producto o servicio');
      return;
    }

    if (!this.nuevaVenta.metodo) {
      this.showMessage('error', 'Debe seleccionar un método de pago');
      return;
    }

    if (this.nuevaVenta.metodo === 'efectivo' && this.cambio < 0) {
      this.showMessage('error', 'Efectivo insuficiente');
      return;
    }

    const ventaData = {
      cedula_cliente: this.nuevaVenta.cedula_cliente,
      productos: this.nuevaVenta.productos,
      servicios: this.nuevaVenta.servicios,
      iva: this.nuevaVenta.iva,
      total_pagar: this.nuevaVenta.total_pagar,
      metodo: this.nuevaVenta.metodo,
      vendedor: this.nuevaVenta.vendedor,
      estado: this.nuevaVenta.estado
    };

    console.log('Guardando venta:', ventaData);

    if (this.isEditing && this.editingVentaId) {
      // Actualizar venta existente
      this.ventasService.updateVenta(this.editingVentaId, ventaData).subscribe({
        next: (venta: Venta) => {
          console.log('Venta actualizada:', venta);
          this.showMessage('success', 'Venta actualizada exitosamente');
          this.loadVentas();
          this.setActiveTab('list');
        },
        error: (error: any) => {
          console.error('Error al actualizar venta:', error);
          this.showMessage('error', 'Error al actualizar la venta');
        }
      });
    } else {
      // Crear nueva venta
      this.ventasService.createVenta(ventaData).subscribe({
        next: (venta: Venta) => {
          console.log('Venta creada:', venta);
          this.showMessage('success', 'Venta registrada exitosamente');
          this.loadVentas();
          this.setActiveTab('list');
        },
        error: (error: any) => {
          console.error('Error al crear venta:', error);
          this.showMessage('error', 'Error al registrar la venta');
        }
      });
    }
  }

  editarVenta(venta: Venta) {
    this.isEditing = true;
    this.editingVentaId = venta.id!;

    // Cargar datos de la venta
    this.nuevaVenta = {
      cedula_cliente: venta.cedula_cliente,
      productos: Array.isArray(venta.productos) ? venta.productos : [],
      servicios: Array.isArray(venta.servicios) ? venta.servicios : [],
      iva: venta.iva,
      total_pagar: venta.total_pagar,
      metodo: venta.metodo,
      vendedor: venta.vendedor,
      estado: venta.estado
    };

    // Buscar cliente
    const cliente = this.clientes.find(c => c.cedula === venta.cedula_cliente);
    if (cliente) {
      this.clienteSeleccionado = cliente;
    }

    this.buscarClienteInput = venta.cedula_cliente;

    this.setActiveTab('edit');
  }

  eliminarVenta(venta: Venta) {
    if (confirm(`¿Está seguro de eliminar la venta #${venta.id}?`)) {
      this.ventasService.deleteVenta(venta.id!).subscribe({
        next: () => {
          this.showMessage('success', 'Venta eliminada exitosamente');
          this.loadVentas();
        },
        error: (error: any) => {
          console.error('Error al eliminar venta:', error);
          this.showMessage('error', 'Error al eliminar la venta');
        }
      });
    }
  }

  generarFactura(venta: Venta) {
    console.log('=== GENERANDO FACTURA ===');
    console.log('Venta seleccionada:', venta);
    
    try {
      // Usar el nuevo método simplificado que abre en nueva ventana
      this.ventasService.generarFactura(venta.id!);
      this.showMessage('success', 'Factura generada - se abrirá en una nueva ventana');
    } catch (error) {
      console.error('Error al generar factura:', error);
      this.showMessage('error', 'Error al generar la factura');
    }
  }

  getClienteNombre(cedula: string): string {
    if (!this.clientes || !Array.isArray(this.clientes)) {
      console.log('Clientes no está inicializado como array:', this.clientes);
      return cedula;
    }
    const cliente = this.clientes.find(c => c.cedula === cedula);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : cedula;
  }

  showMessage(type: 'success' | 'error', message: string) {
    this.messageType = type;
    this.message = message;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatMoney(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}
