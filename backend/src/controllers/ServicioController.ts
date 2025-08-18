import { Request, Response } from 'express';
import { ServicioModel } from '../models/Servicio';
import { ProductoModel } from '../models/Producto';
import { ApiResponse, Servicio } from '../types';

export class ServicioController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const offset = (page - 1) * limit;

      const { servicios, total } = await ServicioModel.findAll(limit, offset, search);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        message: 'Servicios obtenidos exitosamente',
        data: servicios,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      } as ApiResponse<Servicio[]>);

    } catch (error) {
      console.error('Error al obtener servicios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getActivos(req: Request, res: Response): Promise<void> {
    try {
      const servicios = await ServicioModel.findActivos();

      res.json({
        success: true,
        message: 'Servicios activos obtenidos exitosamente',
        data: servicios
      } as ApiResponse<Servicio[]>);

    } catch (error) {
      console.error('Error al obtener servicios activos:', error);
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
          message: 'ID de servicio inválido'
        } as ApiResponse);
        return;
      }

      const servicio = await ServicioModel.findById(id);
      
      if (!servicio) {
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Servicio obtenido exitosamente',
        data: servicio
      } as ApiResponse<Servicio>);

    } catch (error) {
      console.error('Error al obtener servicio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const servicioData: Omit<Servicio, 'id' | 'fecha_creacion'> = req.body;

      // For now, skip stock validation - we'll add it later
      // TODO: Add stock validation when getStock method is properly recognized

      const servicioId = await ServicioModel.create(servicioData);
      const newServicio = await ServicioModel.findById(servicioId);

      res.status(201).json({
        success: true,
        message: 'Servicio creado exitosamente',
        data: newServicio
      } as ApiResponse<Servicio>);

    } catch (error) {
      console.error('Error al crear servicio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const updates: Partial<Servicio> = req.body;

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de servicio inválido'
        } as ApiResponse);
        return;
      }

      const existingServicio = await ServicioModel.findById(id);
      if (!existingServicio) {
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        } as ApiResponse);
        return;
      }

      // For now, skip stock validation - we'll add it later
      // TODO: Add stock validation when getStock method is properly recognized

      const updated = await ServicioModel.update(id, updates);
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar el servicio'
        } as ApiResponse);
        return;
      }

      const updatedServicio = await ServicioModel.findById(id);

      res.json({
        success: true,
        message: 'Servicio actualizado exitosamente',
        data: updatedServicio
      } as ApiResponse<Servicio>);

    } catch (error) {
      console.error('Error al actualizar servicio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async toggleEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const { estado } = req.body;

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de servicio inválido'
        } as ApiResponse);
        return;
      }

      if (!estado || !['activo', 'inactivo'].includes(estado)) {
        res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser "activo" o "inactivo"'
        } as ApiResponse);
        return;
      }

      const servicio = await ServicioModel.findById(id);
      if (!servicio) {
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        } as ApiResponse);
        return;
      }

      const updated = await ServicioModel.update(id, { estado });
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar el estado del servicio'
        } as ApiResponse);
        return;
      }

      const updatedServicio = await ServicioModel.findById(id);

      res.json({
        success: true,
        message: `Servicio ${estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
        data: updatedServicio
      } as ApiResponse<Servicio>);

    } catch (error) {
      console.error('Error al cambiar estado del servicio:', error);
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
          message: 'ID de servicio inválido'
        } as ApiResponse);
        return;
      }

      const servicio = await ServicioModel.findById(id);
      if (!servicio) {
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        } as ApiResponse);
        return;
      }

      const deleted = await ServicioModel.delete(id);
      if (!deleted) {
        res.status(400).json({
          success: false,
          message: 'No se pudo eliminar el servicio'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Servicio eliminado exitosamente'
      } as ApiResponse);

    } catch (error) {
      console.error('Error al eliminar servicio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }
}
