import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthController } from '../../controllers/AuthController';
import { UsuarioModel, Usuario } from '../../models/PerfilModel';
import { config } from '../../config';

// Mock dependencies
jest.mock('../../models/PerfilModel');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockUsuarioModel = UsuarioModel as jest.Mocked<typeof UsuarioModel>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

// Extended Request interface for testing
interface RequestWithUser extends Request {
  user?: {
    userId: number;
    username: string;
    perfil: string;
    permisos: string[];
  };
}

describe('AuthController', () => {
  let mockRequest: Partial<RequestWithUser>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Arrange - Setup mocks
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        usuario: 'testuser',
        password: 'testpassword'
      };

      const mockUser: Usuario = {
        id: 1,
        usuario: 'testuser',
        password: 'hashedpassword',
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '12345678',
        perfil: 'admin',
        estado: 'activo',
        permisos: ['Cliente', 'Ventas'],
        fecha_creacion: new Date()
      };

      mockRequest.body = loginData;
      mockUsuarioModel.findByUsernameWithPassword.mockResolvedValue(mockUser);
      mockUsuarioModel.updateLastAccess.mockResolvedValue(undefined);
      //mockJwt.sign.mockReturnValue('mock-token' as never);

      // Act
      await AuthController.login(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.findByUsernameWithPassword).toHaveBeenCalledWith('testuser');
      expect(mockUsuarioModel.updateLastAccess).toHaveBeenCalledWith(0);
      expect(mockJwt.sign).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Inicio de sesión exitoso',
          data: expect.objectContaining({
            token: 'mock-token'
          })
        })
      );
    });

    it('should fail with missing credentials', async () => {
      // Arrange
      mockRequest.body = {};

      // Act
      await AuthController.login(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    });

    it('should fail with non-existent user', async () => {
      // Arrange
      mockRequest.body = {
        usuario: 'nonexistent',
        password: 'password'
      };
      mockUsuarioModel.findByUsernameWithPassword.mockResolvedValue(null);

      // Act
      await AuthController.login(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Credenciales inválidas'
      });
    });

    it('should fail with inactive user', async () => {
      // Arrange
      const mockUser: Usuario = {
        id: 1,
        usuario: 'testuser',
        password: 'hashedpassword',
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '12345678',
        perfil: 'admin',
        estado: 'inactivo',
        permisos: ['Cliente'],
        fecha_creacion: new Date()
      };

      mockRequest.body = {
        usuario: 'testuser',
        password: 'password'
      };
      mockUsuarioModel.findByUsernameWithPassword.mockResolvedValue(mockUser);

      // Act
      await AuthController.login(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario inactivo'
      });
    });

    it('should fail with invalid password', async () => {
      // Arrange
      const mockUser: Usuario = {
        id: 1,
        usuario: 'testuser',
        password: 'hashedpassword',
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '12345678',
        perfil: 'admin',
        estado: 'activo',
        permisos: ['Cliente'],
        fecha_creacion: new Date()
      };

      mockRequest.body = {
        usuario: 'testuser',
        password: 'wrongpassword'
      };
      mockUsuarioModel.findByUsernameWithPassword.mockResolvedValue(mockUser);

      // Act
      await AuthController.login(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Credenciales inválidas'
      });
    });

    it('should handle internal server error', async () => {
      // Arrange
      mockRequest.body = {
        usuario: 'testuser',
        password: 'password'
      };
      mockUsuarioModel.findByUsernameWithPassword.mockRejectedValue(new Error('Database error'));

      // Act
      await AuthController.login(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      // Arrange
      const userData = {
        usuario: 'newuser',
        password: 'password123',
        nombre: 'New',
        apellido: 'User',
        email: 'new@example.com',
        genero: 'M' as const,
        fecha_nacimiento: '1990-01-01',
        cedula: '87654321',
        perfil: 'vendedor'
      };

      const mockNewUser: Usuario = {
        id: 2,
        usuario: 'newuser',
        password: 'hashedpassword',
        nombre: 'New',
        apellido: 'User',
        email: 'new@example.com',
        genero: 'M',
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '87654321',
        perfil: 'vendedor',
        estado: 'activo',
        permisos: [],
        fecha_creacion: new Date()
      };

      mockRequest.body = userData;
      mockUsuarioModel.findByUsername.mockResolvedValue(null);
      mockUsuarioModel.create.mockResolvedValue(mockNewUser);

      // Act
      await AuthController.register(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.findByUsername).toHaveBeenCalledWith('newuser');
      expect(mockUsuarioModel.create).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Usuario registrado exitosamente'
        })
      );
    });

    it('should fail when username already exists', async () => {
      // Arrange
      const userData = {
        usuario: 'existinguser',
        password: 'password123'
      };

      const mockExistingUser: Usuario = {
        id: 1,
        usuario: 'existinguser',
        nombre: 'Existing',
        apellido: 'User',
        email: 'existing@example.com',
        genero: 'M',
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '12345678',
        password: 'password',
        perfil: 'admin',
        estado: 'activo',
        permisos: [],
        fecha_creacion: new Date()
      };

      mockRequest.body = userData;
      mockUsuarioModel.findByUsername.mockResolvedValue(mockExistingUser);

      // Act
      await AuthController.register(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'El nombre de usuario ya está en uso'
      });
    });

    it('should fail when user creation fails', async () => {
      // Arrange
      const userData = {
        usuario: 'newuser',
        password: 'password123',
        nombre: 'New',
        apellido: 'User',
        email: 'new@example.com'
      };

      mockRequest.body = userData;
      mockUsuarioModel.findByUsername.mockResolvedValue(null);
      mockUsuarioModel.create.mockResolvedValue(undefined as any);

      // Act
      await AuthController.register(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle internal server error during registration', async () => {
      // Arrange
      const userData = {
        usuario: 'newuser',
        password: 'password123'
      };

      mockRequest.body = userData;
      mockUsuarioModel.findByUsername.mockRejectedValue(new Error('Database error'));

      // Act
      await AuthController.register(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      // Arrange
      const mockUser: Usuario = {
        id: 1,
        usuario: 'testuser',
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '12345678',
        perfil: 'admin',
        password: 'hashedpassword',
        estado: 'activo',
        permisos: [],
        fecha_creacion: new Date()
      };

      mockRequest.user = { 
        userId: 1, 
        username: 'testuser', 
        perfil: 'admin', 
        permisos: [] 
      };
      mockUsuarioModel.findById.mockResolvedValue(mockUser);

      // Act
      await AuthController.getProfile(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.findById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Perfil obtenido exitosamente'
        })
      );
    });

    it('should fail when user not authenticated', async () => {
      // Arrange
      delete (mockRequest as any).user;

      // Act
      await AuthController.getProfile(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should fail when user not found', async () => {
      // Arrange
      mockRequest.user = { 
        userId: 999, 
        username: 'nonexistent', 
        perfil: 'admin', 
        permisos: [] 
      };
      mockUsuarioModel.findById.mockResolvedValue(null);

      // Act
      await AuthController.getProfile(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no encontrado'
      });
    });

    it('should handle internal server error in getProfile', async () => {
      // Arrange
      mockRequest.user = { 
        userId: 1, 
        username: 'testuser', 
        perfil: 'admin', 
        permisos: [] 
      };
      mockUsuarioModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await AuthController.getProfile(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      // Arrange
      const updates = {
        nombre: 'Updated',
        apellido: 'Name'
      };

      const mockUpdatedUser: Usuario = {
        id: 1,
        usuario: 'testuser',
        nombre: 'Updated',
        apellido: 'Name',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '12345678',
        perfil: 'admin',
        password: 'hashedpassword',
        estado: 'activo',
        permisos: [],
        fecha_creacion: new Date()
      };

      mockRequest.user = { 
        userId: 1, 
        username: 'testuser', 
        perfil: 'admin', 
        permisos: [] 
      };
      mockRequest.body = updates;
      mockUsuarioModel.update.mockResolvedValue(mockUpdatedUser);
      mockUsuarioModel.findById.mockResolvedValue(mockUpdatedUser);

      // Act
      await AuthController.updateProfile(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.update).toHaveBeenCalledWith(1, updates);
      expect(mockUsuarioModel.findById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Perfil actualizado exitosamente'
        })
      );
    });

    it('should hash password when updating password', async () => {
      // Arrange
      const updates = {
        password: 'newpassword'
      };

      const mockUpdatedUser: Usuario = {
        id: 1,
        usuario: 'testuser',
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '12345678',
        password: 'newhashed',
        perfil: 'admin',
        estado: 'activo',
        permisos: [],
        fecha_creacion: new Date()
      };

      mockRequest.user = { 
        userId: 1, 
        username: 'testuser', 
        perfil: 'admin', 
        permisos: [] 
      };
      mockRequest.body = updates;
      mockUsuarioModel.update.mockResolvedValue(mockUpdatedUser);
      mockUsuarioModel.findById.mockResolvedValue(mockUpdatedUser);

      // Act
      await AuthController.updateProfile(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.update).toHaveBeenCalledWith(1, { password: 'newpassword' });
    });

    it('should fail when user not authenticated for update', async () => {
      // Arrange
      delete (mockRequest as any).user;
      mockRequest.body = { nombre: 'Updated' };

      // Act
      await AuthController.updateProfile(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
    });

    it('should fail when update operation fails', async () => {
      // Arrange
      const updates = { nombre: 'Updated' };

      mockRequest.user = { 
        userId: 1, 
        username: 'testuser', 
        perfil: 'admin', 
        permisos: [] 
      };
      mockRequest.body = updates;
      mockUsuarioModel.update.mockResolvedValue(null);

      // Act
      await AuthController.updateProfile(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo actualizar el perfil'
      });
    });

    it('should handle error when fetching updated user fails', async () => {
      // Arrange
      const updates = { nombre: 'Updated' };

      const mockUpdatedUser: Usuario = {
        id: 1,
        usuario: 'testuser',
        nombre: 'Updated',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '12345678',
        perfil: 'admin',
        password: 'hashedpassword',
        estado: 'activo',
        permisos: [],
        fecha_creacion: new Date()
      };

      mockRequest.user = { 
        userId: 1, 
        username: 'testuser', 
        perfil: 'admin', 
        permisos: [] 
      };
      mockRequest.body = updates;
      mockUsuarioModel.update.mockResolvedValue(mockUpdatedUser);
      mockUsuarioModel.findById.mockResolvedValue(null);

      // Act
      await AuthController.updateProfile(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle internal server error in updateProfile', async () => {
      // Arrange
      mockRequest.user = { 
        userId: 1, 
        username: 'testuser', 
        perfil: 'admin', 
        permisos: [] 
      };
      mockRequest.body = { nombre: 'Updated' };
      mockUsuarioModel.update.mockRejectedValue(new Error('Database error'));

      // Act
      await AuthController.updateProfile(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Arrange - No specific setup needed

      // Act
      await AuthController.logout(mockRequest as RequestWithUser, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    });
  });
});
