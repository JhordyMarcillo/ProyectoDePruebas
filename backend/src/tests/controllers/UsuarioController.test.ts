import { Request, Response } from 'express';
import { UsuarioController } from '../../controllers/UsuarioController';
import { UsuarioModel } from '../../models/PerfilModel';
import { CambioModel } from '../../models/Cambio';
import { AuthPayload } from '../../types';

// Mock dependencies
jest.mock('../../models/PerfilModel');
jest.mock('../../models/Cambio');
jest.mock('bcryptjs');

const mockUsuarioModel = UsuarioModel as jest.Mocked<typeof UsuarioModel>;
const mockCambioModel = CambioModel as jest.Mocked<typeof CambioModel>;

describe('UsuarioController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: { 
        userId: 1, 
        username: 'testuser', 
        perfil: 'admin', 
        permisos: ['Usuarios', 'Asignar'] 
      } as AuthPayload
    };
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    // Setup default mocks
    mockUsuarioModel.findAll = jest.fn();
    mockUsuarioModel.findById = jest.fn();
    mockUsuarioModel.findByUsername = jest.fn();
    mockUsuarioModel.findByEmail = jest.fn();
    mockUsuarioModel.findByCedula = jest.fn();
    mockUsuarioModel.create = jest.fn();
    mockUsuarioModel.update = jest.fn();
    mockUsuarioModel.delete = jest.fn();
    mockUsuarioModel.getStats = jest.fn();
    mockCambioModel.registrarCambio = jest.fn();
  });

  describe('getAll', () => {
    it('should get all usuarios successfully with pagination', async () => {
      // Arrange
      const mockUsuarios = [
        {
          id: 1,
          usuario: 'admin',
          nombre: 'Admin',
          apellido: 'User',
          email: 'admin@example.com',
          password: 'hashedpassword',
          perfil: 'Administrador',
          genero: 'M' as const,
          fecha_nacimiento: new Date(),
          cedula: '12345678',
          permisos: ['Usuarios'],
          estado: 'activo' as const,
          fecha_creacion: new Date()
        }
      ];

      const mockResult = {
        usuarios: mockUsuarios,
        total: 1
      };

      mockRequest.query = { page: '1', limit: '10' };
      mockUsuarioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await UsuarioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.findAll).toHaveBeenCalledWith(10, 0, undefined);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: {
          usuarios: [{
            id: 1,
            usuario: 'admin',
            nombre: 'Admin',
            apellido: 'User',
            email: 'admin@example.com',
            perfil: 'Administrador',
            genero: 'M',
            fecha_nacimiento: expect.any(Date),
            cedula: '12345678',
            permisos: ['Usuarios'],
            estado: 'activo',
            fecha_creacion: expect.any(Date)
          }],
          total: 1
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });
    });

    it('should get all usuarios with search filter', async () => {
      // Arrange
      const mockResult = { usuarios: [], total: 0 };
      mockRequest.query = { page: '1', limit: '10', search: 'admin' };
      mockUsuarioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await UsuarioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.findAll).toHaveBeenCalledWith(10, 0, 'admin');
    });

    it('should use default pagination values when not provided', async () => {
      // Arrange
      const mockResult = { usuarios: [], total: 0 };
      mockRequest.query = {};
      mockUsuarioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await UsuarioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.findAll).toHaveBeenCalledWith(10, 0, undefined);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }));
    });

    it('should handle invalid pagination parameters', async () => {
      // Arrange
      const mockResult = { usuarios: [], total: 0 };
      mockRequest.query = { page: 'invalid', limit: 'invalid' };
      mockUsuarioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await UsuarioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.findAll).toHaveBeenCalledWith(10, 0, undefined);
    });

    it('should handle errors in getAll', async () => {
      // Arrange
      mockUsuarioModel.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await UsuarioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getById', () => {
    it('should get usuario by id successfully', async () => {
      // Arrange
      const mockUsuario = {
        id: 1,
        usuario: 'admin',
        nombre: 'Admin',
        apellido: 'User',
        email: 'admin@example.com',
        password: 'hashedpassword',
        perfil: 'Administrador',
        genero: 'M' as const,
        fecha_nacimiento: new Date(),
        cedula: '12345678',
        permisos: ['Usuarios'],
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockUsuarioModel.findById.mockResolvedValue(mockUsuario);

      // Act
      await UsuarioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.findById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: {
          id: 1,
          usuario: 'admin',
          nombre: 'Admin',
          apellido: 'User',
          email: 'admin@example.com',
          perfil: 'Administrador',
          genero: 'M',
          fecha_nacimiento: expect.any(Date),
          cedula: '12345678',
          permisos: ['Usuarios'],
          estado: 'activo',
          fecha_creacion: expect.any(Date)
        }
      });
    });

    it('should return 404 when usuario not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockUsuarioModel.findById.mockResolvedValue(null);

      // Act
      await UsuarioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no encontrado'
      });
    });

    it('should handle invalid id parameter', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await UsuarioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de usuario inválido'
      });
    });

    it('should handle errors in getById', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockUsuarioModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await UsuarioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('create', () => {
    const validUsuarioData = {
      usuario: 'newuser',
      nombre: 'New',
      apellido: 'User',
      email: 'newuser@example.com',
      password: 'password123',
      perfil: 'Vendedor',
      genero: 'M' as const,
      fecha_nacimiento: '1990-01-01',
      cedula: '0123456789'
    };

    it('should create usuario successfully', async () => {
      // Arrange
      const createdUsuario = {
        id: 2,
        ...validUsuarioData,
        password: 'hashedpassword',
        fecha_nacimiento: new Date(validUsuarioData.fecha_nacimiento),
        permisos: ['Ventas'],
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      mockRequest.body = validUsuarioData;
      mockUsuarioModel.findByUsername.mockResolvedValue(null);
      mockUsuarioModel.findByEmail.mockResolvedValue(null);
      mockUsuarioModel.findByCedula.mockResolvedValue(null);
      mockUsuarioModel.create.mockResolvedValue(createdUsuario);

      // Act
      await UsuarioController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.findByUsername).toHaveBeenCalledWith('newuser');
      expect(mockUsuarioModel.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(mockUsuarioModel.findByCedula).toHaveBeenCalledWith('0123456789');
      expect(mockUsuarioModel.create).toHaveBeenCalledWith(validUsuarioData);
      expect(mockCambioModel.registrarCambio).toHaveBeenCalledWith(
        'testuser',
        'Usuario agregado: New User (Usuario: newuser)',
        'Agregar',
        'perfiles',
        2
      );
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario creado exitosamente',
        data: expect.not.objectContaining({ password: expect.anything() })
      });
    });

    it('should reject if username already exists', async () => {
      // Arrange
      mockRequest.body = validUsuarioData;
      mockUsuarioModel.findByUsername.mockResolvedValue({ id: 1 } as any);

      // Act
      await UsuarioController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Ya existe un usuario con este nombre de usuario'
      });
    });

    it('should reject if email already exists', async () => {
      // Arrange
      mockRequest.body = validUsuarioData;
      mockUsuarioModel.findByUsername.mockResolvedValue(null);
      mockUsuarioModel.findByEmail.mockResolvedValue({ id: 1 } as any);

      // Act
      await UsuarioController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    });

    it('should reject if cedula already exists', async () => {
      // Arrange
      mockRequest.body = validUsuarioData;
      mockUsuarioModel.findByUsername.mockResolvedValue(null);
      mockUsuarioModel.findByEmail.mockResolvedValue(null);
      mockUsuarioModel.findByCedula.mockResolvedValue({ id: 1 } as any);

      // Act
      await UsuarioController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Ya existe un usuario con esta cédula'
      });
    });

    it('should skip cedula validation when cedula is not provided', async () => {
      // Arrange
      const usuarioDataWithoutCedula = {
        usuario: 'newuser',
        nombre: 'New',
        apellido: 'User',
        email: 'newuser@example.com',
        password: 'password123',
        perfil: 'Vendedor',
        genero: 'M' as const,
        fecha_nacimiento: '1990-01-01'
      };
      
      const createdUsuario = {
        id: 2,
        usuario: 'newuser',
        nombre: 'New',
        apellido: 'User',
        email: 'newuser@example.com',
        password: 'hashedpassword',
        perfil: 'Vendedor',
        genero: 'M' as const,
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '',
        permisos: ['Ventas'],
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      mockRequest.body = usuarioDataWithoutCedula;
      mockUsuarioModel.findByUsername.mockResolvedValue(null);
      mockUsuarioModel.findByEmail.mockResolvedValue(null);
      mockUsuarioModel.create.mockResolvedValue(createdUsuario);

      // Act
      await UsuarioController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.findByCedula).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(201);
    });

    it('should handle errors in create', async () => {
      // Arrange
      mockRequest.body = validUsuarioData;
      mockUsuarioModel.findByUsername.mockRejectedValue(new Error('Database error'));

      // Act
      await UsuarioController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('update', () => {
    const existingUsuario = {
      id: 1,
      usuario: 'existinguser',
      nombre: 'Existing',
      apellido: 'User',
      email: 'existing@example.com',
      password: 'hashedpassword',
      perfil: 'Vendedor',
      genero: 'M' as const,
      fecha_nacimiento: new Date(),
      cedula: '1234567890',
      permisos: ['Ventas'],
      estado: 'activo' as const,
      fecha_creacion: new Date()
    };

    it('should update usuario successfully', async () => {
      // Arrange
      const updates = { nombre: 'Updated Name' };
      const updatedUsuario = { ...existingUsuario, ...updates };
      
      mockRequest.params = { id: '1' };
      mockRequest.body = updates;
      mockUsuarioModel.findById.mockResolvedValueOnce(existingUsuario).mockResolvedValueOnce(updatedUsuario);
      mockUsuarioModel.update.mockResolvedValue(updatedUsuario);

      // Act
      await UsuarioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.update).toHaveBeenCalledWith(1, updates);
      expect(mockCambioModel.registrarCambio).toHaveBeenCalledWith(
        'testuser',
        'Usuario actualizado: Updated Name User (Usuario: existinguser)',
        'Actualizar',
        'perfiles',
        1
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: expect.not.objectContaining({ password: expect.anything() })
      });
    });

    it('should return 404 when usuario not found for update', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockRequest.body = { nombre: 'Updated Name' };
      mockUsuarioModel.findById.mockResolvedValue(null);

      // Act
      await UsuarioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no encontrado'
      });
    });

    it('should handle invalid id parameter in update', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { nombre: 'Updated Name' };

      // Act
      await UsuarioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de usuario inválido'
      });
    });

    it('should validate username uniqueness when updating', async () => {
      // Arrange
      const updates = { usuario: 'newusername' };
      
      mockRequest.params = { id: '1' };
      mockRequest.body = updates;
      mockUsuarioModel.findById.mockResolvedValue(existingUsuario);
      mockUsuarioModel.findByUsername.mockResolvedValue({ id: 2 } as any);

      // Act
      await UsuarioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Ya existe un usuario con este nombre de usuario'
      });
    });

    it('should validate email uniqueness when updating', async () => {
      // Arrange
      const updates = { email: 'newemail@example.com' };
      
      mockRequest.params = { id: '1' };
      mockRequest.body = updates;
      mockUsuarioModel.findById.mockResolvedValue(existingUsuario);
      mockUsuarioModel.findByEmail.mockResolvedValue({ id: 2 } as any);

      // Act
      await UsuarioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    });

    it('should validate cedula uniqueness when updating', async () => {
      // Arrange
      const updates = { cedula: '9876543210' };
      
      mockRequest.params = { id: '1' };
      mockRequest.body = updates;
      mockUsuarioModel.findById.mockResolvedValue(existingUsuario);
      mockUsuarioModel.findByCedula.mockResolvedValue({ id: 2 } as any);

      // Act
      await UsuarioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Ya existe un usuario con esta cédula'
      });
    });

    it('should allow updating to same values', async () => {
      // Arrange
      const updates = { 
        usuario: existingUsuario.usuario,
        email: existingUsuario.email,
        cedula: existingUsuario.cedula 
      };
      const updatedUsuario = { ...existingUsuario, ...updates };
      
      mockRequest.params = { id: '1' };
      mockRequest.body = updates;
      mockUsuarioModel.findById.mockResolvedValueOnce(existingUsuario).mockResolvedValueOnce(updatedUsuario);
      mockUsuarioModel.update.mockResolvedValue(updatedUsuario);

      // Act
      await UsuarioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.findByUsername).not.toHaveBeenCalled();
      expect(mockUsuarioModel.findByEmail).not.toHaveBeenCalled();
      expect(mockUsuarioModel.findByCedula).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Usuario actualizado exitosamente'
      }));
    });

    it('should handle update failure', async () => {
      // Arrange
      const updates = { nombre: 'Updated Name' };
      
      mockRequest.params = { id: '1' };
      mockRequest.body = updates;
      mockUsuarioModel.findById.mockResolvedValue(existingUsuario);
      mockUsuarioModel.update.mockResolvedValue(null);

      // Act
      await UsuarioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo actualizar el usuario'
      });
    });

    it('should handle errors in update', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { nombre: 'Updated Name' };
      mockUsuarioModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await UsuarioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('delete', () => {
    const existingUsuario = {
      id: 2,
      usuario: 'userToDelete',
      nombre: 'User',
      apellido: 'ToDelete',
      email: 'delete@example.com',
      password: 'hashedpassword',
      perfil: 'Vendedor',
      genero: 'M' as const,
      fecha_nacimiento: new Date(),
      cedula: '1234567890',
      permisos: ['Ventas'],
      estado: 'activo' as const,
      fecha_creacion: new Date()
    };

    it('should delete usuario successfully', async () => {
      // Arrange
      mockRequest.params = { id: '2' };
      mockUsuarioModel.findById.mockResolvedValue(existingUsuario);
      mockUsuarioModel.delete.mockResolvedValue(true);

      // Act
      await UsuarioController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.delete).toHaveBeenCalledWith(2);
      expect(mockCambioModel.registrarCambio).toHaveBeenCalledWith(
        'testuser',
        'Usuario eliminado: User ToDelete (Usuario: userToDelete)',
        'Inactivo',
        'perfiles',
        2
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    });

    it('should return 404 when usuario not found for delete', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockUsuarioModel.findById.mockResolvedValue(null);

      // Act
      await UsuarioController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no encontrado'
      });
    });

    it('should handle invalid id parameter in delete', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await UsuarioController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de usuario inválido'
      });
    });

    it('should prevent user from deleting themselves', async () => {
      // Arrange
      mockRequest.params = { id: '1' }; // Same as user.userId
      mockUsuarioModel.findById.mockResolvedValue(existingUsuario);

      // Act
      await UsuarioController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No puedes eliminar tu propio usuario'
      });
    });

    it('should handle delete failure', async () => {
      // Arrange
      mockRequest.params = { id: '2' };
      mockUsuarioModel.findById.mockResolvedValue(existingUsuario);
      mockUsuarioModel.delete.mockResolvedValue(false);

      // Act
      await UsuarioController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo eliminar el usuario'
      });
    });

    it('should handle errors in delete', async () => {
      // Arrange
      mockRequest.params = { id: '2' };
      mockUsuarioModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await UsuarioController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('toggleStatus', () => {
    const existingUsuario = {
      id: 2,
      usuario: 'userToToggle',
      nombre: 'User',
      apellido: 'ToToggle',
      email: 'toggle@example.com',
      password: 'hashedpassword',
      perfil: 'Vendedor',
      genero: 'M' as const,
      fecha_nacimiento: new Date(),
      cedula: '1234567890',
      permisos: ['Ventas'],
      estado: 'activo' as const,
      fecha_creacion: new Date()
    };

    it('should toggle usuario status successfully from active to inactive', async () => {
      // Arrange
      const updatedUsuario = { ...existingUsuario, estado: 'inactivo' as const };
      
      mockRequest.params = { id: '2' };
      mockUsuarioModel.findById.mockResolvedValueOnce(existingUsuario).mockResolvedValueOnce(updatedUsuario);
      mockUsuarioModel.update.mockResolvedValue(updatedUsuario);

      // Act
      await UsuarioController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.update).toHaveBeenCalledWith(2, { estado: 'inactivo' });
      expect(mockCambioModel.registrarCambio).toHaveBeenCalledWith(
        'testuser',
        'Usuario desactivado: User ToToggle (Usuario: userToToggle)',
        'Inactivo',
        'perfiles',
        2
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario desactivado exitosamente',
        data: expect.not.objectContaining({ password: expect.anything() })
      });
    });

    it('should toggle usuario status successfully from inactive to active', async () => {
      // Arrange
      const inactiveUsuario = { ...existingUsuario, estado: 'inactivo' as const };
      const updatedUsuario = { ...existingUsuario, estado: 'activo' as const };
      
      mockRequest.params = { id: '2' };
      mockUsuarioModel.findById.mockResolvedValueOnce(inactiveUsuario).mockResolvedValueOnce(updatedUsuario);
      mockUsuarioModel.update.mockResolvedValue(updatedUsuario);

      // Act
      await UsuarioController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.update).toHaveBeenCalledWith(2, { estado: 'activo' });
      expect(mockCambioModel.registrarCambio).toHaveBeenCalledWith(
        'testuser',
        'Usuario activado: User ToToggle (Usuario: userToToggle)',
        'Activo',
        'perfiles',
        2
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario activado exitosamente',
        data: expect.not.objectContaining({ password: expect.anything() })
      });
    });

    it('should return 404 when usuario not found for toggle status', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockUsuarioModel.findById.mockResolvedValue(null);

      // Act
      await UsuarioController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no encontrado'
      });
    });

    it('should handle invalid id parameter in toggle status', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await UsuarioController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de usuario inválido'
      });
    });

    it('should prevent user from changing their own status', async () => {
      // Arrange
      mockRequest.params = { id: '1' }; // Same as user.userId
      mockUsuarioModel.findById.mockResolvedValue(existingUsuario);

      // Act
      await UsuarioController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No puedes cambiar el estado de tu propio usuario'
      });
    });

    it('should handle toggle status update failure', async () => {
      // Arrange
      mockRequest.params = { id: '2' };
      mockUsuarioModel.findById.mockResolvedValue(existingUsuario);
      mockUsuarioModel.update.mockResolvedValue(null);

      // Act
      await UsuarioController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo cambiar el estado del usuario'
      });
    });

    it('should handle errors in toggleStatus', async () => {
      // Arrange
      mockRequest.params = { id: '2' };
      mockUsuarioModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await UsuarioController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('changePassword', () => {
    const bcrypt = require('bcryptjs');
    
    const existingUsuario = {
      id: 2,
      usuario: 'userToChangePassword',
      nombre: 'User',
      apellido: 'ToChangePassword',
      email: 'changepass@example.com',
      password: 'hashedCurrentPassword',
      perfil: 'Vendedor',
      genero: 'M' as const,
      fecha_nacimiento: new Date(),
      cedula: '1234567890',
      permisos: ['Ventas'],
      estado: 'activo' as const,
      fecha_creacion: new Date()
    };

    beforeEach(() => {
      jest.clearAllMocks();
      bcrypt.compare = jest.fn();
    });

    it('should change password successfully for admin user', async () => {
      // Arrange
      mockRequest.params = { id: '2' };
      mockRequest.body = { new_password: 'newPassword123' };
      mockRequest.user = { 
        userId: 1, 
        username: 'admin', 
        perfil: 'admin', 
        permisos: ['Asignar'] 
      } as AuthPayload;
      
      mockUsuarioModel.findById.mockResolvedValue(existingUsuario);
      mockUsuarioModel.update.mockResolvedValue(existingUsuario);

      // Act
      await UsuarioController.changePassword(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.update).toHaveBeenCalledWith(2, { password: 'newPassword123' });
      expect(mockCambioModel.registrarCambio).toHaveBeenCalledWith(
        'admin',
        'Contraseña actualizada para usuario: User ToChangePassword',
        'Actualizar',
        'perfiles',
        2
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    });

    it('should change own password with current password verification', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { current_password: 'currentPassword', new_password: 'newPassword123' };
      
      const ownUsuario = { ...existingUsuario, id: 1 };
      mockUsuarioModel.findById.mockResolvedValue(ownUsuario);
      mockUsuarioModel.update.mockResolvedValue(ownUsuario);
      bcrypt.compare.mockResolvedValue(true);

      // Act
      await UsuarioController.changePassword(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith('currentPassword', ownUsuario.password);
      expect(mockUsuarioModel.update).toHaveBeenCalledWith(1, { password: 'newPassword123' });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    });

    it('should reject invalid current password when changing own password', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { current_password: 'wrongPassword', new_password: 'newPassword123' };
      
      const ownUsuario = { ...existingUsuario, id: 1 };
      mockUsuarioModel.findById.mockResolvedValue(ownUsuario);
      bcrypt.compare.mockResolvedValue(false);

      // Act
      await UsuarioController.changePassword(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    });

    it('should reject when user tries to change another users password without admin permissions', async () => {
      // Arrange
      mockRequest.params = { id: '2' };
      mockRequest.body = { new_password: 'newPassword123' };
      mockRequest.user = { 
        userId: 1, 
        username: 'user', 
        perfil: 'vendedor', 
        permisos: ['Ventas'] 
      } as AuthPayload;

      // Act
      await UsuarioController.changePassword(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes permisos para cambiar esta contraseña'
      });
    });

    it('should return 404 when usuario not found for password change', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockRequest.body = { new_password: 'newPassword123' };
      mockUsuarioModel.findById.mockResolvedValue(null);

      // Act
      await UsuarioController.changePassword(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no encontrado'
      });
    });

    it('should handle invalid id parameter in change password', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { new_password: 'newPassword123' };

      // Act
      await UsuarioController.changePassword(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de usuario inválido'
      });
    });

    it('should handle password update failure', async () => {
      // Arrange
      mockRequest.params = { id: '2' };
      mockRequest.body = { new_password: 'newPassword123' };
      mockUsuarioModel.findById.mockResolvedValue(existingUsuario);
      mockUsuarioModel.update.mockResolvedValue(null);

      // Act
      await UsuarioController.changePassword(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo actualizar la contraseña'
      });
    });

    it('should handle errors in changePassword', async () => {
      // Arrange
      mockRequest.params = { id: '2' };
      mockRequest.body = { new_password: 'newPassword123' };
      mockUsuarioModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await UsuarioController.changePassword(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getStats', () => {
    it('should get usuario statistics successfully', async () => {
      // Arrange
      const mockStats = {
        total: 100,
        activos: 80,
        inactivos: 20,
        porPerfil: [
          { perfil: 'Administrador', cantidad: 5 },
          { perfil: 'Vendedor', cantidad: 70 },
          { perfil: 'Supervisor', cantidad: 25 }
        ],
        porGenero: [
          { genero: 'M', cantidad: 60 },
          { genero: 'F', cantidad: 40 }
        ]
      };

      mockUsuarioModel.getStats.mockResolvedValue(mockStats);

      // Act
      await UsuarioController.getStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUsuarioModel.getStats).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estadísticas de usuarios obtenidas exitosamente',
        data: mockStats
      });
    });

    it('should handle errors in getStats', async () => {
      // Arrange
      mockUsuarioModel.getStats.mockRejectedValue(new Error('Database error'));

      // Act
      await UsuarioController.getStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor',
        error: 'Database error'
      });
    });
  });
});
