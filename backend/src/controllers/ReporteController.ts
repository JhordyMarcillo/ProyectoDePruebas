import { Request, Response } from 'express';
import { CambioModel } from '../models/Cambio';
import { ApiResponse } from '../types';

export class ReporteController {
  static async getAllCambios(req: Request, res: Response): Promise<void> {
    try {
      // Si no se especifica paginación, devolver todos los registros como el original PHP
      if (!req.query.page && !req.query.limit) {
        const cambios = await CambioModel.findAllWithoutPagination();
        
        res.json({
          success: true,
          message: 'Cambios obtenidos exitosamente',
          data: cambios,
          pagination: {
            page: 1,
            limit: cambios.length,
            total: cambios.length,
            totalPages: 1
          }
        } as ApiResponse);
        return;
      }

      // Con paginación
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 1000;
      const search = req.query.search as string;
      const offset = (page - 1) * limit;

      const { cambios, total } = await CambioModel.findAll(limit, offset, search);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        message: 'Cambios obtenidos exitosamente',
        data: cambios,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      } as ApiResponse);

    } catch (error) {
      //('Error al obtener cambios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getCambiosPorFecha(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          message: 'Se requieren fechaInicio y fechaFin'
        } as ApiResponse);
        return;
      }

      const cambios = await CambioModel.findByDateRange(
        fechaInicio as string,
        fechaFin as string
      );

      res.json({
        success: true,
        message: 'Cambios por fecha obtenidos exitosamente',
        data: cambios
      } as ApiResponse);

    } catch (error) {
      //('Error al obtener cambios por fecha:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getCambiosPorTabla(req: Request, res: Response): Promise<void> {
    try {
      const { tabla } = req.params;

      if (!tabla) {
        res.status(400).json({
          success: false,
          message: 'Se requiere especificar la tabla'
        } as ApiResponse);
        return;
      }

      const cambios = await CambioModel.findByTabla(tabla);

      res.json({
        success: true,
        message: `Cambios de la tabla ${tabla} obtenidos exitosamente`,
        data: cambios
      } as ApiResponse);

    } catch (error) {
      //('Error al obtener cambios por tabla:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await CambioModel.getEstadisticas();

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: estadisticas
      } as ApiResponse);

    } catch (error) {
      //('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }
}
