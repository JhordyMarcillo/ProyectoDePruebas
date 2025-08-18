import { ProveedorModel } from '../../models/Proveedor';
import { executeQuery } from '../../config/database';
import { Proveedor } from '../../types';

// Mock database
jest.mock('../../config/database');
const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;

describe('ProveedorModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all proveedores successfully', async () => {
      // Arrange
      const mockProveedores = [
        {
          id: 1,
          nombre_empresa: 'Empresa Test',
          email: 'test@empresa.com',
          numero: '0999999999',
          web: 'www.test.com',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];
      const mockTotalResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockProveedores)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ProveedorModel.findAll();

      // Assert
      expect(result.proveedores).toEqual(mockProveedores);
      expect(result.total).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
    });

    it('should find proveedores with search', async () => {
      // Arrange
      const search = 'test';
      const mockProveedores = [
        {
          id: 1,
          nombre_empresa: 'Empresa Test',
          email: 'test@empresa.com',
          numero: '0999999999',
          web: 'www.test.com',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];
      const mockTotalResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockProveedores)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ProveedorModel.findAll(10, 0, search);

      // Assert
      expect(result.proveedores).toEqual(mockProveedores);
      expect(result.total).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['%test%', '%test%', '%test%'])
      );
    });
  });

  describe('findById', () => {
    it('should find proveedor by id successfully', async () => {
      // Arrange
      const mockProveedor = {
        id: 1,
        nombre_empresa: 'Empresa Test',
        email: 'test@empresa.com',
        numero: '0999999999',
        web: 'www.test.com',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockProveedor]);

      // Act
      const result = await ProveedorModel.findById(1);

      // Assert
      expect(result).toEqual(mockProveedor);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
    });

    it('should return null when proveedor not found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ProveedorModel.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create proveedor successfully', async () => {
      // Arrange
      const proveedorData: Omit<Proveedor, 'id' | 'fecha_creacion'> = {
        nombre_empresa: 'Nueva Empresa',
        email: 'nueva@empresa.com',
        numero: '0988888888',
        web: 'www.nueva.com',
        estado: 'activo'
      };

      const mockResult = { insertId: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProveedorModel.create(proveedorData);

      // Assert
      expect(result).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO proveedores'),
        expect.arrayContaining([
          proveedorData.nombre_empresa,
          proveedorData.email,
          proveedorData.numero,
          proveedorData.web,
          proveedorData.estado
        ])
      );
    });
  });

  describe('update', () => {
    it('should update proveedor successfully', async () => {
      // Arrange
      const updateData: Partial<Proveedor> = {
        nombre_empresa: 'Empresa Actualizada',
        email: 'actualizada@empresa.com',
        numero: '0977777777'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProveedorModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE proveedores'),
        expect.arrayContaining([1])
      );
    });

    it('should return false when no rows affected', async () => {
      // Arrange
      const updateData: Partial<Proveedor> = {
        nombre_empresa: 'Empresa Actualizada'
      };

      const mockResult = { affectedRows: 0 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProveedorModel.update(999, updateData);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete proveedor successfully', async () => {
      // Arrange
      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProveedorModel.delete(1);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'DELETE FROM proveedores WHERE id = ?',
        [1]
      );
    });

    it('should return false when no rows affected', async () => {
      // Arrange
      const mockResult = { affectedRows: 0 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProveedorModel.delete(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getActiveCount', () => {
    it('should return count of active proveedores', async () => {
      // Arrange
      const mockResult = [{ total: 5 }];
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProveedorModel.getActiveCount();

      // Assert
      expect(result).toBe(5);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "SELECT COUNT(*) as total FROM proveedores WHERE estado = 'activo'"
      );
    });

    it('should return 0 when no active proveedores exist', async () => {
      // Arrange
      const mockResult = [{ total: 0 }];
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProveedorModel.getActiveCount();

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when result is empty or invalid', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ProveedorModel.getActiveCount();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('update - additional field coverage', () => {
    it('should update only numero field', async () => {
      // Arrange
      const updateData: Partial<Proveedor> = {
        numero: '0966666666'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProveedorModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE proveedores SET numero = ? WHERE id = ?',
        ['0966666666', 1]
      );
    });

    it('should update only web field', async () => {
      // Arrange
      const updateData: Partial<Proveedor> = {
        web: 'www.nuevaweb.com'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProveedorModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE proveedores SET web = ? WHERE id = ?',
        ['www.nuevaweb.com', 1]
      );
    });

    it('should update only estado field', async () => {
      // Arrange
      const updateData: Partial<Proveedor> = {
        estado: 'inactivo'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProveedorModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE proveedores SET estado = ? WHERE id = ?',
        ['inactivo', 1]
      );
    });

    it('should return false when no fields to update', async () => {
      // Arrange
      const updateData: Partial<Proveedor> = {}; // Empty object

      // Act
      const result = await ProveedorModel.update(1, updateData);

      // Assert
      expect(result).toBe(false);
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it('should update multiple fields including numero and web', async () => {
      // Arrange
      const updateData: Partial<Proveedor> = {
        nombre_empresa: 'Empresa Múltiple',
        numero: '0955555555',
        web: 'www.multiple.com',
        estado: 'activo'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProveedorModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE proveedores SET nombre_empresa = ?, numero = ?, web = ?, estado = ? WHERE id = ?',
        ['Empresa Múltiple', '0955555555', 'www.multiple.com', 'activo', 1]
      );
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle database errors in findAll', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ProveedorModel.findAll()).rejects.toThrow('Database error');
    });

    it('should handle database errors in findById', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ProveedorModel.findById(1)).rejects.toThrow('Database error');
    });

    it('should handle database errors in create', async () => {
      // Arrange
      const proveedorData: Omit<Proveedor, 'id' | 'fecha_creacion'> = {
        nombre_empresa: 'Error Test',
        email: 'error@test.com',
        numero: '0999999999',
        web: 'www.error.com',
        estado: 'activo'
      };

      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ProveedorModel.create(proveedorData)).rejects.toThrow('Database error');
    });

    it('should handle database errors in update', async () => {
      // Arrange
      const updateData: Partial<Proveedor> = {
        nombre_empresa: 'Error Update'
      };

      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ProveedorModel.update(1, updateData)).rejects.toThrow('Database error');
    });

    it('should handle database errors in delete', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ProveedorModel.delete(1)).rejects.toThrow('Database error');
    });

    it('should handle database errors in getActiveCount', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ProveedorModel.getActiveCount()).rejects.toThrow('Database error');
    });

    it('should handle findAll with pagination and search parameters', async () => {
      // Arrange
      const mockProveedores = [
        {
          id: 1,
          nombre_empresa: 'Empresa Search',
          email: 'search@empresa.com',
          numero: '0999999999',
          web: 'www.search.com',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];
      const mockTotalResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockProveedores)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ProveedorModel.findAll(5, 10, 'search');

      // Assert
      expect(result.proveedores).toEqual(mockProveedores);
      expect(result.total).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ? OFFSET ?'),
        expect.arrayContaining([5, 10])
      );
    });

    it('should handle total result with undefined value', async () => {
      // Arrange
      const mockProveedores: any[] = [];
      const mockTotalResult = [{}]; // No total property

      mockExecuteQuery
        .mockResolvedValueOnce(mockProveedores)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ProveedorModel.findAll();

      // Assert
      expect(result.proveedores).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
