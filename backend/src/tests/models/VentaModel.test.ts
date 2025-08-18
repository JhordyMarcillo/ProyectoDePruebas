import { VentaModel } from '../../models/Venta';
import { executeQuery } from '../../config/database';
import { Venta } from '../../types';

// Mock de la función executeQuery
jest.mock('../../config/database', () => ({
  executeQuery: jest.fn()
}));

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;

describe('VentaModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock data
  const mockVentaRow = {
    id: 1,
    cedula_cliente: '1234567890',
    productos: '[{"id":1,"nombre":"Producto 1","precio":100,"cantidad":2}]',
    servicios: '[{"id":1,"nombre":"Servicio 1","precio":50,"cantidad":1}]',
    iva: 21.0,
    total_pagar: 250.0,
    metodo: 'efectivo',
    vendedor: 'vendedor1',
    estado: 'activo',
    fecha_creacion: new Date('2023-12-01')
  };

  const mockVenta: Venta = {
    id: 1,
    cedula_cliente: '1234567890',
    productos: [{ id: 1, nombre: 'Producto 1', precio: 100, cantidad: 2 }],
    servicios: [{ id: 1, nombre: 'Servicio 1', precio: 50, cantidad: 1 }],
    iva: 21.0,
    total_pagar: 250.0,
    metodo: 'efectivo',
    vendedor: 'vendedor1',
    estado: 'activo',
    fecha_creacion: new Date('2023-12-01')
  };

  describe('findAll', () => {
    it('should find all ventas successfully', async () => {
      const mockTotalResult = [{ total: 1 }];
      mockExecuteQuery
        .mockResolvedValueOnce([mockVentaRow])
        .mockResolvedValueOnce(mockTotalResult);

      const result = await VentaModel.findAll();

      expect(result.ventas).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.ventas[0]).toMatchObject({
        id: 1,
        cedula_cliente: '1234567890',
        productos: [{ id: 1, nombre: 'Producto 1', precio: 100, cantidad: 2 }],
        metodo: 'efectivo'
      });
    });

    it('should handle custom limit and offset', async () => {
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }]);

      await VentaModel.findAll(50, 10);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ? OFFSET ?'),
        [50, 10]
      );
    });

    it('should handle search parameter', async () => {
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }]);

      await VentaModel.findAll(100, 0, 'test');

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE (cedula_cliente LIKE ? OR vendedor LIKE ? OR metodo LIKE ?)'),
        ['%test%', '%test%', '%test%', 100, 0]
      );
    });

    it('should handle empty results', async () => {
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await VentaModel.findAll();

      expect(result.ventas).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle database errors', async () => {
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(VentaModel.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should find venta by id successfully', async () => {
      mockExecuteQuery.mockResolvedValueOnce([mockVentaRow]);

      const result = await VentaModel.findById(1);

      expect(result).toMatchObject({
        id: 1,
        cedula_cliente: '1234567890',
        metodo: 'efectivo'
      });
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        [1]
      );
    });

    it('should return null when venta not found', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);

      const result = await VentaModel.findById(999);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(VentaModel.findById(1)).rejects.toThrow('Database error');
    });
  });

  describe('findByCliente', () => {
    it('should find ventas by cliente successfully', async () => {
      mockExecuteQuery.mockResolvedValueOnce([mockVentaRow]);

      const result = await VentaModel.findByCliente('1234567890');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        cedula_cliente: '1234567890'
      });
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE cedula_cliente = ?'),
        ['1234567890']
      );
    });

    it('should return empty array when no ventas found', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);

      const result = await VentaModel.findByCliente('9999999999');

      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(VentaModel.findByCliente('1234567890')).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create venta successfully', async () => {
      const mockResult = { insertId: 1, affectedRows: 1 };
      mockExecuteQuery.mockResolvedValueOnce(mockResult);

      const ventaData = {
        cedula_cliente: '1234567890',
        productos: [{ id: 1, nombre: 'Producto 1', precio: 100, cantidad: 2 }],
        servicios: [{ id: 1, nombre: 'Servicio 1', precio: 50, cantidad: 1 }],
        iva: 21.0,
        total_pagar: 250.0,
        metodo: 'efectivo',
        vendedor: 'vendedor1',
        estado: 'activo' as 'activo' | 'inactivo'
      };

      const result = await VentaModel.create(ventaData);

      expect(result).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO ventas'),
        [
          '1234567890',
          JSON.stringify(ventaData.productos),
          JSON.stringify(ventaData.servicios),
          21.0,
          250.0,
          'efectivo',
          'vendedor1',
          'activo'
        ]
      );
    });

    it('should handle database errors on create', async () => {
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      const ventaData = {
        cedula_cliente: '1234567890',
        productos: [],
        servicios: [],
        iva: 0,
        total_pagar: 0,
        metodo: 'efectivo',
        vendedor: 'vendedor1',
        estado: 'activo' as 'activo' | 'inactivo'
      };

      await expect(VentaModel.create(ventaData)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update venta successfully with all fields', async () => {
      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValueOnce(mockResult);

      const updateData = {
        cedula_cliente: '0987654321',
        productos: [{ id: 2, nombre: 'Producto 2', precio: 200, cantidad: 1 }],
        servicios: [{ id: 2, nombre: 'Servicio 2', precio: 100, cantidad: 2 }],
        iva: 42.0,
        total_pagar: 500.0,
        metodo: 'tarjeta',
        vendedor: 'vendedor2',
        estado: 'inactivo' as 'activo' | 'inactivo'
      };

      const result = await VentaModel.update(1, updateData);

      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ventas SET'),
        expect.arrayContaining([
          '0987654321',
          JSON.stringify(updateData.productos),
          JSON.stringify(updateData.servicios),
          42.0,
          500.0,
          'tarjeta',
          'vendedor2',
          'inactivo',
          1
        ])
      );
    });

    it('should update venta with partial fields', async () => {
      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValueOnce(mockResult);

      const updateData = {
        metodo: 'transferencia',
        estado: 'inactivo' as 'activo' | 'inactivo'
      };

      const result = await VentaModel.update(1, updateData);

      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('metodo = ?, estado = ?'),
        ['transferencia', 'inactivo', 1]
      );
    });

    it('should handle iva and total_pagar as zero values', async () => {
      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValueOnce(mockResult);

      const updateData = {
        iva: 0,
        total_pagar: 0
      };

      const result = await VentaModel.update(1, updateData);

      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('iva = ?, total_pagar = ?'),
        [0, 0, 1]
      );
    });

    it('should return false when no fields to update', async () => {
      const result = await VentaModel.update(1, {});

      expect(result).toBe(false);
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it('should return false when no rows affected', async () => {
      const mockResult = { affectedRows: 0 };
      mockExecuteQuery.mockResolvedValueOnce(mockResult);

      const result = await VentaModel.update(999, { metodo: 'efectivo' });

      expect(result).toBe(false);
    });

    it('should handle database errors on update', async () => {
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(VentaModel.update(1, { metodo: 'efectivo' })).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('should delete venta successfully', async () => {
      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValueOnce(mockResult);

      const result = await VentaModel.delete(1);

      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'DELETE FROM ventas WHERE id = ?',
        [1]
      );
    });

    it('should return false when no rows affected', async () => {
      const mockResult = { affectedRows: 0 };
      mockExecuteQuery.mockResolvedValueOnce(mockResult);

      const result = await VentaModel.delete(999);

      expect(result).toBe(false);
    });

    it('should handle database errors on delete', async () => {
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(VentaModel.delete(1)).rejects.toThrow('Database error');
    });
  });

  describe('getVentasCount', () => {
    it('should get ventas count successfully', async () => {
      const mockResult = [{ total: 5 }];
      mockExecuteQuery.mockResolvedValueOnce(mockResult);

      const result = await VentaModel.getVentasCount();

      expect(result).toBe(5);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "SELECT COUNT(*) as total FROM ventas WHERE estado = 'activo'"
      );
    });

    it('should return 0 when no ventas found', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);

      const result = await VentaModel.getVentasCount();

      expect(result).toBe(0);
    });

    it('should handle null result', async () => {
      mockExecuteQuery.mockResolvedValueOnce([{ total: null }]);

      const result = await VentaModel.getVentasCount();

      expect(result).toBe(0);
    });

    it('should handle database errors', async () => {
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(VentaModel.getVentasCount()).rejects.toThrow('Database error');
    });
  });

  describe('getTotalVentas', () => {
    it('should get total ventas amount successfully', async () => {
      const mockResult = [{ total: 1250.50 }];
      mockExecuteQuery.mockResolvedValueOnce(mockResult);

      const result = await VentaModel.getTotalVentas();

      expect(result).toBe(1250.50);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "SELECT SUM(total_pagar) as total FROM ventas WHERE estado = 'activo'"
      );
    });

    it('should return 0 when no ventas found', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);

      const result = await VentaModel.getTotalVentas();

      expect(result).toBe(0);
    });

    it('should handle null result', async () => {
      mockExecuteQuery.mockResolvedValueOnce([{ total: null }]);

      const result = await VentaModel.getTotalVentas();

      expect(result).toBe(0);
    });

    it('should handle database errors', async () => {
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(VentaModel.getTotalVentas()).rejects.toThrow('Database error');
    });
  });

  describe('getVentasByDateRange', () => {
    it('should get ventas by date range successfully', async () => {
      mockExecuteQuery.mockResolvedValueOnce([mockVentaRow]);

      const result = await VentaModel.getVentasByDateRange('2023-12-01', '2023-12-31');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        cedula_cliente: '1234567890'
      });
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE fecha_creacion BETWEEN ? AND ?'),
        ['2023-12-01', '2023-12-31']
      );
    });

    it('should return empty array when no ventas in date range', async () => {
      mockExecuteQuery.mockResolvedValueOnce([]);

      const result = await VentaModel.getVentasByDateRange('2024-01-01', '2024-01-31');

      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(VentaModel.getVentasByDateRange('2023-12-01', '2023-12-31'))
        .rejects.toThrow('Database error');
    });
  });

  describe('mapRowToVenta (private method testing through public methods)', () => {
    it('should correctly parse JSON productos and servicios', async () => {
      const mockRow = {
        ...mockVentaRow,
        productos: '[]',
        servicios: '[]'
      };
      mockExecuteQuery.mockResolvedValueOnce([mockRow]);

      const result = await VentaModel.findById(1);

      expect(result?.productos).toEqual([]);
      expect(result?.servicios).toEqual([]);
    });

    it('should handle productos and servicios as objects', async () => {
      const mockRow = {
        ...mockVentaRow,
        productos: [{ id: 1, nombre: 'Test' }],
        servicios: [{ id: 1, nombre: 'Test Service' }]
      };
      mockExecuteQuery.mockResolvedValueOnce([mockRow]);

      const result = await VentaModel.findById(1);

      expect(result?.productos).toEqual([{ id: 1, nombre: 'Test' }]);
      expect(result?.servicios).toEqual([{ id: 1, nombre: 'Test Service' }]);
    });
  });
});
