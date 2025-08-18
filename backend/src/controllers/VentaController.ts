import { Request, Response } from 'express';
import { VentaModel } from '../models/Venta';
import { ClienteModel } from '../models/Cliente';
import { ProductoModel } from '../models/Producto';
import { ServicioModel } from '../models/Servicio';
import { UsuarioModel } from '../models/PerfilModel';
import { ApiResponse, Venta, CreateVentaRequest } from '../types';
import { executeQuery } from '../config/database';
import { RowDataPacket } from 'mysql2';

export class VentaController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const offset = (page - 1) * limit;

      const { ventas, total } = await VentaModel.findAll(limit, offset, search);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        message: 'Ventas obtenidas exitosamente',
        data: ventas,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      } as ApiResponse<Venta[]>);

    } catch (error) {
      console.error('Error al obtener ventas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de venta inválido'
        } as ApiResponse);
        return;
      }

      const venta = await VentaModel.findById(id);

      if (!venta) {
        res.status(404).json({
          success: false,
          message: 'Venta no encontrada'
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Venta obtenida exitosamente',
        data: venta
      } as ApiResponse<Venta>);

    } catch (error) {
      console.error('Error al obtener venta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const ventaData: CreateVentaRequest = req.body;
      const authUser = (req as any).user; // Usuario autenticado del token

      // Obtener información completa del usuario
      const userInfo = await UsuarioModel.findById(authUser.userId);
      if (!userInfo) {
        res.status(400).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse);
        return;
      }

      // Validaciones
      if (!ventaData.cedula_cliente) {
        res.status(400).json({
          success: false,
          message: 'La cédula del cliente es requerida'
        } as ApiResponse);
        return;
      }

      // Verificar que el cliente existe
      const cliente = await ClienteModel.findByCedula(ventaData.cedula_cliente);
      if (!cliente) {
        res.status(400).json({
          success: false,
          message: 'Cliente no encontrado'
        } as ApiResponse);
        return;
      }

      // Validar productos si los hay
      if (ventaData.productos && ventaData.productos.length > 0) {
        for (const producto of ventaData.productos) {
          const productoData = await ProductoModel.findById(parseInt(producto.id));
          if (!productoData) {
            res.status(400).json({
              success: false,
              message: `Producto con ID ${producto.id} no encontrado`
            } as ApiResponse);
            return;
          }

          if (productoData.cantidad_producto < producto.cantidad) {
            res.status(400).json({
              success: false,
              message: `Stock insuficiente para el producto ${productoData.nombre_producto}`
            } as ApiResponse);
            return;
          }
        }
      }

      // Validar servicios si los hay
      if (ventaData.servicios && ventaData.servicios.length > 0) {
        for (const servicio of ventaData.servicios) {
          const servicioData = await ServicioModel.findById(parseInt(servicio.id));
          if (!servicioData) {
            res.status(400).json({
              success: false,
              message: `Servicio con ID ${servicio.id} no encontrado`
            } as ApiResponse);
            return;
          }
        }
      }

      // Calcular total
      let subtotal = 0;

      // Sumar productos
      if (ventaData.productos) {
        for (const producto of ventaData.productos) {
          subtotal += producto.costo * producto.cantidad;
        }
      }

      // Sumar servicios
      if (ventaData.servicios) {
        for (const servicio of ventaData.servicios) {
          subtotal += servicio.costo * servicio.cantidad;
        }
      }

      const iva = ventaData.iva || 0;
      const total_pagar = subtotal + (subtotal * iva / 100);

      // Crear venta
      const ventaId = await VentaModel.create({
        cedula_cliente: ventaData.cedula_cliente,
        productos: ventaData.productos || [],
        servicios: ventaData.servicios || [],
        iva: iva,
        total_pagar: total_pagar,
        metodo: ventaData.metodo || 'efectivo',
        vendedor: `${userInfo.nombre} ${userInfo.apellido}`,
        estado: 'activo'
      });

      // Actualizar stock de productos
      if (ventaData.productos) {
        for (const producto of ventaData.productos) {
          const productoData = await ProductoModel.findById(parseInt(producto.id));
          if (productoData) {
            // Actualizar cantidad de producto (descontar del stock)
            const nuevaCantidad = productoData.cantidad_producto - producto.cantidad;
            await ProductoModel.update(parseInt(producto.id), { cantidad_producto: nuevaCantidad });
          }
        }
      }

      // Obtener la venta creada
      const nuevaVenta = await VentaModel.findById(ventaId);

      res.status(201).json({
        success: true,
        message: 'Venta creada exitosamente',
        data: nuevaVenta
      } as ApiResponse<Venta>);

    } catch (error) {
      console.error('Error al crear venta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const updates: Partial<Venta> = req.body;

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de venta inválido'
        } as ApiResponse);
        return;
      }

      // Verificar si la venta existe
      const existingVenta = await VentaModel.findById(id);
      if (!existingVenta) {
        res.status(404).json({
          success: false,
          message: 'Venta no encontrada'
        } as ApiResponse);
        return;
      }

      const updated = await VentaModel.update(id, updates);
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar la venta'
        } as ApiResponse);
        return;
      }

      const updatedVenta = await VentaModel.findById(id);

      res.json({
        success: true,
        message: 'Venta actualizada exitosamente',
        data: updatedVenta
      } as ApiResponse<Venta>);

    } catch (error) {
      console.error('Error al actualizar venta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de venta inválido'
        } as ApiResponse);
        return;
      }

      // Verificar si la venta existe
      const existingVenta = await VentaModel.findById(id);
      if (!existingVenta) {
        res.status(404).json({
          success: false,
          message: 'Venta no encontrada'
        } as ApiResponse);
        return;
      }

      const deleted = await VentaModel.delete(id);
      if (!deleted) {
        res.status(400).json({
          success: false,
          message: 'No se pudo eliminar la venta'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Venta eliminada exitosamente'
      } as ApiResponse);

    } catch (error) {
      console.error('Error al eliminar venta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getVentasByCliente(req: Request, res: Response): Promise<void> {
    try {
      const cedula = req.params.cedula;

      if (!cedula) {
        res.status(400).json({
          success: false,
          message: 'Cédula del cliente es requerida'
        } as ApiResponse);
        return;
      }

      const ventas = await VentaModel.findByCliente(cedula);

      res.json({
        success: true,
        message: 'Ventas del cliente obtenidas exitosamente',
        data: ventas
      } as ApiResponse<Venta[]>);

    } catch (error) {
      console.error('Error al obtener ventas del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const totalVentas = await VentaModel.getTotalVentas();
      const cantidadVentas = await VentaModel.getVentasCount();

      // Ventas de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const ventasHoy = await VentaModel.getVentasByDateRange(
        `${hoy} 00:00:00`,
        `${hoy} 23:59:59`
      );

      // Ventas del mes actual
      const fechaActual = new Date();
      const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
      const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
      
      const ventasMes = await VentaModel.getVentasByDateRange(
        primerDiaMes.toISOString().split('T')[0] + ' 00:00:00',
        ultimoDiaMes.toISOString().split('T')[0] + ' 23:59:59'
      );

      const stats = {
        total_ventas: totalVentas,
        cantidad_ventas: cantidadVentas,
        ventas_hoy: ventasHoy.length,
        ventas_mes: ventasMes.length,
        promedio_venta: cantidadVentas > 0 ? totalVentas / cantidadVentas : 0
      };

      res.json({
        success: true,
        message: 'Estadísticas de ventas obtenidas exitosamente',
        data: stats
      } as ApiResponse);

    } catch (error) {
      console.error('Error al obtener estadísticas de ventas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async generarFactura(req: Request, res: Response): Promise<void> {
    try {
      console.log('=== GENERAR FACTURA - INICIO ===');
      const id = parseInt(req.params.id!);
      console.log('ID de venta solicitada:', id);

      if (isNaN(id)) {
        console.log('ID inválido:', req.params.id);
        res.status(400).send('<h1>ID de venta inválido</h1>');
        return;
      }

      // Consulta directa a la base de datos (como en el PHP original)
      const ventaQuery = `SELECT * FROM ventas WHERE id = ?`;
      const ventaResult = await executeQuery<RowDataPacket[]>(ventaQuery, [id]);
      
      if (ventaResult.length === 0) {
        console.log('Venta no encontrada para ID:', id);
        res.status(404).send('<h1>Venta no encontrada</h1>');
        return;
      }

      const venta: any = ventaResult[0];
      console.log('Venta encontrada:', venta);

      // Obtener datos del cliente
      let cliente: any = null;
      let clienteInfo = {
        nombre: 'No disponible',
        apellido: '',
        numero: 'No disponible',
        email: 'No disponible',
        locacion: 'No disponible'
      };

      try {
        const clienteQuery = `SELECT * FROM clientes WHERE cedula = ?`;
        const clienteResult = await executeQuery<RowDataPacket[]>(clienteQuery, [venta.cedula_cliente]);
        if (clienteResult.length > 0) {
          cliente = clienteResult[0];
          clienteInfo = {
            nombre: cliente?.nombre || 'No disponible',
            apellido: cliente?.apellido || '',
            numero: cliente?.numero || 'No disponible',
            email: cliente?.email || 'No disponible',
            locacion: cliente?.locacion || 'No disponible'
          };
        }
      } catch (clienteError) {
        console.log('Error al buscar cliente, usando datos por defecto:', clienteError);
      }

      console.log('Datos del cliente:', clienteInfo);

      // Los productos y servicios ya vienen parseados desde la base de datos
      let productos: any[] = [];
      let servicios: any[] = [];
      
      try {
        // Si ya son objetos, usarlos directamente; si son strings, parsearlos
        if (Array.isArray(venta.productos)) {
          productos = venta.productos;
        } else if (typeof venta.productos === 'string') {
          productos = JSON.parse(venta.productos);
        } else {
          productos = [];
        }
      } catch (e) {
        console.log('Error parseando productos:', e);
        productos = [];
      }

      try {
        // Si ya son objetos, usarlos directamente; si son strings, parsearlos
        if (Array.isArray(venta.servicios)) {
          servicios = venta.servicios;
        } else if (typeof venta.servicios === 'string') {
          servicios = JSON.parse(venta.servicios);
        } else {
          servicios = [];
        }
      } catch (e) {
        console.log('Error parseando servicios:', e);
        servicios = [];
      }

      console.log('Productos:', productos);
      console.log('Servicios:', servicios);

      // Generar HTML de factura básica (exactamente como el PHP original)
      const facturaHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Factura</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                .container { width: 80%; margin: auto; border: 1px solid #000; padding: 20px; }
                .header { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
                .header-content { display: flex; align-items: center; }
                .header img { width: 100px; height: auto; margin-right: 20px; }
                .header h1, .header p { margin: 0; }
                .details, .items { width: 100%; margin-bottom: 20px; }
                .items table { width: 100%; border-collapse: collapse; }
                .items table, .items th, .items td { border: 1px solid #000; }
                .items th, .items td { padding: 10px; text-align: left; }
                .totals { float: right; }
                .totals table { border: 1px solid #000; border-collapse: collapse; }
                .totals th, .totals td { border: none; padding: 5px 10px; }
                .footer { text-align: center; margin-top: 20px; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <h1>Serenity Hair & Spa</h1>
                        <p>Sangolquí<br>0986247531<br>RUC: 0601780661001</p>
                    </div>
                </div>
                
                <div class="details">
                    <h3>Datos de la Factura</h3>
                    <p><strong>Id Factura:</strong> ${venta.id}</p>
                    <p><strong>Fecha de Venta:</strong> ${new Date(venta.fecha_creacion).toLocaleDateString('es-ES')}</p>
                    <p><strong>Cédula del Cliente:</strong> ${venta.cedula_cliente}</p>
                    <p><strong>Vendedor:</strong> ${venta.vendedor}</p>
                </div>

                <div class="details">
                    <h3>Datos del Cliente</h3>
                    <p><strong>Nombres y Apellidos:</strong> ${clienteInfo.nombre} ${clienteInfo.apellido}</p>
                    <p><strong>Teléfono:</strong> ${clienteInfo.numero}</p>
                    <p><strong>Email:</strong> ${clienteInfo.email}</p>
                    <p><strong>Ubicación:</strong> ${clienteInfo.locacion}</p>
                </div>
                
                <div class="items">
                    <h3>Productos</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productos.length > 0 ? productos.map((producto: any) => `
                                <tr>
                                    <td>${producto.nombre || 'Producto sin nombre'}</td>
                                    <td>${producto.cantidad || 0}</td>
                                    <td>${Number(producto.costo || 0).toFixed(2)}</td>
                                    <td>${((producto.cantidad || 0) * (producto.costo || 0)).toFixed(2)}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4">No hay productos en esta venta</td></tr>'}
                        </tbody>
                    </table>
                </div>
                
                <div class="items">
                    <h3>Servicios</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${servicios.length > 0 ? servicios.map((servicio: any) => `
                                <tr>
                                    <td>${servicio.nombre || 'Servicio sin nombre'}</td>
                                    <td>${servicio.cantidad || 0}</td>
                                    <td>${Number(servicio.costo || 0).toFixed(2)}</td>
                                    <td>${((servicio.cantidad || 0) * (servicio.costo || 0)).toFixed(2)}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4">No hay servicios en esta venta</td></tr>'}
                        </tbody>
                    </table>
                </div>
                
                <div class="totals">
                    <table>
                        <tr><th>Subtotal:</th><td>${((Number(venta.total_pagar) || 0) / (1 + (Number(venta.iva) || 0) / 100)).toFixed(2)}</td></tr>
                        <tr><th>IVA:</th><td>${(Number(venta.iva) || 0).toFixed(2)}%</td></tr>
                        <tr><th>Total a Pagar:</th><td>${(Number(venta.total_pagar) || 0).toFixed(2)}</td></tr>
                    </table>
                </div>
                
                <div class="footer">
                    <p>Gracias por su compra.</p>
                    <p>Las devoluciones se aceptan dentro de los primeros 15 días.</p>
                    <br>
                    <button class="no-print" onclick="window.print()">Imprimir Factura</button>
                    <button class="no-print" onclick="window.close()">Cerrar</button>
                </div>
            </div>
        </body>
        </html>
      `;

      // Configurar headers para HTML
      console.log('Enviando factura HTML...');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(facturaHTML);
      console.log('=== FACTURA GENERADA EXITOSAMENTE ===');

    } catch (error) {
      console.error('=== ERROR AL GENERAR FACTURA ===');
      console.error('Error completo:', error);
      res.status(500).send(`
        <h1>Error al generar la factura</h1>
        <p>Error: ${error}</p>
        <button onclick="window.close()">Cerrar</button>
      `);
    }
  }
}
