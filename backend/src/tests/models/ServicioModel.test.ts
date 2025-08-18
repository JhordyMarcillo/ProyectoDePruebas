import { ServicioModel } from '../../models/Servicio';
import { executeQuery } from '../../config/database';
import { Servicio } from '../../types';

// Mock database
jest.mock('../../config/database');
const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;

describe('ServicioModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all servicios successfully', async () => {
      // Arrange
      const mockServicios = [
        {
          id: 1,
          nombre: 'Servicio Test',
          descripcion: 'Descripción test',
          coste_total: 100.50,
          costo_servicio: 120.00,
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];
      const mockTotalResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockServicios)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ServicioModel.findAll();

      // Assert
      expect(result.servicios).toEqual(mockServicios);
      expect(result.total).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
    });

    it('should find servicios with search', async () => {
      // Arrange
      const search = 'test';
      const mockServicios = [
        {
          id: 1,
          nombre: 'Servicio Test',
          descripcion: 'Descripción test',
          coste_total: 100.50,
          costo_servicio: 120.00,
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];
      const mockTotalResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockServicios)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ServicioModel.findAll(10, 0, search);

      // Assert
      expect(result.servicios).toEqual(mockServicios);
      expect(result.total).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['%test%', '%test%'])
      );
    });
  });

  describe('findById', () => {
    it('should find servicio by id successfully', async () => {
      // Arrange
      const mockServicio = {
        id: 1,
        nombre: 'Servicio Test',
        descripcion: 'Descripción test',
        coste_total: 100.50,
        costo_servicio: 120.00,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockServicio]);

      // Act
      const result = await ServicioModel.findById(1);

      // Assert
      expect(result).toEqual(mockServicio);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
    });

    it('should return null when servicio not found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ServicioModel.findById(999);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle productos as string in mapping', async () => {
      // Arrange
      const mockServicioWithStringProducts = {
        id: 1,
        nombre: 'Servicio Test',
        descripcion: 'Descripción test',
        productos: '["producto1","producto2"]', // String format
        coste_total: 100.50,
        costo_servicio: 120.00,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockServicioWithStringProducts]);

      // Act
      const result = await ServicioModel.findById(1);

      // Assert
      expect(result).toBeDefined();
      expect(result?.productos).toEqual(['producto1', 'producto2']); // Should be parsed
    });

    it('should handle productos as array in mapping', async () => {
      // Arrange
      const mockServicioWithArrayProducts = {
        id: 1,
        nombre: 'Servicio Test',
        descripcion: 'Descripción test',
        productos: ['producto1', 'producto2'], // Already array format
        coste_total: 100.50,
        costo_servicio: 120.00,
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockServicioWithArrayProducts]);

      // Act
      const result = await ServicioModel.findById(1);

      // Assert
      expect(result).toBeDefined();
      expect(result?.productos).toEqual(['producto1', 'producto2']); // Should remain array
    });
  });

  describe('create', () => {
    it('should create servicio successfully', async () => {
      // Arrange
      const servicioData: Omit<Servicio, 'id' | 'fecha_creacion'> = {
        nombre: 'Nuevo Servicio',
        descripcion: 'Nueva descripción',
        coste_total: 150.00,
        costo_servicio: 180.00,
        estado: 'activo'
      };

      const mockResult = { insertId: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.create(servicioData);

      // Assert
      expect(result).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO servicios'),
        expect.arrayContaining([
          servicioData.nombre,
          servicioData.descripcion,
          servicioData.coste_total,
          servicioData.costo_servicio,
          servicioData.estado
        ])
      );
    });
  });

  describe('update', () => {
    it('should update servicio successfully', async () => {
      // Arrange
      const updateData: Partial<Servicio> = {
        nombre: 'Servicio Actualizado',
        descripcion: 'Descripción actualizada',
        coste_total: 200.00
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE servicios'),
        expect.arrayContaining([1])
      );
    });

    it('should update only descripcion field', async () => {
      // Arrange
      const updateData: Partial<Servicio> = {
        descripcion: 'Nueva descripción específica'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE servicios SET descripcion = ? WHERE id = ?',
        ['Nueva descripción específica', 1]
      );
    });

    it('should update only productos field', async () => {
      // Arrange
      const updateData: Partial<Servicio> = {
        productos: ['producto1', 'producto2', 'producto3']
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE servicios SET productos = ? WHERE id = ?',
        [JSON.stringify(['producto1', 'producto2', 'producto3']), 1]
      );
    });

    it('should update only coste_total field', async () => {
      // Arrange
      const updateData: Partial<Servicio> = {
        coste_total: 350.75
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE servicios SET coste_total = ? WHERE id = ?',
        [350.75, 1]
      );
    });

    it('should update only costo_servicio field', async () => {
      // Arrange
      const updateData: Partial<Servicio> = {
        costo_servicio: 420.50
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE servicios SET costo_servicio = ? WHERE id = ?',
        [420.50, 1]
      );
    });

    it('should update only estado field', async () => {
      // Arrange
      const updateData: Partial<Servicio> = {
        estado: 'inactivo'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE servicios SET estado = ? WHERE id = ?',
        ['inactivo', 1]
      );
    });

    it('should update all fields at once', async () => {
      // Arrange
      const updateData: Partial<Servicio> = {
        nombre: 'Servicio Completo',
        descripcion: 'Descripción completa',
        productos: ['producto1', 'producto2'],
        coste_total: 300.00,
        costo_servicio: 350.00,
        estado: 'activo'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE servicios SET'),
        expect.arrayContaining([
          updateData.nombre,
          updateData.descripcion,
          JSON.stringify(updateData.productos),
          updateData.coste_total,
          updateData.costo_servicio,
          updateData.estado,
          1
        ])
      );
    });

    it('should return false when no fields to update', async () => {
      // Arrange
      const updateData: Partial<Servicio> = {};

      // Act
      const result = await ServicioModel.update(1, updateData);

      // Assert
      expect(result).toBe(false);
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it('should return false when no rows affected', async () => {
      // Arrange
      const updateData: Partial<Servicio> = {
        nombre: 'Servicio Actualizado'
      };

      const mockResult = { affectedRows: 0 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.update(999, updateData);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle undefined coste_total and costo_servicio values', async () => {
      // Arrange
      const updateData = {
        nombre: 'Servicio Test'
        // No incluir campos undefined
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE servicios SET nombre = ? WHERE id = ?',
        ['Servicio Test', 1]
      );
    });
  });

  describe('delete', () => {
    it('should delete servicio successfully', async () => {
      // Arrange
      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.delete(1);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'DELETE FROM servicios WHERE id = ?',
        [1]
      );
    });

    it('should return false when no rows affected', async () => {
      // Arrange
      const mockResult = { affectedRows: 0 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ServicioModel.delete(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('findActivos', () => {
    it('should find all active servicios successfully', async () => {
      // Arrange
      const mockActiveServicios = [
        {
          id: 1,
          nombre: 'Servicio Activo 1',
          descripcion: 'Descripción 1',
          productos: ['producto1', 'producto2'],
          coste_total: 100.50,
          costo_servicio: 120.00,
          estado: 'activo',
          fecha_creacion: new Date()
        },
        {
          id: 2,
          nombre: 'Servicio Activo 2',
          descripcion: 'Descripción 2',
          productos: ['producto3'],
          coste_total: 200.75,
          costo_servicio: 250.00,
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];

      mockExecuteQuery.mockResolvedValue(mockActiveServicios);

      // Act
      const result = await ServicioModel.findActivos();

      // Assert
      expect(result).toEqual(mockActiveServicios);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE estado = 'activo'"),
        []
      );
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY nombre ASC'),
        []
      );
    });

    it('should return empty array when no active servicios exist', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ServicioModel.findActivos();

      // Assert
      expect(result).toEqual([]);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE estado = 'activo'"),
        []
      );
    });
  });

  describe('getActiveCount', () => {
    it('should return count of active servicios', async () => {
      // Arrange
      const mockCountResult = [{ total: 5 }];
      mockExecuteQuery.mockResolvedValue(mockCountResult);

      // Act
      const result = await ServicioModel.getActiveCount();

      // Assert
      expect(result).toBe(5);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "SELECT COUNT(*) as total FROM servicios WHERE estado = 'activo'"
      );
    });

    it('should return 0 when no active servicios exist', async () => {
      // Arrange
      const mockCountResult = [{ total: 0 }];
      mockExecuteQuery.mockResolvedValue(mockCountResult);

      // Act
      const result = await ServicioModel.getActiveCount();

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when result is empty or invalid', async () => {
      // Arrange
      const mockCountResult: any[] = [];
      mockExecuteQuery.mockResolvedValue(mockCountResult);

      // Act
      const result = await ServicioModel.getActiveCount();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle database errors in findAll', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(ServicioModel.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors in findById', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ServicioModel.findById(1)).rejects.toThrow('Database error');
    });

    it('should handle database errors in findActivos', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Connection timeout'));

      // Act & Assert
      await expect(ServicioModel.findActivos()).rejects.toThrow('Connection timeout');
    });

    it('should handle database errors in create', async () => {
      // Arrange
      const servicioData: Omit<Servicio, 'id' | 'fecha_creacion'> = {
        nombre: 'Test Service',
        descripcion: 'Test Description',
        productos: ['product1'],
        coste_total: 100.00,
        costo_servicio: 120.00,
        estado: 'activo'
      };

      mockExecuteQuery.mockRejectedValue(new Error('Insert failed'));

      // Act & Assert
      await expect(ServicioModel.create(servicioData)).rejects.toThrow('Insert failed');
    });

    it('should handle database errors in getActiveCount', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Query failed'));

      // Act & Assert
      await expect(ServicioModel.getActiveCount()).rejects.toThrow('Query failed');
    });

    it('should handle empty result arrays properly', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const resultById = await ServicioModel.findById(999);
      const resultActivos = await ServicioModel.findActivos();

      // Assert
      expect(resultById).toBeNull();
      expect(resultActivos).toEqual([]);
    });

    it('should handle findAll with empty results and total', async () => {
      // Arrange
      const mockServicios: any[] = [];
      const mockTotalResult = [{ total: 0 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockServicios)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ServicioModel.findAll();

      // Assert
      expect(result.servicios).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle findAll with pagination parameters', async () => {
      // Arrange
      const mockServicios = [
        {
          id: 1,
          nombre: 'Servicio Paginado',
          descripcion: 'Descripción test',
          productos: ['producto1'],
          coste_total: 100.50,
          costo_servicio: 120.00,
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];
      const mockTotalResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockServicios)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ServicioModel.findAll(10, 0);

      // Assert
      expect(result.servicios).toEqual(mockServicios);
      expect(result.total).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
      // Verificar que se llama sin parámetros de búsqueda
      expect(mockExecuteQuery).toHaveBeenNthCalledWith(2, expect.any(String), []);
    });
  });
});
