import { Request, Response } from 'express';
import { ProveedorController } from '../../controllers/ProveedorController';
import { ProveedorModel } from '../../models/Proveedor';
import { CambioModel } from '../../models/Cambio';
import { Proveedor, AuthPayload } from '../../types';

// Mock dependencies
jest.mock('../../models/Proveedor');
jest.mock('../../models/Cambio');

const mockProveedorModel = ProveedorModel as jest.Mocked<typeof ProveedorModel>;
const mockCambioModel = CambioModel as jest.Mocked<typeof CambioModel>;

describe('ProveedorController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  beforeEach(() => {
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
        permisos: ['Proveedores'] 
      } as AuthPayload
    };
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all proveedores successfully', async () => {
      // Arrange
      const proveedores: Proveedor[] = [
        {
          id: 1,
          nombre_empresa: 'Proveedor Test',
          numero: '123456789',
          email: 'test@example.com',
          web: 'www.test.com',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];

      mockProveedorModel.findAll.mockResolvedValue({ proveedores, total: 1 });

      // Act
      await ProveedorController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProveedorModel.findAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: proveedores,
          pagination: expect.any(Object)
        })
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      mockProveedorModel.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await ProveedorController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getById', () => {
    it('should get proveedor by id successfully', async () => {
      // Arrange
      const proveedor: Proveedor = {
        id: 1,
        nombre_empresa: 'Proveedor Test',
        numero: '123456789',
        email: 'test@example.com',
        web: 'www.test.com',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockProveedorModel.findById.mockResolvedValue(proveedor);

      // Act
      await ProveedorController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProveedorModel.findById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: proveedor
        })
      );
    });

    it('should return 404 when proveedor not found', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockProveedorModel.findById.mockResolvedValue(null);

      // Act
      await ProveedorController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Proveedor no encontrado'
      });
    });

    it('should handle database errors in getById', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockProveedorModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await ProveedorController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('create', () => {
    it('should create proveedor successfully', async () => {
      // Arrange
      const proveedorData = {
        nombre_empresa: 'Nuevo Proveedor',
        numero: '987654321',
        email: 'nuevo@example.com',
        web: 'www.nuevo.com',
        estado: 'activo'
      };

      mockRequest.body = proveedorData;
      mockProveedorModel.create.mockResolvedValue(1);

      // Act
      await ProveedorController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProveedorModel.create).toHaveBeenCalledWith(proveedorData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Proveedor creado exitosamente',
          data: expect.objectContaining({ id: 1 })
        })
      );
    });

    it('should handle database errors in create', async () => {
      // Arrange
      const proveedorData = {
        nombre_empresa: 'Nuevo Proveedor',
        numero: '987654321',
        email: 'nuevo@example.com',
        web: 'www.nuevo.com',
        estado: 'activo'
      };

      mockRequest.body = proveedorData;
      mockProveedorModel.create.mockRejectedValue(new Error('Database error'));

      // Act
      await ProveedorController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should create proveedor with default values for optional fields', async () => {
      // Arrange
      const minimalProveedorData = {
        nombre_empresa: 'Proveedor Mínimo',
        email: 'minimo@example.com'
      };

      mockRequest.body = minimalProveedorData;
      mockProveedorModel.create.mockResolvedValue(2);

      // Act
      await ProveedorController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProveedorModel.create).toHaveBeenCalledWith({
        nombre_empresa: 'Proveedor Mínimo',
        email: 'minimo@example.com',
        numero: '',
        web: '',
        estado: 'activo'
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Proveedor creado exitosamente',
          data: expect.objectContaining({ id: 2 })
        })
      );
    });
  });

  describe('update', () => {
    it('should update proveedor successfully', async () => {
      // Arrange
      const updateData = {
        nombre_empresa: 'Proveedor Actualizado',
        numero: '111222333',
        email: 'actualizado@example.com',
        web: 'www.actualizado.com'
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockProveedorModel.update.mockResolvedValue(true);

      // Act
      await ProveedorController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProveedorModel.update).toHaveBeenCalledWith(1, updateData);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Proveedor actualizado exitosamente'
        })
      );
    });

    it('should return 404 when proveedor not found for update', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { nombre_empresa: 'Test' };
      mockProveedorModel.update.mockResolvedValue(false);

      // Act
      await ProveedorController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Proveedor no encontrado'
      });
    });

    it('should handle database errors in update', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { nombre_empresa: 'Test' };
      mockProveedorModel.update.mockRejectedValue(new Error('Database error'));

      // Act
      await ProveedorController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should update with only numero field', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { numero: '999888777' };
      mockProveedorModel.update.mockResolvedValue(true);

      // Act
      await ProveedorController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProveedorModel.update).toHaveBeenCalledWith(1, { numero: '999888777' });
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Proveedor actualizado exitosamente'
        })
      );
    });

    it('should update with only web field', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { web: 'www.nuevaweb.com' };
      mockProveedorModel.update.mockResolvedValue(true);

      // Act
      await ProveedorController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProveedorModel.update).toHaveBeenCalledWith(1, { web: 'www.nuevaweb.com' });
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Proveedor actualizado exitosamente'
        })
      );
    });

    it('should update with web as empty string', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { web: '' };
      mockProveedorModel.update.mockResolvedValue(true);

      // Act
      await ProveedorController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProveedorModel.update).toHaveBeenCalledWith(1, { web: '' });
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Proveedor actualizado exitosamente'
        })
      );
    });

    it('should update with only estado field', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { estado: 'inactivo' };
      mockProveedorModel.update.mockResolvedValue(true);

      // Act
      await ProveedorController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProveedorModel.update).toHaveBeenCalledWith(1, { estado: 'inactivo' });
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Proveedor actualizado exitosamente'
        })
      );
    });

    it('should update with only email field', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { email: 'nuevo@email.com' };
      mockProveedorModel.update.mockResolvedValue(true);

      // Act
      await ProveedorController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProveedorModel.update).toHaveBeenCalledWith(1, { email: 'nuevo@email.com' });
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Proveedor actualizado exitosamente'
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete proveedor successfully', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockProveedorModel.delete.mockResolvedValue(true);

      // Act
      await ProveedorController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockProveedorModel.delete).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Proveedor eliminado exitosamente'
        })
      );
    });

    it('should return 404 when proveedor not found for deletion', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockProveedorModel.delete.mockResolvedValue(false);

      // Act
      await ProveedorController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Proveedor no encontrado'
      });
    });

    it('should handle database errors in delete', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockProveedorModel.delete.mockRejectedValue(new Error('Database error'));

      // Act
      await ProveedorController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });
});
