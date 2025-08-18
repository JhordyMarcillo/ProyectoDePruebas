import { Request, Response } from 'express';
import { ReporteController } from '../../controllers/ReporteController';
import { CambioModel, Cambio } from '../../models/Cambio';
import { AuthPayload } from '../../types';

// Mock dependencies
jest.mock('../../models/Cambio');

const mockCambioModel = CambioModel as jest.Mocked<typeof CambioModel>;

describe('ReporteController', () => {
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
    mockCambioModel.findAllWithoutPagination = jest.fn();
    mockCambioModel.findByDateRange = jest.fn();
    mockCambioModel.findByTabla = jest.fn();
    mockCambioModel.getEstadisticas = jest.fn();
  });

  describe('getAllCambios', () => {
    it('should get all cambios without pagination when no page/limit specified', async () => {
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
        },
        {
          id: 2,
          id_cambiado: 2,
          usuario_id: 'admin',
          descripcion: 'Producto actualizado',
          tipo_cambio: 'Actualizar',
          fecha: new Date(),
          tabla_afectada: 'productos'
        }
      ];

      mockRequest.query = {}; // No pagination params
      mockCambioModel.findAllWithoutPagination.mockResolvedValue(mockCambios);

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findAllWithoutPagination).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cambios obtenidos exitosamente',
        data: mockCambios,
        pagination: {
          page: 1,
          limit: 2,
          total: 2,
          totalPages: 1
        }
      });
    });

    it('should get cambios with pagination when page/limit specified', async () => {
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
        total: 50
      };

      mockRequest.query = { page: '2', limit: '10' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findAll).toHaveBeenCalledWith(10, 10, undefined);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cambios obtenidos exitosamente',
        data: mockCambios,
        pagination: {
          page: 2,
          limit: 10,
          total: 50,
          totalPages: 5
        }
      });
    });

    it('should get cambios with search parameter', async () => {
      // Arrange
      const mockResult = { cambios: [], total: 0 };
      mockRequest.query = { page: '1', limit: '10', search: 'usuario' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findAll).toHaveBeenCalledWith(10, 0, 'usuario');
    });

    it('should use default values for page and limit', async () => {
      // Arrange
      const mockResult = { cambios: [], total: 0 };
      mockRequest.query = { page: 'invalid', limit: 'invalid' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findAll).toHaveBeenCalledWith(1000, 0, undefined);
    });

    it('should handle zero page number', async () => {
      // Arrange
      const mockResult = { cambios: [], total: 0 };
      mockRequest.query = { page: '0', limit: '10' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      // parseInt('0') = 0, and 0 || 1 = 1, so page becomes 1, offset = (1 - 1) * 10 = 0
      expect(mockCambioModel.findAll).toHaveBeenCalledWith(10, 0, undefined);
    });

    it('should handle negative page number', async () => {
      // Arrange
      const mockResult = { cambios: [], total: 0 };
      mockRequest.query = { page: '-1', limit: '10' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findAll).toHaveBeenCalledWith(10, -20, undefined);
    });

    it('should handle negative limit number', async () => {
      // Arrange
      const mockResult = { cambios: [], total: 0 };
      mockRequest.query = { page: '1', limit: '-5' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      // parseInt('-5') = -5, and -5 || 1000 = -5 (negative numbers are truthy), so limit = -5, offset = (1-1) * -5 = 0 or -0
      expect(mockCambioModel.findAll).toHaveBeenCalledWith(-5, expect.any(Number), undefined);
    });

    it('should handle very large page numbers', async () => {
      // Arrange
      const mockResult = { cambios: [], total: 100 };
      mockRequest.query = { page: '999999', limit: '10' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findAll).toHaveBeenCalledWith(10, 9999980, undefined);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cambios obtenidos exitosamente',
        data: [],
        pagination: {
          page: 999999,
          limit: 10,
          total: 100,
          totalPages: 10
        }
      });
    });

    it('should handle empty search string', async () => {
      // Arrange
      const mockResult = { cambios: [], total: 0 };
      mockRequest.query = { page: '1', limit: '10', search: '' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findAll).toHaveBeenCalledWith(10, 0, '');
    });

    it('should calculate totalPages correctly with fractional result', async () => {
      // Arrange
      const mockResult = { cambios: [], total: 33 };
      mockRequest.query = { page: '1', limit: '10' };
      mockCambioModel.findAll.mockResolvedValue(mockResult);

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cambios obtenidos exitosamente',
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 33,
          totalPages: 4 // Math.ceil(33/10) = 4
        }
      });
    });

    it('should handle errors in getAllCambios', async () => {
      // Arrange
      mockRequest.query = { page: '1' };
      mockCambioModel.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle errors when fetching all cambios without pagination', async () => {
      // Arrange
      mockRequest.query = {}; // No pagination
      mockCambioModel.findAllWithoutPagination.mockRejectedValue(new Error('Database error'));

      // Act
      await ReporteController.getAllCambios(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getCambiosPorFecha', () => {
    it('should get cambios by date range successfully', async () => {
      // Arrange
      const mockCambios: Cambio[] = [
        {
          id: 1,
          id_cambiado: 1,
          usuario_id: 'admin',
          descripcion: 'Usuario creado',
          tipo_cambio: 'Agregar',
          fecha: new Date('2023-01-15'),
          tabla_afectada: 'usuarios'
        }
      ];

      mockRequest.query = {
        fechaInicio: '2023-01-01',
        fechaFin: '2023-01-31'
      };
      mockCambioModel.findByDateRange.mockResolvedValue(mockCambios);

      // Act
      await ReporteController.getCambiosPorFecha(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findByDateRange).toHaveBeenCalledWith('2023-01-01', '2023-01-31');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cambios por fecha obtenidos exitosamente',
        data: mockCambios
      });
    });

    it('should return 400 when fechaInicio is missing', async () => {
      // Arrange
      mockRequest.query = { fechaFin: '2023-01-31' };

      // Act
      await ReporteController.getCambiosPorFecha(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin'
      });
    });

    it('should return 400 when fechaFin is missing', async () => {
      // Arrange
      mockRequest.query = { fechaInicio: '2023-01-01' };

      // Act
      await ReporteController.getCambiosPorFecha(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin'
      });
    });

    it('should return 400 when both dates are missing', async () => {
      // Arrange
      mockRequest.query = {};

      // Act
      await ReporteController.getCambiosPorFecha(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin'
      });
    });

    it('should return 400 when fechaInicio is empty string', async () => {
      // Arrange
      mockRequest.query = { fechaInicio: '', fechaFin: '2023-01-31' };

      // Act
      await ReporteController.getCambiosPorFecha(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin'
      });
    });

    it('should return 400 when fechaFin is empty string', async () => {
      // Arrange
      mockRequest.query = { fechaInicio: '2023-01-01', fechaFin: '' };

      // Act
      await ReporteController.getCambiosPorFecha(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin'
      });
    });

    it('should return 400 when fechaInicio is null', async () => {
      // Arrange
      mockRequest.query = { fechaInicio: null as any, fechaFin: '2023-01-31' };

      // Act
      await ReporteController.getCambiosPorFecha(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin'
      });
    });

    it('should return 400 when fechaFin is undefined', async () => {
      // Arrange
      mockRequest.query = { fechaInicio: '2023-01-01', fechaFin: undefined };

      // Act
      await ReporteController.getCambiosPorFecha(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin'
      });
    });

    it('should handle same date for both fechaInicio and fechaFin', async () => {
      // Arrange
      const mockCambios: Cambio[] = [];
      mockRequest.query = {
        fechaInicio: '2023-01-15',
        fechaFin: '2023-01-15'
      };
      mockCambioModel.findByDateRange.mockResolvedValue(mockCambios);

      // Act
      await ReporteController.getCambiosPorFecha(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findByDateRange).toHaveBeenCalledWith('2023-01-15', '2023-01-15');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cambios por fecha obtenidos exitosamente',
        data: mockCambios
      });
    });

    it('should handle invalid date formats', async () => {
      // Arrange
      const mockCambios: Cambio[] = [];
      mockRequest.query = {
        fechaInicio: 'invalid-date',
        fechaFin: 'another-invalid-date'
      };
      mockCambioModel.findByDateRange.mockResolvedValue(mockCambios);

      // Act
      await ReporteController.getCambiosPorFecha(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findByDateRange).toHaveBeenCalledWith('invalid-date', 'another-invalid-date');
    });

    it('should handle errors in getCambiosPorFecha', async () => {
      // Arrange
      mockRequest.query = {
        fechaInicio: '2023-01-01',
        fechaFin: '2023-01-31'
      };
      mockCambioModel.findByDateRange.mockRejectedValue(new Error('Database error'));

      // Act
      await ReporteController.getCambiosPorFecha(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getCambiosPorTabla', () => {
    it('should get cambios by tabla successfully', async () => {
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
      await ReporteController.getCambiosPorTabla(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findByTabla).toHaveBeenCalledWith('usuarios');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Cambios de la tabla usuarios obtenidos exitosamente',
        data: mockCambios
      });
    });

    it('should return 400 when tabla parameter is missing', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await ReporteController.getCambiosPorTabla(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Se requiere especificar la tabla'
      });
    });

    it('should handle empty tabla parameter', async () => {
      // Arrange
      mockRequest.params = { tabla: '' };

      // Act
      await ReporteController.getCambiosPorTabla(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Se requiere especificar la tabla'
      });
    });

    it('should handle null tabla parameter', async () => {
      // Arrange
      mockRequest.params = { tabla: null as any };

      // Act
      await ReporteController.getCambiosPorTabla(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Se requiere especificar la tabla'
      });
    });

    it('should handle undefined tabla parameter', async () => {
      // Arrange
      mockRequest.params = { tabla: undefined as any };

      // Act
      await ReporteController.getCambiosPorTabla(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Se requiere especificar la tabla'
      });
    });

    it('should handle whitespace-only tabla parameter', async () => {
      // Arrange
      mockRequest.params = { tabla: '   ' };

      // Act
      await ReporteController.getCambiosPorTabla(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.findByTabla).toHaveBeenCalledWith('   ');
    });

    it('should handle errors in getCambiosPorTabla', async () => {
      // Arrange
      mockRequest.params = { tabla: 'usuarios' };
      mockCambioModel.findByTabla.mockRejectedValue(new Error('Database error'));

      // Act
      await ReporteController.getCambiosPorTabla(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getEstadisticas', () => {
    it('should get estadisticas successfully', async () => {
      // Arrange
      const mockEstadisticas = {
        cambiosPorTabla: [
          { tabla_afectada: 'usuarios', total: 50 },
          { tabla_afectada: 'productos', total: 30 }
        ],
        cambiosPorTipo: [
          { tipo_cambio: 'Agregar', total: 40 },
          { tipo_cambio: 'Actualizar', total: 35 }
        ],
        cambiosPorDia: [
          { fecha: '2023-01-15', total: 10 },
          { fecha: '2023-01-14', total: 8 }
        ],
        totalCambios: 100,
        cambiosHoy: 5
      };

      mockCambioModel.getEstadisticas.mockResolvedValue(mockEstadisticas);

      // Act
      await ReporteController.getEstadisticas(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCambioModel.getEstadisticas).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: mockEstadisticas
      });
    });

    it('should handle errors in getEstadisticas', async () => {
      // Arrange
      mockCambioModel.getEstadisticas.mockRejectedValue(new Error('Database error'));

      // Act
      await ReporteController.getEstadisticas(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle empty estadisticas result', async () => {
      // Arrange
      const emptyEstadisticas = {
        cambiosPorTabla: [],
        cambiosPorTipo: [],
        cambiosPorDia: [],
        totalCambios: 0,
        cambiosHoy: 0
      };

      mockCambioModel.getEstadisticas.mockResolvedValue(emptyEstadisticas);

      // Act
      await ReporteController.getEstadisticas(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: emptyEstadisticas
      });
    });

    it('should handle null estadisticas result', async () => {
      // Arrange
      mockCambioModel.getEstadisticas.mockResolvedValue(null as any);

      // Act
      await ReporteController.getEstadisticas(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: null
      });
    });

    it('should handle undefined estadisticas result', async () => {
      // Arrange
      mockCambioModel.getEstadisticas.mockResolvedValue(undefined as any);

      // Act
      await ReporteController.getEstadisticas(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: undefined
      });
    });

    it('should handle estadisticas with partial data', async () => {
      // Arrange
      const partialEstadisticas = {
        cambiosPorTabla: [{ tabla_afectada: 'usuarios', total: 1 }],
        cambiosPorTipo: [],
        cambiosPorDia: [{ fecha: '2023-01-15', total: 1 }],
        totalCambios: 1,
        cambiosHoy: 1
      };

      mockCambioModel.getEstadisticas.mockResolvedValue(partialEstadisticas);

      // Act
      await ReporteController.getEstadisticas(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: partialEstadisticas
      });
    });

    it('should handle very large estadisticas numbers', async () => {
      // Arrange
      const largeEstadisticas = {
        cambiosPorTabla: [
          { tabla_afectada: 'usuarios', total: 999999999 },
          { tabla_afectada: 'productos', total: 888888888 }
        ],
        cambiosPorTipo: [
          { tipo_cambio: 'Agregar', total: 777777777 },
          { tipo_cambio: 'Actualizar', total: 666666666 }
        ],
        cambiosPorDia: [
          { fecha: '2023-01-15', total: 555555555 }
        ],
        totalCambios: 999999999,
        cambiosHoy: 123456789
      };

      mockCambioModel.getEstadisticas.mockResolvedValue(largeEstadisticas);

      // Act
      await ReporteController.getEstadisticas(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: largeEstadisticas
      });
    });

    it('should handle network timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';
      mockCambioModel.getEstadisticas.mockRejectedValue(timeoutError);

      // Act
      await ReporteController.getEstadisticas(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle database connection errors', async () => {
      // Arrange
      const dbError = new Error('ECONNREFUSED: Connection refused');
      mockCambioModel.getEstadisticas.mockRejectedValue(dbError);

      // Act
      await ReporteController.getEstadisticas(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });
});
