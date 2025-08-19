import { CambioModel, Cambio } from '../../models/Cambio';
import { executeQuery } from '../../config/database';

// Mock de la función executeQuery
jest.mock('../../config/database', () => ({
  executeQuery: jest.fn()
}));

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;

describe('CambioModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock para Date.now() para hacer las pruebas determinísticas
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-12-01T10:00:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Mock data
  const mockCambioRow = {
    id: 1,
    id_cambiado: 101,
    usuario_id: 'admin',
    descripcion: 'Usuario creado',
    tipo_cambio: 'Agregar',
    fecha: new Date('2023-12-01T09:00:00Z'),
    tabla_afectada: 'usuarios'
  };

  const mockCambio: Cambio = {
    id: 1,
    id_cambiado: 101,
    usuario_id: 'admin',
    descripcion: 'Usuario creado',
    tipo_cambio: 'Agregar',
    fecha: new Date('2023-12-01T09:00:00Z'),
    tabla_afectada: 'usuarios'
  };

  describe('findAll', () => {
    it('should find all cambios with default pagination', async () => {
      // Arrange
      const mockTotalResult = [{ total: 1 }];
      mockExecuteQuery
        .mockResolvedValueOnce([mockCambioRow])
        .mockResolvedValueOnce(mockTotalResult);

      // Act
      const result = await CambioModel.findAll();

      // Assert
      expect(result.cambios).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.cambios[0]).toMatchObject({
        id: 1,
        usuario_id: 'admin',
        descripcion: 'Usuario creado',
        tipo_cambio: 'Agregar'
      });
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ? OFFSET ?'),
        [10, 0]
      );
    });

    it('should find cambios with custom limit and offset', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }]);

      // Act
      await CambioModel.findAll(20, 5);

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ? OFFSET ?'),
        [20, 5]
      );
    });

    it('should find cambios with search parameter', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }]);

      // Act
      await CambioModel.findAll(10, 0, 'admin');

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE (usuario_id LIKE ? OR descripcion LIKE ?)'),
        ['%admin%', '%admin%', 10, 0]
      );
    });

    it('should find cambios with tabla parameter', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }]);

      // Act
      await CambioModel.findAll(10, 0, undefined, 'usuarios');

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE tabla_afectada = ?'),
        ['usuarios', 10, 0]
      );
    });

    it('should find cambios with both search and tabla parameters', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }]);

      // Act
      await CambioModel.findAll(10, 0, 'admin', 'productos');

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE (usuario_id LIKE ? OR descripcion LIKE ?) AND tabla_afectada = ?'),
        ['%admin%', '%admin%', 'productos', 10, 0]
      );
    });

    it('should handle empty results', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      // Act
      const result = await CambioModel.findAll();

      // Assert
      expect(result.cambios).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(CambioModel.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findAllWithoutPagination', () => {
    it('should find all cambios without pagination', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([mockCambioRow]);

      // Act
      const result = await CambioModel.findAllWithoutPagination();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        usuario_id: 'admin',
        descripcion: 'Usuario creado'
      });
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY fecha DESC'),
        []
      );
    });

    it('should return empty array when no cambios found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([]);

      // Act
      const result = await CambioModel.findAllWithoutPagination();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(CambioModel.findAllWithoutPagination()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should find cambio by id successfully', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([mockCambioRow]);

      // Act
      const result = await CambioModel.findById(1);

      // Assert
      expect(result).toMatchObject({
        id: 1,
        usuario_id: 'admin',
        descripcion: 'Usuario creado'
      });
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        [1]
      );
    });

    it('should return null when cambio not found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([]);

      // Act
      const result = await CambioModel.findById(999);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(CambioModel.findById(1)).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create cambio successfully', async () => {
      // Arrange
      const mockResult = { insertId: 1, affectedRows: 1 };
      mockExecuteQuery.mockResolvedValueOnce(mockResult);

      const cambioData = {
        id_cambiado: 101,
        usuario_id: 'admin',
        descripcion: 'Usuario creado',
        tipo_cambio: 'Agregar' as 'Agregar' | 'Actualizar' | 'Activo' | 'Inactivo',
        tabla_afectada: 'usuarios'
      };

      // Act
      const result = await CambioModel.create(cambioData);

      // Assert
      expect(result).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cambios'),
        [101, 'admin', 'Usuario creado', 'Agregar', 'usuarios']
      );
    });

    it('should handle database errors on create', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      const cambioData = {
        id_cambiado: 101,
        usuario_id: 'admin',
        descripcion: 'Usuario creado',
        tipo_cambio: 'Agregar' as 'Agregar' | 'Actualizar' | 'Activo' | 'Inactivo',
        tabla_afectada: 'usuarios'
      };

      // Act & Assert
      await expect(CambioModel.create(cambioData)).rejects.toThrow('Database error');
    });
  });

  describe('findByTabla', () => {
    it('should find cambios by tabla successfully', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([mockCambioRow]);

      // Act
      const result = await CambioModel.findByTabla('usuarios');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        tabla_afectada: 'usuarios'
      });
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE tabla_afectada = ?'),
        ['usuarios']
      );
    });

    it('should return empty array when no cambios found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([]);

      // Act
      const result = await CambioModel.findByTabla('nonexistent');

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(CambioModel.findByTabla('usuarios')).rejects.toThrow('Database error');
    });
  });

  describe('findByUsuario', () => {
    it('should find cambios by usuario with default limit', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([mockCambioRow]);

      // Act
      const result = await CambioModel.findByUsuario('admin');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        usuario_id: 'admin'
      });
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE usuario_id = ?'),
        ['admin', 10]
      );
    });

    it('should find cambios by usuario with custom limit', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([]);

      // Act
      await CambioModel.findByUsuario('admin', 5);

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        ['admin', 5]
      );
    });

    it('should return empty array when no cambios found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([]);

      // Act
      const result = await CambioModel.findByUsuario('nonexistent');

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(CambioModel.findByUsuario('admin')).rejects.toThrow('Database error');
    });
  });

  describe('findByDateRange', () => {
    it('should find cambios by date range successfully', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([mockCambioRow]);

      // Act
      const result = await CambioModel.findByDateRange('2023-12-01', '2023-12-31');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        usuario_id: 'admin'
      });
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE DATE(fecha) BETWEEN ? AND ?'),
        ['2023-12-01', '2023-12-31']
      );
    });

    it('should return empty array when no cambios in date range', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([]);

      // Act
      const result = await CambioModel.findByDateRange('2024-01-01', '2024-01-31');

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle same start and end date', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValueOnce([mockCambioRow]);

      // Act
      const result = await CambioModel.findByDateRange('2023-12-01', '2023-12-01');

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE DATE(fecha) BETWEEN ? AND ?'),
        ['2023-12-01', '2023-12-01']
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(CambioModel.findByDateRange('2023-12-01', '2023-12-31'))
        .rejects.toThrow('Database error');
    });
  });

  describe('getStats', () => {
    it('should get stats successfully', async () => {
      // Arrange
      const mockStats = [
        [{ total: 100 }], // total
        [{ total: 5 }],   // hoy
        [{ total: 25 }],  // semana
        [{ tipo_cambio: 'Agregar', total: 60 }, { tipo_cambio: 'Actualizar', total: 40 }], // por tipo
        [{ tabla_afectada: 'usuarios', total: 70 }, { tabla_afectada: 'productos', total: 30 }] // por tabla
      ];

      mockExecuteQuery
        .mockResolvedValueOnce(mockStats[0])
        .mockResolvedValueOnce(mockStats[1])
        .mockResolvedValueOnce(mockStats[2])
        .mockResolvedValueOnce(mockStats[3])
        .mockResolvedValueOnce(mockStats[4]);

      // Act
      const result = await CambioModel.getStats();

      // Assert
      expect(result).toEqual({
        total_cambios: 100,
        cambios_hoy: 5,
        cambios_semana: 25,
        por_tipo: {
          'Agregar': 60,
          'Actualizar': 40
        },
        por_tabla: {
          'usuarios': 70,
          'productos': 30
        }
      });
      expect(mockExecuteQuery).toHaveBeenCalledTimes(5);
    });

    it('should handle empty stats results', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      // Act
      const result = await CambioModel.getStats();

      // Assert
      expect(result).toEqual({
        total_cambios: 0,
        cambios_hoy: 0,
        cambios_semana: 0,
        por_tipo: {},
        por_tabla: {}
      });
    });

    it('should handle null results in stats', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([{ total: null }])
        .mockResolvedValueOnce([{ total: null }])
        .mockResolvedValueOnce([{ total: null }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      // Act
      const result = await CambioModel.getStats();

      // Assert
      expect(result).toEqual({
        total_cambios: 0,
        cambios_hoy: 0,
        cambios_semana: 0,
        por_tipo: {},
        por_tabla: {}
      });
    });

    it('should handle database errors in getStats', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(CambioModel.getStats()).rejects.toThrow('Database error');
    });
  });

  describe('getEstadisticas', () => {
    it('should get estadisticas successfully', async () => {
      // Arrange
      const mockResults = [
        [{ tabla_afectada: 'usuarios', total: 50 }], // cambiosPorTabla
        [{ tipo_cambio: 'Agregar', total: 30 }],     // cambiosPorTipo
        [{ fecha: '2023-12-01', total: 10 }],        // cambiosPorDia
        [{ total_cambios: 100 }],                    // totalCambios
        [{ cambios_hoy: 5 }]                         // cambiosHoy
      ];

      mockExecuteQuery
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1])
        .mockResolvedValueOnce(mockResults[2])
        .mockResolvedValueOnce(mockResults[3])
        .mockResolvedValueOnce(mockResults[4]);

      // Act
      const result = await CambioModel.getEstadisticas();

      // Assert
      expect(result).toEqual({
        cambiosPorTabla: mockResults[0],
        cambiosPorTipo: mockResults[1],
        cambiosPorDia: mockResults[2],
        totalCambios: 100,
        cambiosHoy: 5
      });
      expect(mockExecuteQuery).toHaveBeenCalledTimes(5);
    });

    it('should handle empty estadisticas results', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      // Act
      const result = await CambioModel.getEstadisticas();

      // Assert
      expect(result).toEqual({
        cambiosPorTabla: [],
        cambiosPorTipo: [],
        cambiosPorDia: [],
        totalCambios: 0,
        cambiosHoy: 0
      });
    });

    it('should handle null totalCambios and cambiosHoy', async () => {
      // Arrange
      mockExecuteQuery
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(null as any)
        .mockResolvedValueOnce(null as any);

      // Act
      const result = await CambioModel.getEstadisticas();

      // Assert
      expect(result.totalCambios).toBe(0);
      expect(result.cambiosHoy).toBe(0);
    });

    it('should handle database errors in getEstadisticas', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(CambioModel.getEstadisticas()).rejects.toThrow('Database error');
    });
  });

  describe('registrarCambio', () => {
    it('should register cambio successfully', async () => {
      // Arrange
      const mockResult = { insertId: 1, affectedRows: 1 };
      mockExecuteQuery.mockResolvedValueOnce(mockResult);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await CambioModel.registrarCambio(
        'admin',
        'Usuario creado',
        'Agregar',
        'usuarios',
        101
      );

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cambios'),
        [101, 'admin', 'Usuario creado', 'Agregar', 'usuarios']
      );
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should register cambio with default id_cambiado', async () => {
      // Arrange
      const mockResult = { insertId: 1, affectedRows: 1 };
      mockExecuteQuery.mockResolvedValueOnce(mockResult);

      // Act
      await CambioModel.registrarCambio(
        'admin',
        'Usuario creado',
        'Agregar',
        'usuarios'
      );

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cambios'),
        [0, 'admin', 'Usuario creado', 'Agregar', 'usuarios']
      );
    });

    it('should handle errors gracefully and not throw', async () => {
      // Arrange
      mockExecuteQuery.mockRejectedValueOnce(new Error('Database error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await expect(CambioModel.registrarCambio(
        'admin',
        'Usuario creado',
        'Agregar',
        'usuarios',
        101
      )).resolves.not.toThrow();

      // Assert
    });

    it('should test all tipo_cambio values', async () => {
      // Arrange
      const mockResult = { insertId: 1, affectedRows: 1 };
      mockExecuteQuery.mockResolvedValue(mockResult);

      const tipos: Array<'Agregar' | 'Actualizar' | 'Activo' | 'Inactivo'> = [
        'Agregar', 'Actualizar', 'Activo', 'Inactivo'
      ];

      // Act & Assert
      for (const tipo of tipos) {
        await CambioModel.registrarCambio('admin', 'Test', tipo, 'test_tabla', 1);
        expect(mockExecuteQuery).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO cambios'),
          [1, 'admin', 'Test', tipo, 'test_tabla']
        );
      }
    });
  });

  describe('mapRowToCambio (private method testing through public methods)', () => {
    it('should correctly map row to cambio object', async () => {
      // Arrange
      const mockRow = {
        id: 1,
        id_cambiado: 101,
        usuario_id: 'admin',
        descripcion: 'Test cambio',
        tipo_cambio: 'Agregar',
        fecha: new Date('2023-12-01T10:00:00Z'),
        tabla_afectada: 'test_tabla'
      };
      mockExecuteQuery.mockResolvedValueOnce([mockRow]);

      // Act
      const result = await CambioModel.findById(1);

      // Assert
      expect(result).toEqual({
        id: 1,
        id_cambiado: 101,
        usuario_id: 'admin',
        descripcion: 'Test cambio',
        tipo_cambio: 'Agregar',
        fecha: new Date('2023-12-01T10:00:00Z'),
        tabla_afectada: 'test_tabla'
      });
    });

    it('should handle all tipo_cambio enum values in mapping', async () => {
      // Arrange
      const tipos: Array<'Agregar' | 'Actualizar' | 'Activo' | 'Inactivo'> = [
        'Agregar', 'Actualizar', 'Activo', 'Inactivo'
      ];

      for (let i = 0; i < tipos.length; i++) {
        const mockRow = {
          ...mockCambioRow,
          id: i + 1,
          tipo_cambio: tipos[i]
        };
        mockExecuteQuery.mockResolvedValueOnce([mockRow]);

        // Act
        const result = await CambioModel.findById(i + 1);

        // Assert
        expect(result?.tipo_cambio).toBe(tipos[i]);
      }
    });
  });
});
