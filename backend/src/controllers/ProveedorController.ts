import { Request, Response } from 'express';
import { ProveedorModel } from '../models/Proveedor';
import { CambioModel } from '../models/Cambio';

export class ProveedorController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const offset = (page - 1) * limit;

      const result = await ProveedorModel.findAll(limit, offset, search);
      
      res.json({
        success: true,
        data: result.proveedores,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      //('Error fetching proveedores:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const proveedor = await ProveedorModel.findById(id);

      if (!proveedor) {
        res.status(404).json({
          success: false,
          message: 'Proveedor no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: proveedor
      });
    } catch (error) {
      //('Error fetching proveedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const proveedorData = {
        nombre_empresa: req.body.nombre_empresa,
        email: req.body.email,
        numero: req.body.numero || '',
        web: req.body.web || '',
        estado: req.body.estado || 'activo'
      };

      const proveedorId = await ProveedorModel.create(proveedorData);

      res.status(201).json({
        success: true,
        message: 'Proveedor creado exitosamente',
        data: { id: proveedorId, ...proveedorData }
      });
    } catch (error) {
      //('Error creating proveedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const proveedorData: any = {};

      if (req.body.nombre_empresa) proveedorData.nombre_empresa = req.body.nombre_empresa;
      if (req.body.email) proveedorData.email = req.body.email;
      if (req.body.numero !== undefined) proveedorData.numero = req.body.numero;
      if (req.body.web !== undefined) proveedorData.web = req.body.web;
      if (req.body.estado) proveedorData.estado = req.body.estado;

      const updated = await ProveedorModel.update(id, proveedorData);

      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Proveedor no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Proveedor actualizado exitosamente'
      });
    } catch (error) {
      //('Error updating proveedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const deleted = await ProveedorModel.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Proveedor no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Proveedor eliminado exitosamente'
      });
    } catch (error) {
      //('Error deleting proveedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
