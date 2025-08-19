import { Request, Response } from 'express';
import { UsuarioModel, CreateUsuarioRequest, UpdateUsuarioRequest } from '../models/PerfilModel';
import { CambioModel } from '../models/Cambio';
import { ApiResponse } from '../types';

export class UsuarioController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const offset = (page - 1) * limit;

      const { usuarios, total } = await UsuarioModel.findAll(limit, offset, search);

      const totalPages = Math.ceil(total / limit);

      // Omitir passwords de la respuesta
      const usuariosSinPassword = usuarios.map(usuario => {
        const { password, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword;
      });

      res.json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: {
          usuarios: usuariosSinPassword,
          total
        },
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      } as ApiResponse);

    } catch (error) {
      //('Error al obtener usuarios:', error);
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
          message: 'ID de usuario inválido'
        } as ApiResponse);
        return;
      }

      const usuario = await UsuarioModel.findById(id);

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse);
        return;
      }

      // Omitir password de la respuesta
      const { password, ...usuarioSinPassword } = usuario;

      res.json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: usuarioSinPassword
      } as ApiResponse);

    } catch (error) {
      //('Error al obtener usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const usuarioData: CreateUsuarioRequest = req.body;
      const userInfo = (req as any).user; // Usuario autenticado

      // Verificar si ya existe un usuario con el mismo nombre de usuario
      const existingUsuario = await UsuarioModel.findByUsername(usuarioData.usuario);
      if (existingUsuario) {
        res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con este nombre de usuario'
        } as ApiResponse);
        return;
      }

      // Verificar si ya existe un usuario con el mismo email
      const existingEmail = await UsuarioModel.findByEmail(usuarioData.email);
      if (existingEmail) {
        res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con este email'
        } as ApiResponse);
        return;
      }

      // Verificar si ya existe un usuario con la misma cédula
      if (usuarioData.cedula) {
        const existingCedula = await UsuarioModel.findByCedula(usuarioData.cedula);
        if (existingCedula) {
          res.status(400).json({
            success: false,
            message: 'Ya existe un usuario con esta cédula'
          } as ApiResponse);
          return;
        }
      }

      const newUsuario = await UsuarioModel.create(usuarioData);

      // Registrar cambio en auditoría
      await CambioModel.registrarCambio(
        userInfo.username,
        `Usuario agregado: ${usuarioData.nombre} ${usuarioData.apellido} (Usuario: ${usuarioData.usuario})`,
        'Agregar',
        'perfiles',
        newUsuario.id
      );

      // Omitir password de la respuesta
      const { password, ...usuarioSinPassword } = newUsuario!;

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuarioSinPassword
      } as ApiResponse);

    } catch (error) {
      //('Error al crear usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const updates: UpdateUsuarioRequest = req.body;
      const userInfo = (req as any).user; // Usuario autenticado

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        } as ApiResponse);
        return;
      }

      // Verificar si el usuario existe
      const existingUsuario = await UsuarioModel.findById(id);
      if (!existingUsuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse);
        return;
      }

      // Verificaciones de unicidad si se están actualizando estos campos
      if (updates.usuario && updates.usuario !== existingUsuario.usuario) {
        const usuarioWithSameUsername = await UsuarioModel.findByUsername(updates.usuario);
        if (usuarioWithSameUsername) {
          res.status(400).json({
            success: false,
            message: 'Ya existe un usuario con este nombre de usuario'
          } as ApiResponse);
          return;
        }
      }

      if (updates.email && updates.email !== existingUsuario.email) {
        const usuarioWithSameEmail = await UsuarioModel.findByEmail(updates.email);
        if (usuarioWithSameEmail) {
          res.status(400).json({
            success: false,
            message: 'Ya existe un usuario con este email'
          } as ApiResponse);
          return;
        }
      }

      if (updates.cedula && updates.cedula !== existingUsuario.cedula) {
        const usuarioWithSameCedula = await UsuarioModel.findByCedula(updates.cedula);
        if (usuarioWithSameCedula) {
          res.status(400).json({
            success: false,
            message: 'Ya existe un usuario con esta cédula'
          } as ApiResponse);
          return;
        }
      }

      const updated = await UsuarioModel.update(id, updates);
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar el usuario'
        } as ApiResponse);
        return;
      }

      const updatedUsuario = await UsuarioModel.findById(id);

      // Registrar cambio en auditoría
      await CambioModel.registrarCambio(
        userInfo.username,
        `Usuario actualizado: ${updatedUsuario?.nombre} ${updatedUsuario?.apellido} (Usuario: ${updatedUsuario?.usuario})`,
        'Actualizar',
        'perfiles',
        id
      );

      // Omitir password de la respuesta
      const { password, ...usuarioSinPassword } = updatedUsuario!;

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioSinPassword
      } as ApiResponse);

    } catch (error) {
      //('Error al actualizar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const userInfo = (req as any).user; // Usuario autenticado

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        } as ApiResponse);
        return;
      }

      const usuario = await UsuarioModel.findById(id);
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse);
        return;
      }

      // No permitir eliminar al propio usuario
      if (userInfo.userId === id) {
        res.status(400).json({
          success: false,
          message: 'No puedes eliminar tu propio usuario'
        } as ApiResponse);
        return;
      }

      const deleted = await UsuarioModel.delete(id);
      if (!deleted) {
        res.status(400).json({
          success: false,
          message: 'No se pudo eliminar el usuario'
        } as ApiResponse);
        return;
      }

      // Registrar cambio en auditoría
      await CambioModel.registrarCambio(
        userInfo.username,
        `Usuario eliminado: ${usuario.nombre} ${usuario.apellido} (Usuario: ${usuario.usuario})`,
        'Inactivo',
        'perfiles',
        id
      );

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      } as ApiResponse);

    } catch (error) {
      //('Error al eliminar usuario:', error);
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
          message: 'ID de usuario inválido'
        } as ApiResponse);
        return;
      }

      const usuario = await UsuarioModel.findById(id);
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse);
        return;
      }

      // No permitir cambiar estado del propio usuario
      if (userInfo.userId === id) {
        res.status(400).json({
          success: false,
          message: 'No puedes cambiar el estado de tu propio usuario'
        } as ApiResponse);
        return;
      }

      const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
      const updated = await UsuarioModel.update(id, { estado: nuevoEstado });

      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo cambiar el estado del usuario'
        } as ApiResponse);
        return;
      }

      // Registrar cambio en auditoría
      await CambioModel.registrarCambio(
        userInfo.username,
        `Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}: ${usuario.nombre} ${usuario.apellido} (Usuario: ${usuario.usuario})`,
        nuevoEstado === 'activo' ? 'Activo' : 'Inactivo',
        'perfiles',
        id
      );

      const updatedUsuario = await UsuarioModel.findById(id);
      const { password, ...usuarioSinPassword } = updatedUsuario!;

      res.json({
        success: true,
        message: `Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
        data: usuarioSinPassword
      } as ApiResponse);

    } catch (error) {
      //('Error al cambiar estado del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id!);
      const { current_password, new_password } = req.body;
      const userInfo = (req as any).user; // Usuario autenticado

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        } as ApiResponse);
        return;
      }

      // Solo permitir cambiar contraseña propia o si es admin
      if (userInfo.userId !== id && !userInfo.permisos.includes('Asignar')) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para cambiar esta contraseña'
        } as ApiResponse);
        return;
      }

      const usuario = await UsuarioModel.findById(id);
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse);
        return;
      }

      // Si no es admin, verificar contraseña actual
      if (userInfo.userId === id && current_password) {
        const bcrypt = require('bcryptjs');
        const isValidPassword = await bcrypt.compare(current_password, usuario.password);
        if (!isValidPassword) {
          res.status(400).json({
            success: false,
            message: 'Contraseña actual incorrecta'
          } as ApiResponse);
          return;
        }
      }

      const updated = await UsuarioModel.update(id, { password: new_password });
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar la contraseña'
        } as ApiResponse);
        return;
      }

      // Registrar cambio en auditoría
      await CambioModel.registrarCambio(
        userInfo.username,
        `Contraseña actualizada para usuario: ${usuario.nombre} ${usuario.apellido}`,
        'Actualizar',
        'perfiles',
        id
      );

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      } as ApiResponse);

    } catch (error) {
      //('Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await UsuarioModel.getStats();
      
      const response: ApiResponse = {
        success: true,
        message: 'Estadísticas de usuarios obtenidas exitosamente',
        data: stats
      };
      
      res.json(response);
    } catch (error) {
      //('Error obteniendo estadísticas de usuarios:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
      res.status(500).json(response);
    }
  }
}
