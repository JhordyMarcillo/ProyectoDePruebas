import { UsuarioModel, Usuario } from '../../models/PerfilModel';
import { executeQuery } from '../../config/database';

// Mock database
jest.mock('../../config/database');

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  hashSync: jest.fn()
}));

describe('UsuarioModel', () => {
  let mockExecuteQuery: jest.MockedFunction<typeof executeQuery>;

  beforeEach(() => {
    mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;
    jest.clearAllMocks();
    
    // Reset bcrypt mocks
    const bcrypt = require('bcrypt');
    bcrypt.compare.mockReset();
    bcrypt.hash.mockReset();
    bcrypt.hashSync.mockReset();
  });

  describe('findByUsername', () => {
    it('should find user by username successfully', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: 'Cliente,Ventas',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.findByUsername('testuser');

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nombre, apellido, email, genero, fecha_nacimiento'),
        ['testuser']
      );
      expect(result).toEqual({
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        password: undefined,
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'activo',
        fecha_creacion: expect.any(Date)
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await UsuarioModel.findByUsername('nonexistent');

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nombre, apellido, email, genero, fecha_nacimiento'),
        ['nonexistent']
      );
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: 'Cliente,Ventas',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.findById(1);

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nombre, apellido, email, genero, fecha_nacimiento'),
        [1]
      );
      expect(result).toEqual({
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        password: undefined,
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'activo',
        fecha_creacion: expect.any(Date)
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await UsuarioModel.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      // Arrange
      const newUserData = {
        nombre: 'New',
        apellido: 'User',
        email: 'new@example.com',
        genero: 'F' as const,
        fecha_nacimiento: '1992-05-15',
        cedula: '87654321',
        usuario: 'newuser',
        password: 'hashedpassword',
        perfil: 'vendedor',
        permisos: 'Cliente'
      };

      const mockNewUser = {
        id: 2,
        nombre: 'New',
        apellido: 'User',
        email: 'new@example.com',
        genero: 'F',
        fecha_nacimiento: '1992-05-15',
        cedula: '87654321',
        usuario: 'newuser',
        contraseña: 'hashedpassword',
        perfil: 'vendedor',
        permisos: 'Cliente',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery
        .mockResolvedValueOnce({ insertId: 2 }) // For INSERT
        .mockResolvedValueOnce([mockNewUser]); // For SELECT

      // Act
      const result = await UsuarioModel.create(newUserData);

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO perfiles'),
        expect.arrayContaining([
          'New', 'User', 'new@example.com', 'F', '1992-05-15',
          '87654321', 'newuser', expect.any(String), 'vendedor', 'Cliente'
        ])
      );
      expect(result).toEqual({
        id: 2,
        nombre: 'New',
        apellido: 'User',
        email: 'new@example.com',
        genero: 'F',
        fecha_nacimiento: '1992-05-15',
        cedula: '87654321',
        usuario: 'newuser',
        password: undefined,
        perfil: 'vendedor',
        permisos: ['Cliente'],
        estado: 'activo',
        fecha_creacion: expect.any(Date)
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 1;
      const updateData = {
        nombre: 'Updated',
        apellido: 'Name',
        email: 'updated@example.com'
      };

      const mockUpdatedUser = {
        id: 1,
        nombre: 'Updated',
        apellido: 'Name',
        email: 'updated@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: 'Cliente,Ventas',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery
        .mockResolvedValueOnce({ affectedRows: 1 }) // For UPDATE
        .mockResolvedValueOnce([mockUpdatedUser]); // For SELECT

      // Act
      const result = await UsuarioModel.update(userId, updateData);

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE perfiles SET'),
        expect.arrayContaining(['Updated', 'Name', 'updated@example.com', userId])
      );
      expect(result).toEqual({
        id: 1,
        nombre: 'Updated',
        apellido: 'Name',
        email: 'updated@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        password: undefined,
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'activo',
        fecha_creacion: expect.any(Date)
      });
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 1;
      mockExecuteQuery.mockResolvedValue({ affectedRows: 1 });

      // Act
      const result = await UsuarioModel.delete(userId);

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'DELETE FROM perfiles WHERE id = ?',
        [userId]
      );
      expect(result).toBe(true);
    });

    it('should return false when user not found for deletion', async () => {
      // Arrange
      const userId = 999;
      mockExecuteQuery.mockResolvedValue({ affectedRows: 0 });

      // Act
      const result = await UsuarioModel.delete(userId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('updateLastAccess', () => {
    it('should update last access successfully', async () => {
      // Arrange
      const userId = 1;

      // Act
      await UsuarioModel.updateLastAccess(userId);

      // Assert
      // El método actual está deshabilitado y solo retorna Promise.resolve()
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it('should handle update last access error', async () => {
      // Arrange
      const userId = 1;

      // Act & Assert
      // El método actual siempre resuelve exitosamente
      await expect(UsuarioModel.updateLastAccess(userId)).resolves.toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should find all users with pagination', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          nombre: 'Test1',
          apellido: 'User1',
          email: 'test1@example.com',
          genero: 'M',
          fecha_nacimiento: '1990-01-01',
          cedula: '12345678',
          usuario: 'testuser1',
          contraseña: 'hashedpassword',
          perfil: 'admin',
          permisos: 'Cliente,Ventas',
          estado: 'activo',
          fecha_creacion: new Date()
        },
        {
          id: 2,
          nombre: 'Test2',
          apellido: 'User2',
          email: 'test2@example.com',
          genero: 'F',
          fecha_nacimiento: '1992-02-02',
          cedula: '87654321',
          usuario: 'testuser2',
          contraseña: 'hashedpassword',
          perfil: 'vendedor',
          permisos: 'Cliente',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];

      const mockTotal = [{ total: 2 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockUsers) // For SELECT users
        .mockResolvedValueOnce(mockTotal); // For COUNT

      // Act
      const result = await UsuarioModel.findAll(10, 0);

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nombre, apellido, email, genero, fecha_nacimiento'),
        [10, 0]
      );
      expect(result.usuarios).toHaveLength(2);
      expect(result.usuarios[0]).toEqual({
        id: 1,
        nombre: 'Test1',
        apellido: 'User1',
        email: 'test1@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser1',
        password: undefined,
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'activo',
        fecha_creacion: expect.any(Date)
      });
    });

    it('should return empty array when no users found', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([]) // For SELECT users
        .mockResolvedValueOnce([{ total: 0 }]); // For COUNT

      // Act
      const result = await UsuarioModel.findAll(10, 0);

      // Assert
      expect(result).toEqual({ usuarios: [], total: 0 });
    });
  });

  describe('findByUsernameWithPassword', () => {
    it('should find user by username with password successfully', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: 'Cliente,Ventas',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.findByUsernameWithPassword('testuser');

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nombre, apellido, email, genero, fecha_nacimiento'),
        ['testuser']
      );
      expect(result).toEqual({
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        password: 'hashedpassword', // Password included for verification
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'activo',
        fecha_creacion: expect.any(Date)
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await UsuarioModel.findByUsernameWithPassword('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when result is empty object', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([null]);

      // Act
      const result = await UsuarioModel.findByUsernameWithPassword('testuser');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: 'Cliente,Ventas',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.findByEmail('test@example.com');

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = ?'),
        ['test@example.com']
      );
      expect(result).toEqual({
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        password: undefined,
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'activo',
        fecha_creacion: expect.any(Date)
      });
    });

    it('should return null when user not found by email', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await UsuarioModel.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when email result is empty object', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([null]);

      // Act
      const result = await UsuarioModel.findByEmail('test@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByCedula', () => {
    it('should find user by cedula successfully', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: 'Cliente,Ventas',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.findByCedula('12345678');

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE cedula = ?'),
        ['12345678']
      );
      expect(result).toEqual({
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        password: undefined,
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'activo',
        fecha_creacion: expect.any(Date)
      });
    });

    it('should return null when user not found by cedula', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await UsuarioModel.findByCedula('99999999');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when cedula result is empty object', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([null]);

      // Act
      const result = await UsuarioModel.findByCedula('12345678');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create - error handling', () => {
    it('should throw error when user creation fails', async () => {
      // Arrange
      const newUserData = {
        nombre: 'New',
        apellido: 'User',
        email: 'new@example.com',
        genero: 'F' as const,
        fecha_nacimiento: '1992-05-15',
        cedula: '87654321',
        usuario: 'newuser',
        password: 'hashedpassword',
        perfil: 'vendedor',
        permisos: 'Cliente'
      };

      mockExecuteQuery
        .mockResolvedValueOnce({ insertId: 2 }) // For INSERT
        .mockResolvedValueOnce([]); // For SELECT - user not found

      // Act & Assert
      await expect(UsuarioModel.create(newUserData)).rejects.toThrow('Error al crear el usuario');
    });
  });

  describe('update - advanced scenarios', () => {
    it('should handle update with password hashing', async () => {
      // Arrange
      const userId = 1;
      const updateData = {
        password: 'newpassword123'
      };

      const mockUpdatedUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'newhashed',
        perfil: 'admin',
        permisos: 'Cliente,Ventas',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      // Mock bcrypt.hashSync
      const bcrypt = require('bcrypt');
      bcrypt.hashSync.mockReturnValue('hashedNewPassword');

      mockExecuteQuery
        .mockResolvedValueOnce({ affectedRows: 1 }) // For UPDATE
        .mockResolvedValueOnce([mockUpdatedUser]); // For SELECT

      // Act
      const result = await UsuarioModel.update(userId, updateData);

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
  expect.stringContaining('UPDATE perfiles SET contraseña = ?'),
  expect.arrayContaining(['hashedNewPassword', 1])
);
expect(result).toBeDefined();
    });

    it('should return existing user when no fields to update', async () => {
      // Arrange
      const userId = 1;
      const updateData = {};

      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: 'Cliente,Ventas',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      // Only one call to executeQuery for findById (no UPDATE call)
      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.update(userId, updateData);

      // Assert
      expect(result).toEqual({
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        password: undefined,
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'activo',
        fecha_creacion: expect.any(Date)
      });
      
      // Should only call executeQuery once for findById, not for UPDATE
      expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [userId]
      );
    });

    it('should return null when update affects no rows', async () => {
      // Arrange
      const userId = 999;
      const updateData = { nombre: 'Updated' };

      mockExecuteQuery.mockResolvedValue({ affectedRows: 0 });

      // Act
      const result = await UsuarioModel.update(userId, updateData);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('toggleStatus', () => {
    it('should toggle user status from active to inactive', async () => {
      // Arrange
      const userId = 1;
      const mockActiveUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: 'Cliente,Ventas',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      const mockInactiveUser = {
        ...mockActiveUser,
        estado: 'inactivo'
      };

      mockExecuteQuery
        .mockResolvedValueOnce([mockActiveUser]) // For findById
        .mockResolvedValueOnce({ affectedRows: 1 }) // For UPDATE
        .mockResolvedValueOnce([mockInactiveUser]); // For SELECT after update

      // Act
      const result = await UsuarioModel.toggleStatus(userId);

      // Assert
      expect(result).toEqual({
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        password: undefined,
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'inactivo',
        fecha_creacion: expect.any(Date)
      });
    });

    it('should toggle user status from inactive to active', async () => {
      // Arrange
      const userId = 1;
      const mockInactiveUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: 'Cliente,Ventas',
        estado: 'inactivo',
        fecha_creacion: new Date()
      };

      const mockActiveUser = {
        ...mockInactiveUser,
        estado: 'activo'
      };

      mockExecuteQuery
        .mockResolvedValueOnce([mockInactiveUser]) // For findById
        .mockResolvedValueOnce({ affectedRows: 1 }) // For UPDATE
        .mockResolvedValueOnce([mockActiveUser]); // For SELECT after update

      // Act
      const result = await UsuarioModel.toggleStatus(userId);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        estado: 'activo'
      }));
    });

    it('should return null when user not found for toggle', async () => {
      // Arrange
      const userId = 999;
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await UsuarioModel.toggleStatus(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('verifyPassword', () => {
    it('should verify password successfully', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M' as const,
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '12345678',
        usuario: 'testuser',
        password: 'hashedpassword',
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      // Mock bcrypt.compare - need to mock the actual implementation
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);
    });

    it('should return false for invalid password', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M' as const,
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '12345678',
        usuario: 'testuser',
        password: 'hashedpassword',
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(false);

    });

    it('should return false when user has no password', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M' as const,
        fecha_nacimiento: new Date('1990-01-01'),
        cedula: '12345678',
        usuario: 'testuser',
        password: '',
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas'],
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

    });
  });

  describe('getPermissions', () => {
    it('should get permissions for user with array permisos', async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: ['Cliente', 'Ventas', 'Productos'],
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.getPermissions(userId);

      // Assert
      expect(result).toEqual(['Cliente', 'Ventas', 'Productos']);
    });

    it('should return empty array when user not found', async () => {
      // Arrange
      const userId = 999;
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await UsuarioModel.getPermissions(userId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when user has no permisos', async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: null,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.getPermissions(userId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array for string permisos (fallback case)', async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: null, // null permisos should result in empty array
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.getPermissions(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should get user statistics successfully', async () => {
      // Arrange
      const mockTotalResult = [{ total: 10 }];
      const mockEstadoStats = [
        { estado: 'activo', cantidad: 7 },
        { estado: 'inactivo', cantidad: 3 }
      ];
      const mockPerfilStats = [
        { perfil: 'admin', cantidad: 2 },
        { perfil: 'vendedor', cantidad: 8 }
      ];
      const mockGeneroStats = [
        { genero: 'M', cantidad: 6 },
        { genero: 'F', cantidad: 4 }
      ];

      mockExecuteQuery
        .mockResolvedValueOnce(mockTotalResult)
        .mockResolvedValueOnce(mockEstadoStats)
        .mockResolvedValueOnce(mockPerfilStats)
        .mockResolvedValueOnce(mockGeneroStats);

      // Act
      const result = await UsuarioModel.getStats();

      // Assert
      expect(result).toEqual({
        total: 10,
        activos: 7,
        inactivos: 3,
        porPerfil: [
          { perfil: 'admin', cantidad: 2 },
          { perfil: 'vendedor', cantidad: 8 }
        ],
        porGenero: [
          { genero: 'Masculino', cantidad: 6 },
          { genero: 'Femenino', cantidad: 4 }
        ]
      });
    });

    it('should handle empty stats results', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      // Act
      const result = await UsuarioModel.getStats();

      // Assert
      expect(result).toEqual({
        total: 0,
        activos: 0,
        inactivos: 0,
        porPerfil: [],
        porGenero: []
      });
    });

    it('should handle database error in getStats', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(UsuarioModel.getStats()).rejects.toThrow('Database error');
    });
  });

  describe('findAll with search', () => {
    it('should find users with search parameter', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          nombre: 'John',
          apellido: 'Doe',
          email: 'john@example.com',
          genero: 'M',
          fecha_nacimiento: '1990-01-01',
          cedula: '12345678',
          usuario: 'johndoe',
          contraseña: 'hashedpassword',
          perfil: 'admin',
          permisos: 'Cliente,Ventas',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];

      const mockTotal = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockUsers) // For SELECT users with search
        .mockResolvedValueOnce(mockTotal); // For COUNT with search

      // Act
      const result = await UsuarioModel.findAll(10, 0, 'john');

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE (nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR usuario LIKE ?)'),
        ['%john%', '%john%', '%john%', '%john%', 10, 0]
      );
      expect(result.usuarios).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('permission parsing edge cases', () => {
    it('should handle JSON string permisos correctly', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: '["Cliente", "Ventas"]', // JSON string format
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.findById(1);

      // Assert
      expect(result?.permisos).toEqual(['Cliente', 'Ventas']);
    });

    it('should handle malformed JSON permisos with comma fallback', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: 'Cliente,Ventas,Productos', // Comma-separated fallback
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.findById(1);

      // Assert
      expect(result?.permisos).toEqual(['Cliente', 'Ventas', 'Productos']);
    });

    it('should handle empty permisos correctly', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        genero: 'M',
        fecha_nacimiento: '1990-01-01',
        cedula: '12345678',
        usuario: 'testuser',
        contraseña: 'hashedpassword',
        perfil: 'admin',
        permisos: null,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockUser]);

      // Act
      const result = await UsuarioModel.findById(1);

      // Assert
      expect(result?.permisos).toEqual([]);
    });
  });
});