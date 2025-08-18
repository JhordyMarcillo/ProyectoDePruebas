import { ReporteModel, ReporteVenta, ReporteProducto, ReporteServicio, ReporteCliente, EstadisticasGenerales } from '../../models/Reporte';
import { executeQuery } from '../../config/database';

// Mock dependencies
jest.mock('../../config/database');

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;

describe('ReporteModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVentasReport', () => {
    it('should get ventas report without date filters', async () => {
      // Arrange
      const mockResult = [
        {
          id: 1,
          fecha: '2024-01-15 10:30:00',
          cliente: 'Juan Pérez',
          cedula_cliente: '1234567890',
          vendedor: 'admin',
          total: '150.50',
          metodo: 'efectivo',
          productos_count: 2,
          servicios_count: 1
        }
      ];

      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ReporteModel.getVentasReport();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        fecha: '2024-01-15 10:30:00',
        cliente: 'Juan Pérez',
        cedula_cliente: '1234567890',
        vendedor: 'admin',
        total: 150.50,
        metodo: 'efectivo',
        productos_count: 2,
        servicios_count: 1
      });

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [50]
      );
    });

    it('should get ventas report with date filters', async () => {
      // Arrange
      const mockResult = [
        {
          id: 1,
          fecha: '2024-01-15 10:30:00',
          cliente: 'Juan Pérez',
          cedula_cliente: '1234567890',
          vendedor: 'admin',
          total: '150.50',
          metodo: 'efectivo',
          productos_count: 2,
          servicios_count: 1
        }
      ];

      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ReporteModel.getVentasReport('2024-01-01', '2024-01-31', 25);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('BETWEEN ? AND ?'),
        ['2024-01-01', '2024-01-31', 25]
      );
    });

    it('should handle cliente not found', async () => {
      // Arrange
      const mockResult = [
        {
          id: 1,
          fecha: '2024-01-15 10:30:00',
          cliente: null,
          cedula_cliente: '1234567890',
          vendedor: 'admin',
          total: '150.50',
          metodo: 'efectivo',
          productos_count: 2,
          servicios_count: 1
        }
      ];

      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ReporteModel.getVentasReport();

      // Assert
      expect(result[0]?.cliente).toBe('Cliente no encontrado');
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ReporteModel.getVentasReport()).rejects.toThrow('Database error');
    });
  });

  describe('getProductosReport', () => {
    it('should get productos report successfully', async () => {
      // Arrange
      const mockResult = [
        {
          id: 1,
          nombre: 'Producto A',
          cantidad: 100,
          cantidad_vendida: 15,
          precio: '25.99',
          precio_compra: '15.50',
          ganancia: '157.35',
          estado: 'activo'
        }
      ];

      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ReporteModel.getProductosReport();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        nombre: 'Producto A',
        cantidad: 100,
        cantidad_vendida: 15,
        precio: 25.99,
        precio_compra: 15.50,
        ganancia: 157.35,
        estado: 'activo'
      });

      expect(mockExecuteQuery).toHaveBeenCalled();
    });

    it('should handle empty result', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ReporteModel.getProductosReport();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(ReporteModel.getProductosReport()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getServiciosReport', () => {
    it('should get servicios report successfully', async () => {
      // Arrange
      const mockResult = [
        {
          id: 1,
          nombre: 'Servicio A',
          veces_vendido: 5,
          total_ganancia: '250.00',
          precio_promedio: '50.00',
          estado: 'activo'
        }
      ];

      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ReporteModel.getServiciosReport();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        nombre: 'Servicio A',
        veces_vendido: 5,
        total_ganancia: 250.00,
        precio_promedio: 50.00,
        estado: 'activo'
      });
    });

    it('should handle empty result', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ReporteModel.getServiciosReport();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ReporteModel.getServiciosReport()).rejects.toThrow('Database error');
    });
  });

  describe('getClientesReport', () => {
    it('should get clientes report successfully', async () => {
      // Arrange
      const mockResult = [
        {
          id: 1,
          nombre: 'Juan',
          apellido: 'Pérez',
          cedula: '1234567890',
          total_compras: 5,
          total_gastado: '750.50',
          ultima_compra: '2024-01-15 10:30:00',
          estado: 'activo'
        }
      ];

      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ReporteModel.getClientesReport();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        total_compras: 5,
        total_gastado: 750.50,
        ultima_compra: '2024-01-15 10:30:00',
        estado: 'activo'
      });
    });

    it('should handle cliente without purchases', async () => {
      // Arrange
      const mockResult = [
        {
          id: 1,
          nombre: 'Juan',
          apellido: 'Pérez',
          cedula: '1234567890',
          total_compras: 0,
          total_gastado: null,
          ultima_compra: null,
          estado: 'activo'
        }
      ];

      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ReporteModel.getClientesReport();

      // Assert
      expect(result[0]?.total_gastado).toBe(0);
      expect(result[0]?.ultima_compra).toBe('Nunca');
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ReporteModel.getClientesReport()).rejects.toThrow('Database error');
    });
  });

  describe('getEstadisticasGenerales', () => {
    it('should get estadisticas generales successfully', async () => {
      // Arrange
      const mockResults = [
        [{ total: 150 }], // ventas totales
        [{ total: 5 }],   // ventas hoy
        [{ total: 25 }],  // ventas mes
        [{ total: 45 }],  // clientes activos
        [{ total: 120 }], // productos activos
        [{ total: 15 }],  // servicios activos
        [{ total: 8 }],   // proveedores activos
        [{ total: 3 }],   // stock bajo
        [{ total: '2500.75' }] // ganancias mes
      ];

      mockExecuteQuery
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1])
        .mockResolvedValueOnce(mockResults[2])
        .mockResolvedValueOnce(mockResults[3])
        .mockResolvedValueOnce(mockResults[4])
        .mockResolvedValueOnce(mockResults[5])
        .mockResolvedValueOnce(mockResults[6])
        .mockResolvedValueOnce(mockResults[7])
        .mockResolvedValueOnce(mockResults[8]);

      // Act
      const result = await ReporteModel.getEstadisticasGenerales();

      // Assert
      expect(result).toEqual({
        ventas_totales: 150,
        ventas_hoy: 5,
        ventas_mes: 25,
        clientes_activos: 45,
        productos_activos: 120,
        servicios_activos: 15,
        proveedores_activos: 8,
        stock_bajo: 3,
        ganancias_mes: 2500.75
      });

      expect(mockExecuteQuery).toHaveBeenCalledTimes(9);
    });

    it('should handle null/undefined results', async () => {
      // Arrange
      const mockResults = [
        [{ total: null }],
        [{ total: undefined }],
        [{ total: 0 }],
        [{ total: null }],
        [{ total: undefined }],
        [{ total: 0 }],
        [{ total: null }],
        [{ total: undefined }],
        [{ total: null }]
      ];

      mockExecuteQuery
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1])
        .mockResolvedValueOnce(mockResults[2])
        .mockResolvedValueOnce(mockResults[3])
        .mockResolvedValueOnce(mockResults[4])
        .mockResolvedValueOnce(mockResults[5])
        .mockResolvedValueOnce(mockResults[6])
        .mockResolvedValueOnce(mockResults[7])
        .mockResolvedValueOnce(mockResults[8]);

      // Act
      const result = await ReporteModel.getEstadisticasGenerales();

      // Assert
      expect(result).toEqual({
        ventas_totales: 0,
        ventas_hoy: 0,
        ventas_mes: 0,
        clientes_activos: 0,
        productos_activos: 0,
        servicios_activos: 0,
        proveedores_activos: 0,
        stock_bajo: 0,
        ganancias_mes: 0
      });
    });

    it('should handle empty query results', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      // Act
      const result = await ReporteModel.getEstadisticasGenerales();

      // Assert
      expect(result).toEqual({
        ventas_totales: 0,
        ventas_hoy: 0,
        ventas_mes: 0,
        clientes_activos: 0,
        productos_activos: 0,
        servicios_activos: 0,
        proveedores_activos: 0,
        stock_bajo: 0,
        ganancias_mes: 0
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(ReporteModel.getEstadisticasGenerales()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getVentasPorFecha', () => {
    it('should get ventas por fecha successfully', async () => {
      // Arrange
      const mockResult = [
        {
          fecha: '2024-01-15',
          total_ventas: '500.75',
          cantidad_ventas: 3
        },
        {
          fecha: '2024-01-16',
          total_ventas: '750.25',
          cantidad_ventas: 5
        }
      ];

      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ReporteModel.getVentasPorFecha('2024-01-15', '2024-01-16');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        fecha: '2024-01-15',
        total_ventas: 500.75,
        cantidad_ventas: 3
      });
      expect(result[1]).toEqual({
        fecha: '2024-01-16',
        total_ventas: 750.25,
        cantidad_ventas: 5
      });

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('BETWEEN ? AND ?'),
        ['2024-01-15', '2024-01-16']
      );
    });

    it('should handle empty date range', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ReporteModel.getVentasPorFecha('2024-01-01', '2024-01-02');

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ReporteModel.getVentasPorFecha('2024-01-01', '2024-01-02')).rejects.toThrow('Database error');
    });
  });
});
