import { Request, Response } from 'express';
import { ClienteController } from '../../controllers/ClienteController';
import { ClienteModel } from '../../models/Cliente';
import { CambioModel } from '../../models/Cambio';
import { Cliente, AuthPayload } from '../../types';

// Mock dependencies
jest.mock('../../models/Cliente');
jest.mock('../../models/Cambio');

const mockClienteModel = ClienteModel as jest.Mocked<typeof ClienteModel>;
const mockCambioModel = CambioModel as jest.Mocked<typeof CambioModel>;

describe('ClienteController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    
    mockRequest = {
      user: { 
        userId: 1, 
        username: 'testuser', 
        perfil: 'admin', 
        permisos: ['clientes'] 
      } as AuthPayload
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
  });

  describe('getAll', () => {
    it('should get all clientes successfully', async () => {
      // Arrange
      const mockClientes: Cliente[] = [
        {
          id: 1,
          nombre: 'Juan',
          apellido: 'Pérez',
          cedula: '1234567890',
          numero: '0998765432',
          email: 'juan@example.com',
          fecha_nacimiento: '1990-01-01',
          genero: 'M',
          locacion: 'Quito',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];

      mockRequest.query = { page: '1', limit: '10' };
      mockClienteModel.findAll.mockResolvedValue({
        clientes: mockClientes,
        total: 1
      });

      // Act
      await ClienteController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.findAll).toHaveBeenCalledWith(10, 0, undefined);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Clientes obtenidos exitosamente',
        data: mockClientes,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });
    });

    it('should handle search parameter', async () => {
      // Arrange
      mockRequest.query = { page: '1', limit: '10', search: 'Juan' };
      mockClienteModel.findAll.mockResolvedValue({
        clientes: [],
        total: 0
      });

      // Act
      await ClienteController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.findAll).toHaveBeenCalledWith(10, 0, 'Juan');
    });

    it('should handle database errors', async () => {
      // Arrange
      mockRequest.query = {};
      mockClienteModel.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await ClienteController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getById', () => {
    it('should get cliente by id successfully', async () => {
      // Arrange
      const mockCliente: Cliente = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockClienteModel.findById.mockResolvedValue(mockCliente);

      // Act
      await ClienteController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.findById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cliente obtenido exitosamente',
        data: mockCliente
      });
    });

    it('should return 400 for invalid id', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await ClienteController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de cliente inválido'
      });
    });

    it('should return 404 when cliente not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockClienteModel.findById.mockResolvedValue(null);

      // Act
      await ClienteController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Cliente no encontrado'
      });
    });
  });

  describe('create', () => {
    it('should create cliente successfully', async () => {
      // Arrange
      const clienteData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M' as const,
        locacion: 'Quito',
        estado: 'activo' as const
      };

      mockRequest.body = clienteData;
      mockClienteModel.findByCedula.mockResolvedValue(null);
      mockClienteModel.create.mockResolvedValue(1);
      
      // Mock the findById call that happens after create
      const createdCliente = {
        id: 1,
        ...clienteData,
        fecha_creacion: new Date()
      };
      mockClienteModel.findById.mockResolvedValue(createdCliente);

      // Act
      await ClienteController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.findByCedula).toHaveBeenCalledWith('1234567890');
      expect(mockClienteModel.create).toHaveBeenCalledWith(clienteData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cliente creado exitosamente',
        data: createdCliente
      });
    });

    it('should return 400 when cedula already exists', async () => {
      // Arrange
      const clienteData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M' as const,
        locacion: 'Quito',
        estado: 'activo' as const
      };

      const existingCliente: Cliente = {
        id: 1,
        ...clienteData,
        fecha_creacion: new Date()
      };

      mockRequest.body = clienteData;
      mockClienteModel.findByCedula.mockResolvedValue(existingCliente);

      // Act
      await ClienteController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Ya existe un cliente con esta cédula'
      });
    });

    it('should handle database errors during create', async () => {
      // Arrange
      const clienteData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M' as const,
        locacion: 'Quito',
        estado: 'activo' as const
      };

      mockRequest.body = clienteData;
      mockClienteModel.findByCedula.mockRejectedValue(new Error('Database error'));

      // Act
      await ClienteController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle error when create fails', async () => {
      // Arrange
      const clienteData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M' as const,
        locacion: 'Quito',
        estado: 'activo' as const
      };

      mockRequest.body = clienteData;
      mockClienteModel.findByCedula.mockResolvedValue(null);
      mockClienteModel.create.mockRejectedValue(new Error('Create failed'));

      // Act
      await ClienteController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('update', () => {
    it('should update cliente successfully', async () => {
      // Arrange
      const updateData = {
        nombre: 'Juan Carlos',
        apellido: 'Pérez',
        email: 'juan.carlos@example.com',
        numero: '0998765432',
        locacion: 'Quito'
      };

      const existingCliente: Cliente = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockClienteModel.findById.mockResolvedValueOnce(existingCliente); // First call to check if exists
      mockClienteModel.update.mockResolvedValue(true);
      
      // Mock the second findById call that happens after update
      const updatedCliente = { ...existingCliente, ...updateData };
      mockClienteModel.findById.mockResolvedValueOnce(updatedCliente);

      // Act
      await ClienteController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.update).toHaveBeenCalledWith(1, updateData);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: updatedCliente
      });
    });

    it('should return 404 when cliente not found for update', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockRequest.body = { nombre: 'Test' };
      mockClienteModel.findById.mockResolvedValue(null);

      // Act
      await ClienteController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Cliente no encontrado'
      });
    });

    it('should return 400 for invalid id in update', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { nombre: 'Test' };

      // Act
      await ClienteController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de cliente inválido'
      });
    });

    it('should return 400 when trying to update cedula to existing one', async () => {
      // Arrange
      const existingCliente: Cliente = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      const otherCliente: Cliente = {
        id: 2,
        nombre: 'María',
        apellido: 'García',
        cedula: '0987654321',
        numero: '0998765433',
        email: 'maria@example.com',
        fecha_nacimiento: '1992-01-01',
        genero: 'F',
        locacion: 'Guayaquil',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { cedula: '0987654321' }; // Trying to update to another client's cedula
      mockClienteModel.findById.mockResolvedValue(existingCliente);
      mockClienteModel.findByCedula.mockResolvedValue(otherCliente);

      // Act
      await ClienteController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Ya existe un cliente con esta cédula'
      });
    });

    it('should handle update with same cedula (no change)', async () => {
      // Arrange
      const existingCliente: Cliente = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { cedula: '1234567890', nombre: 'Juan Carlos' }; // Same cedula
      mockClienteModel.findById.mockResolvedValueOnce(existingCliente);
      mockClienteModel.update.mockResolvedValue(true);
      
      const updatedCliente = { ...existingCliente, nombre: 'Juan Carlos' };
      mockClienteModel.findById.mockResolvedValueOnce(updatedCliente);

      // Act
      await ClienteController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.update).toHaveBeenCalledWith(1, { cedula: '1234567890', nombre: 'Juan Carlos' });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: updatedCliente
      });
    });

    it('should return 400 when update operation fails', async () => {
      // Arrange
      const existingCliente: Cliente = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { nombre: 'Juan Carlos' };
      mockClienteModel.findById.mockResolvedValue(existingCliente);
      mockClienteModel.update.mockResolvedValue(false); // Update fails

      // Act
      await ClienteController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo actualizar el cliente'
      });
    });

    it('should handle database errors during update', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { nombre: 'Test' };
      mockClienteModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await ClienteController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('delete', () => {
    it('should delete cliente successfully', async () => {
      // Arrange
      const existingCliente: Cliente = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockClienteModel.findById.mockResolvedValue(existingCliente);
      mockClienteModel.delete.mockResolvedValue(true);

      // Act
      await ClienteController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.delete).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cliente eliminado exitosamente'
      });
    });

    it('should return 404 when cliente not found for delete', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockClienteModel.findById.mockResolvedValue(null);

      // Act
      await ClienteController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Cliente no encontrado'
      });
    });

    it('should return 400 for invalid id in delete', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await ClienteController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de cliente inválido'
      });
    });

    it('should return 400 when delete operation fails', async () => {
      // Arrange
      const existingCliente: Cliente = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockClienteModel.findById.mockResolvedValue(existingCliente);
      mockClienteModel.delete.mockResolvedValue(false); // Delete fails

      // Act
      await ClienteController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo eliminar el cliente'
      });
    });

    it('should handle database errors during delete', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockClienteModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await ClienteController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getByCedula', () => {
    it('should get cliente by cedula successfully', async () => {
      // Arrange
      const mockCliente: Cliente = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { cedula: '1234567890' };
      mockClienteModel.findByCedula.mockResolvedValue(mockCliente);

      // Act
      await ClienteController.getByCedula(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.findByCedula).toHaveBeenCalledWith('1234567890');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cliente obtenido exitosamente',
        data: mockCliente
      });
    });

    it('should return 400 when cedula is not provided', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await ClienteController.getByCedula(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Cédula es requerida'
      });
    });

    it('should return 404 when cliente not found by cedula', async () => {
      // Arrange
      mockRequest.params = { cedula: '9999999999' };
      mockClienteModel.findByCedula.mockResolvedValue(null);

      // Act
      await ClienteController.getByCedula(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Cliente no encontrado'
      });
    });

    it('should handle database errors during getByCedula', async () => {
      // Arrange
      mockRequest.params = { cedula: '1234567890' };
      mockClienteModel.findByCedula.mockRejectedValue(new Error('Database error'));

      // Act
      await ClienteController.getByCedula(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('toggleStatus', () => {
    it('should toggle cliente status from active to inactive successfully', async () => {
      // Arrange
      const mockCliente: Cliente = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      const updatedCliente = { ...mockCliente, estado: 'inactivo' as const };

      mockRequest.params = { id: '1' };
      mockClienteModel.findById.mockResolvedValueOnce(mockCliente);
      mockClienteModel.update.mockResolvedValue(true);
      mockClienteModel.findById.mockResolvedValueOnce(updatedCliente);

      // Act
      await ClienteController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.update).toHaveBeenCalledWith(1, { estado: 'inactivo' });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cliente desactivado exitosamente',
        data: updatedCliente
      });
    });

    it('should toggle cliente status from inactive to active successfully', async () => {
      // Arrange
      const mockCliente: Cliente = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'inactivo',
        fecha_creacion: new Date()
      };

      const updatedCliente = { ...mockCliente, estado: 'activo' as const };

      mockRequest.params = { id: '1' };
      mockClienteModel.findById.mockResolvedValueOnce(mockCliente);
      mockClienteModel.update.mockResolvedValue(true);
      mockClienteModel.findById.mockResolvedValueOnce(updatedCliente);

      // Act
      await ClienteController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.update).toHaveBeenCalledWith(1, { estado: 'activo' });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cliente activado exitosamente',
        data: updatedCliente
      });
    });

    it('should return 400 for invalid id in toggleStatus', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await ClienteController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de cliente inválido'
      });
    });

    it('should return 404 when cliente not found for toggleStatus', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockClienteModel.findById.mockResolvedValue(null);

      // Act
      await ClienteController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Cliente no encontrado'
      });
    });

    it('should return 400 when toggle status operation fails', async () => {
      // Arrange
      const mockCliente: Cliente = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '0998765432',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockClienteModel.findById.mockResolvedValue(mockCliente);
      mockClienteModel.update.mockResolvedValue(false); // Update fails

      // Act
      await ClienteController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo cambiar el estado del cliente'
      });
    });

    it('should handle database errors during toggleStatus', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockClienteModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await ClienteController.toggleStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getById - additional error scenarios', () => {
    it('should handle database errors during getById', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockClienteModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await ClienteController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getAll - additional scenarios', () => {
    it('should handle default pagination values', async () => {
      // Arrange
      mockRequest.query = {}; // No pagination params
      mockClienteModel.findAll.mockResolvedValue({
        clientes: [],
        total: 0
      });

      // Act
      await ClienteController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.findAll).toHaveBeenCalledWith(10, 0, undefined);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Clientes obtenidos exitosamente',
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });
    });

    it('should handle pagination calculation correctly', async () => {
      // Arrange
      const mockClientes: Cliente[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        nombre: `Cliente${i + 1}`,
        apellido: 'Test',
        cedula: `${1234567890 + i}`,
        numero: '0998765432',
        email: `cliente${i + 1}@example.com`,
        fecha_nacimiento: '1990-01-01',
        genero: 'M' as const,
        locacion: 'Quito',
        estado: 'activo' as const,
        fecha_creacion: new Date()
      }));

      mockRequest.query = { page: '2', limit: '3' };
      mockClienteModel.findAll.mockResolvedValue({
        clientes: mockClientes.slice(3, 5), // Page 2, showing items 4-5
        total: 25 // Total of 25 clients
      });

      // Act
      await ClienteController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockClienteModel.findAll).toHaveBeenCalledWith(3, 3, undefined); // limit=3, offset=3
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Clientes obtenidos exitosamente',
        data: mockClientes.slice(3, 5),
        pagination: {
          page: 2,
          limit: 3,
          total: 25,
          totalPages: 9 // Math.ceil(25/3) = 9
        }
      });
    });
  });
});
