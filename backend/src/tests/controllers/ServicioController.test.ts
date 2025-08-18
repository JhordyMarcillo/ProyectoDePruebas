import { Request, Response } from 'express';
import { ServicioController } from '../../controllers/ServicioController';
import { ServicioModel } from '../../models/Servicio';
import { CambioModel } from '../../models/Cambio';
import { Servicio, AuthPayload } from '../../types';

// Mock dependencies
jest.mock('../../models/Servicio');
jest.mock('../../models/Cambio');

const mockServicioModel = ServicioModel as jest.Mocked<typeof ServicioModel>;
const mockCambioModel = CambioModel as jest.Mocked<typeof CambioModel>;

describe('ServicioController', () => {
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
        permisos: ['Servicios'] 
      } as AuthPayload
    };
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
  });

  describe('getAll', () => {
    it('should get all servicios successfully', async () => {
      // Arrange
      const servicios: Servicio[] = [
        {
          id: 1,
          nombre: 'Reparación iPhone',
          descripcion: 'Reparación completa',
          coste_total: 100,
          costo_servicio: 80,
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];

      mockRequest.query = { page: '1', limit: '10' };
      mockServicioModel.findAll.mockResolvedValue({
        servicios,
        total: 1
      });

      // Act
      await ServicioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.findAll).toHaveBeenCalledWith(10, 0, undefined);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Servicios obtenidos exitosamente',
        data: servicios,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });
    });

    it('should handle database errors in getAll', async () => {
      // Arrange
      mockRequest.query = {};
      mockServicioModel.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await ServicioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle missing query parameters with defaults', async () => {
      // Arrange
      mockRequest.query = {};
      mockServicioModel.findAll.mockResolvedValue({
        servicios: [],
        total: 0
      });

      // Act
      await ServicioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.findAll).toHaveBeenCalledWith(10, 0, undefined);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Servicios obtenidos exitosamente',
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });
    });

    it('should handle search parameter', async () => {
      // Arrange
      mockRequest.query = { page: '1', limit: '10', search: 'reparación' };
      mockServicioModel.findAll.mockResolvedValue({
        servicios: [],
        total: 0
      });

      // Act
      await ServicioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.findAll).toHaveBeenCalledWith(10, 0, 'reparación');
    });

    it('should handle invalid page parameter', async () => {
      // Arrange
      mockRequest.query = { page: 'invalid', limit: '10' };
      mockServicioModel.findAll.mockResolvedValue({
        servicios: [],
        total: 0
      });

      // Act
      await ServicioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.findAll).toHaveBeenCalledWith(10, 0, undefined);
    });

    it('should handle invalid limit parameter', async () => {
      // Arrange
      mockRequest.query = { page: '1', limit: 'invalid' };
      mockServicioModel.findAll.mockResolvedValue({
        servicios: [],
        total: 0
      });

      // Act
      await ServicioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.findAll).toHaveBeenCalledWith(10, 0, undefined);
    });
  });

  describe('getById', () => {
    it('should get servicio by id successfully', async () => {
      // Arrange
      const servicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockServicioModel.findById.mockResolvedValue(servicio);

      // Act
      await ServicioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.findById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Servicio obtenido exitosamente',
        data: servicio
      });
    });

    it('should return 404 when servicio not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockServicioModel.findById.mockResolvedValue(null);

      // Act
      await ServicioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Servicio no encontrado'
      });
    });

    it('should return 400 for invalid servicio id', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await ServicioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de servicio inválido'
      });
    });

    it('should handle database errors during getById', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockServicioModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await ServicioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle zero id parameter', async () => {
      // Arrange
      mockRequest.params = { id: '0' };

      // Act
      await ServicioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('create', () => {
    it('should create servicio successfully', async () => {
      // Arrange
      const servicioData = {
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo' as const
      };

      const newServicio = { 
        id: 1, 
        ...servicioData,
        fecha_creacion: new Date()
      };

      mockRequest.body = servicioData;
      mockServicioModel.create.mockResolvedValue(1);
      mockServicioModel.findById.mockResolvedValue(newServicio);

      // Act
      await ServicioController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.create).toHaveBeenCalledWith(servicioData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: newServicio
        })
      );
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      const servicioData = {
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo' as const
      };

      mockRequest.body = servicioData;
      mockServicioModel.create.mockRejectedValue(new Error('Database error'));

      // Act
      await ServicioController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle case when created servicio cannot be retrieved', async () => {
      // Arrange
      const servicioData = {
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo' as const
      };

      mockRequest.body = servicioData;
      mockServicioModel.create.mockResolvedValue(1);
      mockServicioModel.findById.mockResolvedValue(null);

      // Act
      await ServicioController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Servicio creado exitosamente',
        data: null
      });
    });

    it('should create servicio with minimal data', async () => {
      // Arrange
      const servicioData = {
        nombre: 'Servicio Básico',
        coste_total: 50,
        costo_servicio: 40,
        estado: 'activo' as const
      };

      const newServicio = { 
        id: 1, 
        ...servicioData,
        fecha_creacion: new Date()
      };

      mockRequest.body = servicioData;
      mockServicioModel.create.mockResolvedValue(1);
      mockServicioModel.findById.mockResolvedValue(newServicio);

      // Act
      await ServicioController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.create).toHaveBeenCalledWith(servicioData);
      expect(mockStatus).toHaveBeenCalledWith(201);
    });
  });

  describe('update', () => {
    it('should update servicio successfully', async () => {
      // Arrange
      const updateData = {
        nombre: 'Reparación iPhone Pro',
        coste_total: 150
      };

      const existingServicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockServicioModel.findById.mockResolvedValueOnce(existingServicio)
        .mockResolvedValueOnce({...existingServicio, ...updateData});
      mockServicioModel.update.mockResolvedValue(true);

      // Act
      await ServicioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.update).toHaveBeenCalledWith(1, updateData);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Servicio actualizado exitosamente',
        data: {...existingServicio, ...updateData}
      });
    });

    it('should return 404 when servicio not found for update', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockRequest.body = { nombre: 'Test' };
      mockServicioModel.findById.mockResolvedValue(null);

      // Act
      await ServicioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Servicio no encontrado'
      });
    });

    it('should return 400 for invalid servicio id in update', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { nombre: 'Test' };

      // Act
      await ServicioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de servicio inválido'
      });
    });

    it('should handle database errors during update', async () => {
      // Arrange
      const existingServicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { nombre: 'Updated Service' };
      mockServicioModel.findById.mockResolvedValue(existingServicio);
      mockServicioModel.update.mockRejectedValue(new Error('Database error'));

      // Act
      await ServicioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should update servicio estado to inactive', async () => {
      // Arrange
      const updateData = {
        estado: 'inactivo' as const
      };

      const existingServicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      const updatedServicio = {...existingServicio, estado: 'inactivo' as const};

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockServicioModel.findById.mockResolvedValueOnce(existingServicio)
        .mockResolvedValueOnce(updatedServicio);
      mockServicioModel.update.mockResolvedValue(true);

      // Act
      await ServicioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.update).toHaveBeenCalledWith(1, updateData);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Servicio actualizado exitosamente',
        data: updatedServicio
      });
    });

    it('should update multiple servicio fields', async () => {
      // Arrange
      const updateData = {
        nombre: 'Servicio Actualizado',
        descripcion: 'Nueva descripción',
        coste_total: 200,
        costo_servicio: 160
      };

      const existingServicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockServicioModel.findById.mockResolvedValue(existingServicio);
      mockServicioModel.update.mockResolvedValue(true);

      // Act
      await ServicioController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('delete', () => {
    it('should delete servicio successfully', async () => {
      // Arrange
      const existingServicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockServicioModel.findById.mockResolvedValue(existingServicio);
      mockServicioModel.delete.mockResolvedValue(true);

      // Act
      await ServicioController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.delete).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Servicio eliminado exitosamente'
      });
    });

    it('should return 404 when servicio not found for delete', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockServicioModel.findById.mockResolvedValue(null);

      // Act
      await ServicioController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Servicio no encontrado'
      });
    });

    it('should return 400 for invalid servicio id in delete', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await ServicioController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de servicio inválido'
      });
    });

    it('should handle database errors during delete', async () => {
      // Arrange
      const existingServicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockServicioModel.findById.mockResolvedValue(existingServicio);
      mockServicioModel.delete.mockRejectedValue(new Error('Database error'));

      // Act
      await ServicioController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle case when delete operation returns false', async () => {
      // Arrange
      const existingServicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockServicioModel.findById.mockResolvedValue(existingServicio);
      mockServicioModel.delete.mockResolvedValue(false);

      // Act
      await ServicioController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo eliminar el servicio'
      });
    });
  });

  describe('getActivos', () => {
    it('should get active servicios successfully', async () => {
      // Arrange
      const activosServicios: Servicio[] = [
        {
          id: 1,
          nombre: 'Reparación iPhone',
          descripcion: 'Reparación completa',
          coste_total: 100,
          costo_servicio: 80,
          estado: 'activo',
          fecha_creacion: new Date()
        },
        {
          id: 2,
          nombre: 'Mantenimiento PC',
          descripcion: 'Mantenimiento completo',
          coste_total: 150,
          costo_servicio: 120,
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];

      mockServicioModel.findActivos.mockResolvedValue(activosServicios);

      // Act
      await ServicioController.getActivos(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.findActivos).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Servicios activos obtenidos exitosamente',
        data: activosServicios
      });
    });

    it('should return empty array when no active servicios found', async () => {
      // Arrange
      mockServicioModel.findActivos.mockResolvedValue([]);

      // Act
      await ServicioController.getActivos(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.findActivos).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Servicios activos obtenidos exitosamente',
        data: []
      });
    });

    it('should handle database errors in getActivos', async () => {
      // Arrange
      mockServicioModel.findActivos.mockRejectedValue(new Error('Database error'));

      // Act
      await ServicioController.getActivos(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('toggleEstado', () => {
    it('should toggle servicio estado to activo successfully', async () => {
      // Arrange
      const existingServicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'inactivo',
        fecha_creacion: new Date()
      };

      const updatedServicio: Servicio = {
        ...existingServicio,
        estado: 'activo'
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { estado: 'activo' };
      
      mockServicioModel.findById.mockResolvedValueOnce(existingServicio);
      mockServicioModel.update.mockResolvedValue(true);
      mockServicioModel.findById.mockResolvedValueOnce(updatedServicio);

      // Act
      await ServicioController.toggleEstado(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.findById).toHaveBeenCalledWith(1);
      expect(mockServicioModel.update).toHaveBeenCalledWith(1, { estado: 'activo' });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Servicio activado exitosamente',
        data: updatedServicio
      });
    });

    it('should toggle servicio estado to inactivo successfully', async () => {
      // Arrange
      const existingServicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      const updatedServicio: Servicio = {
        ...existingServicio,
        estado: 'inactivo'
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { estado: 'inactivo' };
      
      mockServicioModel.findById.mockResolvedValueOnce(existingServicio);
      mockServicioModel.update.mockResolvedValue(true);
      mockServicioModel.findById.mockResolvedValueOnce(updatedServicio);

      // Act
      await ServicioController.toggleEstado(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockServicioModel.findById).toHaveBeenCalledWith(1);
      expect(mockServicioModel.update).toHaveBeenCalledWith(1, { estado: 'inactivo' });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Servicio desactivado exitosamente',
        data: updatedServicio
      });
    });

    it('should return 400 for invalid id in toggleEstado', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid-id' };
      mockRequest.body = { estado: 'activo' };

      // Act
      await ServicioController.toggleEstado(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de servicio inválido'
      });
    });

    it('should return 400 for invalid estado in toggleEstado', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { estado: 'invalid-estado' };

      // Act
      await ServicioController.toggleEstado(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Estado inválido. Debe ser "activo" o "inactivo"'
      });
    });

    it('should return 400 for missing estado in toggleEstado', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = {}; // Missing estado

      // Act
      await ServicioController.toggleEstado(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Estado inválido. Debe ser "activo" o "inactivo"'
      });
    });

    it('should return 404 when servicio not found for toggleEstado', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockRequest.body = { estado: 'activo' };
      
      mockServicioModel.findById.mockResolvedValue(null);

      // Act
      await ServicioController.toggleEstado(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Servicio no encontrado'
      });
    });

    it('should return 400 when update operation fails in toggleEstado', async () => {
      // Arrange
      const existingServicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'inactivo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { estado: 'activo' };
      
      mockServicioModel.findById.mockResolvedValue(existingServicio);
      mockServicioModel.update.mockResolvedValue(false); // Update fails

      // Act
      await ServicioController.toggleEstado(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo actualizar el estado del servicio'
      });
    });

    it('should handle database errors during toggleEstado', async () => {
      // Arrange
      const existingServicio: Servicio = {
        id: 1,
        nombre: 'Reparación iPhone',
        descripcion: 'Reparación completa',
        coste_total: 100,
        costo_servicio: 80,
        estado: 'inactivo',
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { estado: 'activo' };
      
      mockServicioModel.findById.mockResolvedValueOnce(existingServicio);
      mockServicioModel.update.mockRejectedValue(new Error('Database error'));

      // Act
      await ServicioController.toggleEstado(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });
});
