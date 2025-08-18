import { ProductoModel } from '../../models/Producto';
import { executeQuery } from '../../config/database';
import { Producto } from '../../types';

// Mock database
jest.mock('../../config/database');
const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;

describe('ProductoModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all productos successfully', async () => {
      // Arrange
      const mockProductos = [
        {
          id: 1,
          nombre_producto: 'Producto Test',
          cantidad_producto: 100,
          proveedor_producto: 'Proveedor Test',
          precio_producto: 10.99,
          precio_compra: 8.99,
          marca_producto: 'Marca Test',
          categoria_producto: 'test',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];
      const mockTotalResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockProductos)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ProductoModel.findAll();

      // Assert
      expect(result.productos).toEqual(mockProductos);
      expect(result.total).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
    });

    it('should find all productos with pagination', async () => {
      // Arrange
      const mockProductos = [
        {
          id: 1,
          nombre_producto: 'Producto Test',
          cantidad_producto: 100,
          proveedor_producto: 'Proveedor Test',
          precio_producto: 10.99,
          precio_compra: 8.99,
          marca_producto: 'Marca Test',
          categoria_producto: 'test',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];
      const mockTotalResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockProductos)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ProductoModel.findAll(10, 0);

      // Assert
      expect(result.productos).toEqual(mockProductos);
      expect(result.total).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
      // Verificar que se llama sin parámetros de búsqueda
      expect(mockExecuteQuery).toHaveBeenNthCalledWith(2, expect.any(String), []);
    });

    it('should find productos with search', async () => {
      // Arrange
      const search = 'test';
      const mockProductos = [
        {
          id: 1,
          nombre_producto: 'Producto Test',
          cantidad_producto: 100,
          proveedor_producto: 'Proveedor Test',
          precio_producto: 10.99,
          precio_compra: 8.99,
          marca_producto: 'Marca Test',
          categoria_producto: 'test',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];
      const mockTotalResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockProductos)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ProductoModel.findAll(10, 0, search);

      // Assert
      expect(result.productos).toEqual(mockProductos);
      expect(result.total).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['%test%', '%test%', '%test%'])
      );
    });

    it('should handle empty total result', async () => {
      // Arrange
      const mockProductos = [
        {
          id: 1,
          nombre_producto: 'Producto Test',
          cantidad_producto: 100,
          proveedor_producto: 'Proveedor Test',
          precio_producto: 10.99,
          precio_compra: 8.99,
          marca_producto: 'Marca Test',
          categoria_producto: 'test',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];
      const mockTotalResult: any[] = []; // Empty result array

      mockExecuteQuery
        .mockResolvedValueOnce(mockProductos)
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await ProductoModel.findAll();

      // Assert
      expect(result.productos).toEqual(mockProductos);
      expect(result.total).toBe(0); // Should default to 0
    });
  });

  describe('findById', () => {
    it('should find producto by id successfully', async () => {
      // Arrange
      const mockProducto = {
        id: 1,
        nombre_producto: 'Producto Test',
        cantidad_producto: 100,
        proveedor_producto: 'Proveedor Test',
        precio_producto: 10.99,
        precio_compra: 8.99,
        marca_producto: 'Marca Test',
        categoria_producto: 'test',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockProducto]);

      // Act
      const result = await ProductoModel.findById(1);

      // Assert
      expect(result).toEqual(mockProducto);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
    });

    it('should return null when producto not found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ProductoModel.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should find producto by name successfully', async () => {
      // Arrange
      const mockProducto = {
        id: 1,
        nombre_producto: 'Producto Test',
        cantidad_producto: 100,
        proveedor_producto: 'Proveedor Test',
        precio_producto: 10.99,
        precio_compra: 8.99,
        marca_producto: 'Marca Test',
        categoria_producto: 'test',
        estado: 'activo',
        fecha_creacion: new Date(),
        proveedor_nombre: 'Empresa Test'
      };

      mockExecuteQuery.mockResolvedValue([mockProducto]);

      // Act
      const result = await ProductoModel.findByName('Producto Test');

      // Assert
      expect(result).toEqual(mockProducto);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.nombre = ?'),
        ['Producto Test']
      );
    });

    it('should return null when producto name not found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ProductoModel.findByName('Producto Inexistente');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create producto successfully', async () => {
      // Arrange
      const productoData: Omit<Producto, 'id' | 'fecha_creacion'> = {
        nombre_producto: 'Nuevo Producto',
        cantidad_producto: 50,
        proveedor_producto: 'Nuevo Proveedor',
        precio_producto: 15.99,
        precio_compra: 12.99,
        marca_producto: 'Nueva Marca',
        categoria_producto: 'nueva',
        estado: 'activo'
      };

      const mockResult = { insertId: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.create(productoData);

      // Assert
      expect(result).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO productos'),
        expect.arrayContaining([
          productoData.nombre_producto,
          productoData.cantidad_producto,
          productoData.proveedor_producto,
          productoData.precio_producto,
          productoData.precio_compra
        ])
      );
    });
  });

  describe('update', () => {
    it('should update producto successfully', async () => {
      // Arrange
      const updateData: Partial<Producto> = {
        nombre_producto: 'Producto Actualizado',
        precio_producto: 20.99,
        cantidad_producto: 75
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE productos'),
        expect.arrayContaining([1])
      );
    });

    it('should update all product fields successfully', async () => {
      // Arrange
      const updateData: Partial<Producto> = {
        nombre_producto: 'Producto Completo',
        cantidad_producto: 150,
        proveedor_producto: 'Nuevo Proveedor',
        precio_producto: 25.99,
        precio_compra: 18.99,
        marca_producto: 'Nueva Marca',
        categoria_producto: 'nueva_categoria',
        estado: 'inactivo'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE productos SET'),
        expect.arrayContaining([
          updateData.nombre_producto,
          updateData.cantidad_producto,
          updateData.proveedor_producto,
          updateData.precio_producto,
          updateData.precio_compra,
          updateData.marca_producto,
          updateData.categoria_producto,
          updateData.estado,
          1
        ])
      );
    });

    it('should update only cantidad_producto field', async () => {
      // Arrange
      const updateData: Partial<Producto> = {
        cantidad_producto: 200
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('cantidad = ?'),
        [200, 1]
      );
    });

    it('should update only proveedor_producto field', async () => {
      // Arrange
      const updateData: Partial<Producto> = {
        proveedor_producto: 'Proveedor Específico'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('proveedor = ?'),
        ['Proveedor Específico', 1]
      );
    });

    it('should update only precio_producto field', async () => {
      // Arrange
      const updateData: Partial<Producto> = {
        precio_producto: 29.99
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('precio = ?'),
        [29.99, 1]
      );
    });

    it('should update only precio_compra field', async () => {
      // Arrange
      const updateData: Partial<Producto> = {
        precio_compra: 22.50
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('precio_compra = ?'),
        [22.50, 1]
      );
    });

    it('should update only marca_producto field', async () => {
      // Arrange
      const updateData: Partial<Producto> = {
        marca_producto: 'Marca Exclusiva'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('marca = ?'),
        ['Marca Exclusiva', 1]
      );
    });

    it('should update only categoria_producto field', async () => {
      // Arrange
      const updateData: Partial<Producto> = {
        categoria_producto: 'categoria_especial'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('codigo = ?'),
        ['categoria_especial', 1]
      );
    });

    it('should update only estado field', async () => {
      // Arrange
      const updateData: Partial<Producto> = {
        estado: 'inactivo'
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('estado = ?'),
        ['inactivo', 1]
      );
    });

    it('should return false when no fields to update', async () => {
      // Arrange
      const updateData: Partial<Producto> = {};

      // Act
      const result = await ProductoModel.update(1, updateData);

      // Assert
      expect(result).toBe(false);
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it('should return false when no rows affected', async () => {
      // Arrange
      const updateData: Partial<Producto> = {
        nombre_producto: 'Producto Actualizado'
      };

      const mockResult = { affectedRows: 0 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.update(999, updateData);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete producto successfully', async () => {
      // Arrange
      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.delete(1);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'DELETE FROM productos WHERE id = ?',
        [1]
      );
    });

    it('should return false when no rows affected', async () => {
      // Arrange
      const mockResult = { affectedRows: 0 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.delete(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle database errors in findAll', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(ProductoModel.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors in findById', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ProductoModel.findById(1)).rejects.toThrow('Database error');
    });

    it('should handle database errors in create', async () => {
      // Arrange
      const productoData: Omit<Producto, 'id' | 'fecha_creacion'> = {
        nombre_producto: 'Test Product',
        cantidad_producto: 50,
        proveedor_producto: 'Test Provider',
        precio_producto: 15.99,
        precio_compra: 12.99,
        marca_producto: 'Test Brand',
        categoria_producto: 'test',
        estado: 'activo'
      };

      mockExecuteQuery.mockRejectedValue(new Error('Insert failed'));

      // Act & Assert
      await expect(ProductoModel.create(productoData)).rejects.toThrow('Insert failed');
    });

    it('should handle undefined values in update', async () => {
      // Arrange
      const updateData = {
        nombre_producto: 'Valid Name'
        // Solo incluir campos definidos
      };

      const mockResult = { affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      // Act
      const result = await ProductoModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE productos SET nombre = ? WHERE id = ?',
        ['Valid Name', 1]
      );
    });

    it('should handle empty result arrays properly', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const resultById = await ProductoModel.findById(999);
      const resultByName = await ProductoModel.findByName('Inexistente');

      // Assert
      expect(resultById).toBeNull();
      expect(resultByName).toBeNull();
    });
  });
});
