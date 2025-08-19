import { Request, Response } from 'express';
import { ClienteModel } from '../models/Cliente';
import { CambioModel } from '../models/Cambio';
import { ApiResponse, Cliente } from '../types';

export class ClienteController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const offset = (page - 1) * limit;

      const { clientes, total } = await ClienteModel.findAll(limit, offset, search);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        message: 'Clientes obtenidos exitosamente',
        data: clientes,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      } as ApiResponse<Cliente[]>);

    } catch (error) {
      console.error('Error al obtener clientes:', error);
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
          message: 'ID de cliente inválido'
        } as ApiResponse);
        return;
      }

      const cliente = await ClienteModel.findById(id);
      
      if (!cliente) {
        res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Cliente obtenido exitosamente',
        data: cliente
      } as ApiResponse<Cliente>);

    } catch (error) {
      console.error('Error al obtener cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const clienteData: Cliente = req.body;
      const userInfo = (req as any).user; // Usuario autenticado

      // Verificar si ya existe un cliente con la misma cédula
      const existingCliente = await ClienteModel.findByCedula(clienteData.cedula);
      if (existingCliente) {
        res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con esta cédula'
        } as ApiResponse);
        return;
      }

      const clienteId = await ClienteModel.create(clienteData);
      const newCliente = await ClienteModel.findById(clienteId);

      // Registrar cambio en auditoría
      await CambioModel.registrarCambio(
        userInfo.username,
        `Cliente agregado: ${clienteData.nombre} ${clienteData.apellido} (Cédula: ${clienteData.cedula})`,
        'Agregar',
        'clientes',
        clienteId
      );

      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: newCliente
      } as ApiResponse<Cliente>);

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const updates: Partial<Cliente> = req.body;
      const userInfo = (req as any).user; // Usuario autenticado

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de cliente inválido'
        } as ApiResponse);
        return;
      }

      // Verificar si el cliente existe
      const existingCliente = await ClienteModel.findById(id);
      if (!existingCliente) {
        res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        } as ApiResponse);
        return;
      }

      // Si se está actualizando la cédula, verificar que no exista otro cliente con la misma
      if (updates.cedula && updates.cedula !== existingCliente.cedula) {
        const clienteWithSameCedula = await ClienteModel.findByCedula(updates.cedula);
        if (clienteWithSameCedula) {
          res.status(400).json({
            success: false,
            message: 'Ya existe un cliente con esta cédula'
          } as ApiResponse);
          return;
        }
      }

      const updated = await ClienteModel.update(id, updates);
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar el cliente'
        } as ApiResponse);
        return;
      }

      const updatedCliente = await ClienteModel.findById(id);

      // Registrar cambio en auditoría
      await CambioModel.registrarCambio(
        userInfo.username,
        `Cliente actualizado: ${updatedCliente?.nombre} ${updatedCliente?.apellido} (Cédula: ${updatedCliente?.cedula})`,
        'Actualizar',
        'clientes',
        id
      );

      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: updatedCliente
      } as ApiResponse<Cliente>);

    } catch (error) {
      console.error('Error al actualizar cliente:', error);
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
          message: 'ID de cliente inválido'
        } as ApiResponse);
        return;
      }

      const cliente = await ClienteModel.findById(id);
      if (!cliente) {
        res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        } as ApiResponse);
        return;
      }

      const deleted = await ClienteModel.delete(id);
      if (!deleted) {
        res.status(400).json({
          success: false,
          message: 'No se pudo eliminar el cliente'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      } as ApiResponse);

    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getByCedula(req: Request, res: Response): Promise<void> {
    try {
      const { cedula } = req.params;

      if (!cedula) {
        res.status(400).json({
          success: false,
          message: 'Cédula es requerida'
        } as ApiResponse);
        return;
      }

      const cliente = await ClienteModel.findByCedula(cedula);
      
      if (!cliente) {
        res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Cliente obtenido exitosamente',
        data: cliente
      } as ApiResponse<Cliente>);

    } catch (error) {
      console.error('Error al obtener cliente por cédula:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const userInfo = (req as any).user; // Usuario autenticado

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de cliente inválido'
        } as ApiResponse);
        return;
      }

      const cliente = await ClienteModel.findById(id);
      if (!cliente) {
        res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        } as ApiResponse);
        return;
      }

      const nuevoEstado = cliente.estado === 'activo' ? 'inactivo' : 'activo';
      const updated = await ClienteModel.update(id, { estado: nuevoEstado });

      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo cambiar el estado del cliente'
        } as ApiResponse);
        return;
      }

      // Registrar cambio en auditoría
      await CambioModel.registrarCambio(
        userInfo.username,
        `Cliente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}: ${cliente.nombre} ${cliente.apellido} (Cédula: ${cliente.cedula})`,
        nuevoEstado === 'activo' ? 'Activo' : 'Inactivo',
        'clientes',
        id
      );

      const updatedCliente = await ClienteModel.findById(id);

      res.json({
        success: true,
        message: `Cliente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
        data: updatedCliente
      } as ApiResponse<Cliente>);

    } catch (error) {
      console.error('Error al cambiar estado del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }
}
