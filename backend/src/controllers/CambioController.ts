import { Request, Response } from 'express';
import { CambioModel, Cambio } from '../models/Cambio';
import { ApiResponse } from '../types';

export class CambioController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const tabla = req.query.tabla as string;
      const offset = (page - 1) * limit;

      const { cambios, total } = await CambioModel.findAll(limit, offset, search, tabla);

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
      } as ApiResponse<Cambio[]>);

    } catch (error) {
      //('Error al obtener cambios:', error);
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
          message: 'ID de cambio inválido'
        } as ApiResponse);
        return;
      }

      const cambio = await CambioModel.findById(id);

      if (!cambio) {
        res.status(404).json({
          success: false,
          message: 'Cambio no encontrado'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Cambio obtenido exitosamente',
        data: cambio
      } as ApiResponse<Cambio>);

    } catch (error) {
      //('Error al obtener cambio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getByTabla(req: Request, res: Response): Promise<void> {
    try {
      const tabla = req.params.tabla;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!tabla) {
        res.status(400).json({
          success: false,
          message: 'Nombre de tabla es requerido'
        } as ApiResponse);
        return;
      }

      const cambios = await CambioModel.findByTabla(tabla);

      res.json({
        success: true,
        message: 'Cambios de la tabla obtenidos exitosamente',
        data: cambios
      } as ApiResponse<Cambio[]>);

    } catch (error) {
      //('Error al obtener cambios por tabla:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getByUsuario(req: Request, res: Response): Promise<void> {
    try {
      const usuario_id = req.params.usuario_id;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!usuario_id) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario es requerido'
        } as ApiResponse);
        return;
      }

      const cambios = await CambioModel.findByUsuario(usuario_id, limit);

      res.json({
        success: true,
        message: 'Cambios del usuario obtenidos exitosamente',
        data: cambios
      } as ApiResponse<Cambio[]>);

    } catch (error) {
      //('Error al obtener cambios por usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await CambioModel.getStats();

      res.json({
        success: true,
        message: 'Estadísticas de cambios obtenidas exitosamente',
        data: stats
      } as ApiResponse);

    } catch (error) {
      //('Error al obtener estadísticas de cambios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }
}
