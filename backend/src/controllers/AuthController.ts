import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/PerfilModel';
import { config } from '../config';
import { ApiResponse, LoginRequest, Usuario } from '../types';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { usuario, password }: LoginRequest = req.body;

      if (!usuario || !password) {
        res.status(400).json({
          success: false,
          message: 'Usuario y contraseña son requeridos'
        } as ApiResponse);
        return;
      }

      // Buscar usuario
      const user = await UsuarioModel.findByUsernameWithPassword(usuario);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        } as ApiResponse);
        return;
      }

      // Verificar estado del usuario
      if (user.estado !== 'activo') {
        res.status(401).json({
          success: false,
          message: 'Usuario inactivo'
        } as ApiResponse);
        return;
      }

      // Verificar contraseña
      const isValidPassword = await (password === user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        } as ApiResponse);
        return;
      }

      // Actualizar último acceso
      await UsuarioModel.updateLastAccess(user.id!);

      // Generar token
      const tokenPayload = {
        userId: user.id,
        username: user.usuario,
        perfil: user.perfil,
        permisos: user.permisos || []
      };

      const token = jwt.sign(tokenPayload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      } as jwt.SignOptions);

      // Remover contraseña de la respuesta
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: userWithoutPassword,
          token
        }
      } as ApiResponse);

    } catch (error) {
      //('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: Usuario = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await UsuarioModel.findByUsername(userData.usuario);
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso'
        } as ApiResponse);
        return;
      }

      // Encriptar contraseña
      const hashedPassword = await (userData.password!);

      // Crear usuario
      const newUser = await UsuarioModel.create({
        ...userData,
        password: hashedPassword
      });

      if (!newUser) {
        throw new Error('Error al crear usuario');
      }

      // Remover contraseña de la respuesta
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: userWithoutPassword
      } as ApiResponse);

    } catch (error) {
      //('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        } as ApiResponse);
        return;
      }

      const user = await UsuarioModel.findById(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        } as ApiResponse);
        return;
      }

      // Remover contraseña de la respuesta
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: userWithoutPassword
      } as ApiResponse);

    } catch (error) {
      //('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        } as ApiResponse);
        return;
      }

      const updates: Partial<Usuario> = req.body;

      // Si se está actualizando la contraseña, encriptarla
      if (updates.password) {
        updates.password = await (updates.password);
      }

      // Actualizar usuario
      const updated = await UsuarioModel.update(req.user.userId, updates);
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar el perfil'
        } as ApiResponse);
        return;
      }

      // Obtener usuario actualizado
      const user = await UsuarioModel.findById(req.user.userId);
      if (!user) {
        throw new Error('Error al obtener usuario actualizado');
      }

      // Remover contraseña de la respuesta
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: userWithoutPassword
      } as ApiResponse);

    } catch (error) {
      //('Error al actualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      } as ApiResponse);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    // En una implementación real podrías invalidar el token
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    } as ApiResponse);
  }
}
