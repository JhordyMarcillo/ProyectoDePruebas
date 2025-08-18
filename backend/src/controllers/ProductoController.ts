import { Request, Response } from 'express';
import { ProductoModel } from '../models/Producto';
import { CambioModel } from '../models/Cambio';
import { ApiResponse } from '../types';
import { validationResult } from 'express-validator';

export class ProductoController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const offset = (page - 1) * limit;

      const result = await ProductoModel.findAll(limit, offset, search);
      
      res.json({
        success: true,
        message: 'Productos obtenidos exitosamente',
        data: {
          productos: result.productos,
          pagination: {
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit)
          }
        }
      } as ApiResponse);

    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(idParam || '0');
      
      if (isNaN(id) || !idParam) {
        res.status(400).json({
          success: false,
          message: 'ID de producto inválido'
        } as ApiResponse);
        return;
      }

      const producto = await ProductoModel.findById(id);
      
      if (!producto) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Producto obtenido exitosamente',
        data: producto
      } as ApiResponse);

    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        } as ApiResponse);
        return;
      }

      const productoData = req.body;
      
      // Verificar si ya existe un producto con el mismo nombre
      const existingProduct = await ProductoModel.findByName(productoData.nombre_producto);
      if (existingProduct) {
        res.status(400).json({
          success: false,
          message: 'Ya existe un producto con ese nombre'
        } as ApiResponse);
        return;
      }

      const productoId = await ProductoModel.create(productoData);
      const newProducto = await ProductoModel.findById(productoId);

      // Registrar cambio en auditoría
      const userInfo = req.user!;
      await CambioModel.registrarCambio(
        userInfo.username,
        `Producto agregado: ${productoData.nombre_producto} (Código: ${productoData.categoria_producto})`,
        'Agregar',
        'productos',
        productoId
      );

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: newProducto
      } as ApiResponse);

    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        } as ApiResponse);
        return;
      }

      const idParam = req.params.id;
      const id = parseInt(idParam || '0');
      
      if (isNaN(id) || !idParam) {
        res.status(400).json({
          success: false,
          message: 'ID de producto inválido'
        } as ApiResponse);
        return;
      }

      const updateData = req.body;
      
      // Verificar si el producto existe
      const existingProduct = await ProductoModel.findById(id);
      if (!existingProduct) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        } as ApiResponse);
        return;
      }

      // Si se está cambiando el nombre, verificar que no exista otro producto con ese nombre
      if (updateData.nombre_producto && updateData.nombre_producto !== existingProduct.nombre_producto) {
        const nameExists = await ProductoModel.findByName(updateData.nombre_producto);
        if (nameExists) {
          res.status(400).json({
            success: false,
            message: 'Ya existe un producto con ese nombre'
          } as ApiResponse);
          return;
        }
      }

      const updatedProducto = await ProductoModel.update(id, updateData);
      
      if (!updatedProducto) {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar el producto'
        } as ApiResponse);
        return;
      }

      // Registrar cambio en auditoría
      const userInfo = req.user!;
      const changes = Object.keys(updateData).map(key => `${key}: ${updateData[key]}`).join(', ');
      await CambioModel.registrarCambio(
        userInfo.username,
        `Producto modificado: ${existingProduct.nombre_producto} (${changes})`,
        'Actualizar',
        'productos',
        id
      );

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: updatedProducto
      } as ApiResponse);

    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(idParam || '0');
      
      if (isNaN(id) || !idParam) {
        res.status(400).json({
          success: false,
          message: 'ID de producto inválido'
        } as ApiResponse);
        return;
      }

      // Obtener información del producto antes de eliminarlo
      const producto = await ProductoModel.findById(id);
      if (!producto) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        } as ApiResponse);
        return;
      }

      const success = await ProductoModel.delete(id);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'No se pudo eliminar el producto'
        } as ApiResponse);
        return;
      }

      // Registrar cambio en auditoría
      const userInfo = req.user!;
      await CambioModel.registrarCambio(
        userInfo.username,
        `Producto eliminado: ${producto.nombre_producto} (Código: ${producto.categoria_producto})`,
        'Inactivo',
        'productos',
        id
      );

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      } as ApiResponse);

    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(idParam || '0');
      
      if (isNaN(id) || !idParam) {
        res.status(400).json({
          success: false,
          message: 'ID de producto inválido'
        } as ApiResponse);
        return;
      }

      const producto = await ProductoModel.findById(id);
      if (!producto) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        } as ApiResponse);
        return;
      }

      const newStatus = producto.estado === 'activo' ? 'inactivo' : 'activo';
      const updatedProducto = await ProductoModel.update(id, { estado: newStatus });

      res.json({
        success: true,
        message: `Producto ${newStatus === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
        data: updatedProducto
      } as ApiResponse);

    } catch (error) {
      console.error('Error al cambiar estado del producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async checkStock(req: Request, res: Response): Promise<void> {
    try {
      const productosIds = req.body.productos; // Array de {id, cantidad}
      
      if (!Array.isArray(productosIds)) {
        res.status(400).json({
          success: false,
          message: 'Se requiere un array de productos'
        } as ApiResponse);
        return;
      }

      const stockResults = [];
      
      for (const item of productosIds) {
        const producto = await ProductoModel.findById(item.id);
        if (producto) {
          stockResults.push({
            id: producto.id,
            nombre: producto.nombre_producto,
            cantidadSolicitada: item.cantidad,
            cantidadDisponible: producto.cantidad_producto,
            suficiente: producto.cantidad_producto >= item.cantidad
          });
        }
      }

      res.json({
        success: true,
        message: 'Verificación de stock completada',
        data: stockResults
      } as ApiResponse);

    } catch (error) {
      console.error('Error al verificar stock:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async updateQuantity(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(idParam || '0');
      const { cantidad } = req.body;
      
      if (isNaN(id) || !idParam || cantidad === undefined) {
        res.status(400).json({
          success: false,
          message: 'ID de producto o cantidad inválidos'
        } as ApiResponse);
        return;
      }

      const producto = await ProductoModel.findById(id);
      if (!producto) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        } as ApiResponse);
        return;
      }

      const updatedProducto = await ProductoModel.update(id, { cantidad_producto: cantidad });

      res.json({
        success: true,
        message: 'Cantidad actualizada exitosamente',
        data: updatedProducto
      } as ApiResponse);

    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async addStock(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(idParam || '0');
      const { cantidad } = req.body;
      
      if (isNaN(id) || !idParam || cantidad === undefined || cantidad <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de producto o cantidad inválidos'
        } as ApiResponse);
        return;
      }

      const producto = await ProductoModel.findById(id);
      if (!producto) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        } as ApiResponse);
        return;
      }

      const nuevaCantidad = producto.cantidad_producto + cantidad;
      const updated = await ProductoModel.update(id, { cantidad_producto: nuevaCantidad });

      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo añadir stock al producto'
        } as ApiResponse);
        return;
      }

      // Registrar cambio en auditoría
      const userInfo = req.user!;
      await CambioModel.registrarCambio(
        userInfo.username,
        `Stock añadido al producto: ${producto.nombre_producto} (+${cantidad} unidades, total: ${nuevaCantidad})`,
        'Actualizar',
        'productos',
        id
      );

      const updatedProducto = await ProductoModel.findById(id);

      res.json({
        success: true,
        message: 'Stock añadido exitosamente',
        data: updatedProducto
      } as ApiResponse);

    } catch (error) {
      console.error('Error al añadir stock:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getActivos(req: Request, res: Response): Promise<void> {
    try {
      // Temporary workaround using findAll with search filter
      const result = await ProductoModel.findAll(1000, 0, '');
      const productosActivos = result.productos.filter(p => p.estado === 'activo');

      res.json({
        success: true,
        message: 'Productos activos obtenidos exitosamente',
        data: productosActivos
      } as ApiResponse);

    } catch (error) {
      console.error('Error al obtener productos activos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }
}
