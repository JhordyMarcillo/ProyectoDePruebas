import { Request, Response } from 'express';
import { CambioController } from '../../controllers/CambioController';
import { CambioModel, Cambio } from '../../models/Cambio';
import { AuthPayload } from '../../types';

// Mock dependencies
jest.mock('../../models/Cambio');

const mockCambioModel = CambioModel as jest.Mocked<typeof CambioModel>;

describe('CambioController', () => {
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
        permisos: ['Reportes'] 
      } as AuthPayload
    };
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    // Setup default mocks
    mockCambioModel.findAll = jest.fn();
    mockCambioModel.findById = jest.fn();
    mockCambioModel.findByTabla = jest.fn();
    mockCambioModel.findByUsuario = jest.fn();
    mockCambioModel.getStats = jest.fn();
    mockCambioModel.registrarCambio = jest.fn();
  });

  describe('getAll', () => {
    it('should get all cambios successfully with pagination', async () => {
      // Arrange
      const mockCambios: Cambio[] = [
        {
          id: 1,
          id_cambiado: 1,
          usuario_id: 'admin',
          descripcion: 'Usuario creado',
          tipo_cambio: 'Agregar',
          fecha: new Date(),
          tabla_afectada: 'usuarios'
        }
      ];

      const mockResult = {
        cambios: mockCambios,
        total: 1
      };

      mockRequest.query = { page: '1', limit: '10' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await CambioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findAll).toHaveBeenCalledWith(10, 0, undefined, undefined);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cambios obtenidos exitosamente',
        data: mockCambios,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });
    });

    it('should get all cambios with search filter', async () => {
      // Arrange
      const mockResult = { cambios: [], total: 0 };
      mockRequest.query = { search: 'usuario' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await CambioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findAll).toHaveBeenCalledWith(10, 0, 'usuario', undefined);
    });

    it('should get all cambios with tabla filter', async () => {
      // Arrange
      const mockResult = { cambios: [], total: 0 };
      mockRequest.query = { tabla: 'usuarios' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await CambioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findAll).toHaveBeenCalledWith(10, 0, undefined, 'usuarios');
    });

    it('should handle errors in getAll', async () => {
      // Arrange
      mockCambioModel.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await CambioController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getById', () => {
    it('should get cambio by id successfully', async () => {
      // Arrange
      const mockCambio: Cambio = {
        id: 1,
        id_cambiado: 1,
        usuario_id: 'admin',
        descripcion: 'Usuario creado',
        tipo_cambio: 'Agregar',
        fecha: new Date(),
        tabla_afectada: 'usuarios'
      };

      mockRequest.params = { id: '1' };
      mockCambioModel.findById.mockResolvedValue(mockCambio);

      // Act
      await CambioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cambio obtenido exitosamente',
        data: mockCambio
      });
    });

    it('should return 404 when cambio not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockCambioModel.findById.mockResolvedValue(null);

      // Act
      await CambioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Cambio no encontrado'
      });
    });

    it('should handle invalid id parameter', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await CambioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de cambio inválido'
      });
    });

    it('should handle errors in getById', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockCambioModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await CambioController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getByTabla', () => {
    it('should find cambios by tabla successfully', async () => {
      // Arrange
      const mockCambios: Cambio[] = [
        {
          id: 1,
          id_cambiado: 1,
          usuario_id: 'admin',
          descripcion: 'Usuario creado',
          tipo_cambio: 'Agregar',
          fecha: new Date(),
          tabla_afectada: 'usuarios'
        }
      ];

      mockRequest.params = { tabla: 'usuarios' };
      mockCambioModel.findByTabla.mockResolvedValue(mockCambios);

      // Act
      await CambioController.getByTabla(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findByTabla).toHaveBeenCalledWith('usuarios');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cambios de la tabla obtenidos exitosamente',
        data: mockCambios
      });
    });

    it('should handle empty tabla parameter', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await CambioController.getByTabla(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Nombre de tabla es requerido'
      });
    });

    it('should handle errors in getByTabla', async () => {
      // Arrange
      mockRequest.params = { tabla: 'usuarios' };
      mockCambioModel.findByTabla.mockRejectedValue(new Error('Database error'));

      // Act
      await CambioController.getByTabla(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getByUsuario', () => {
    it('should find cambios by usuario successfully', async () => {
      // Arrange
      const mockCambios: Cambio[] = [
        {
          id: 1,
          id_cambiado: 1,
          usuario_id: 'admin',
          descripcion: 'Usuario creado',
          tipo_cambio: 'Agregar',
          fecha: new Date(),
          tabla_afectada: 'usuarios'
        }
      ];

      mockRequest.params = { usuario_id: 'admin' };
      mockRequest.query = { limit: '5' };
      mockCambioModel.findByUsuario.mockResolvedValue(mockCambios);

      // Act
      await CambioController.getByUsuario(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findByUsuario).toHaveBeenCalledWith('admin', 5);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cambios del usuario obtenidos exitosamente',
        data: mockCambios
      });
    });

    it('should handle empty usuario_id parameter', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await CambioController.getByUsuario(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de usuario es requerido'
      });
    });

    it('should handle errors in getByUsuario', async () => {
      // Arrange
      mockRequest.params = { usuario_id: 'admin' };
      mockCambioModel.findByUsuario.mockRejectedValue(new Error('Database error'));

      // Act
      await CambioController.getByUsuario(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getStats', () => {
    it('should get statistics successfully', async () => {
      // Arrange
      const mockStats = {
        total_cambios: 100,
        cambios_hoy: 5,
        cambios_semana: 25,
        por_tipo: {
          'Agregar': 40,
          'Actualizar': 35,
          'Activo': 15,
          'Inactivo': 10
        },
        por_tabla: {
          'usuarios': 50,
          'productos': 30,
          'clientes': 20
        }
      };

      mockCambioModel.getStats.mockResolvedValue(mockStats);

      // Act
      await CambioController.getStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.getStats).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estadísticas de cambios obtenidas exitosamente',
        data: mockStats
      });
    });

    it('should handle errors in getStats', async () => {
      // Arrange
      mockCambioModel.getStats.mockRejectedValue(new Error('Database error'));

      // Act
      await CambioController.getStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });
});
