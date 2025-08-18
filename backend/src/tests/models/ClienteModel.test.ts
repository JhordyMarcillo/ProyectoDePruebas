import { ClienteModel } from '../../models/Cliente';
import { executeQuery } from '../../config/database';

// Mock database
jest.mock('../../config/database');

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;

describe('ClienteModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all clientes with pagination', async () => {
      // Arrange
      const mockRows = [
        {
          id: 1,
          nombre: 'Juan',
          apellido: 'Pérez',
          cedula: '1234567890',
          numero: '123456789',
          email: 'juan@example.com',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];

      const mockCountResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockRows)
        .mockResolvedValueOnce(mockCountResult);

      // Act
      const result = await ClienteModel.findAll(10, 0);

      // Assert
      expect(result.clientes).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.clientes[0]?.cedula).toBe('1234567890');
    });

    it('should handle search parameter', async () => {
      // Arrange
      const mockRows: any[] = [];
      const mockCountResult = [{ total: 0 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockRows as any[])
        .mockResolvedValueOnce(mockCountResult);

      // Act
      const result = await ClienteModel.findAll(10, 0, 'searchterm');

      // Assert
      expect(result.clientes).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['%searchterm%'])
      );
    });
  });

  describe('findById', () => {
    it('should return cliente by id', async () => {
      // Arrange
      const mockRow = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '123456789',
        email: 'juan@example.com',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockRow]);

      // Act
      const result = await ClienteModel.findById(1);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.cedula).toBe('1234567890');
    });

    it('should return null when cliente not found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ClienteModel.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByCedula', () => {
    it('should return cliente by cedula', async () => {
      // Arrange
      const mockRow = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '123456789',
        email: 'juan@example.com',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockRow]);

      // Act
      const result = await ClienteModel.findByCedula('1234567890');

      // Assert
      expect(result).toBeDefined();
      expect(result?.cedula).toBe('1234567890');
    });

    it('should return null when cedula not found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ClienteModel.findByCedula('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new cliente', async () => {
      // Arrange
      const clienteData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '123456789',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M' as const,
        estado: 'activo' as const
      };

      mockExecuteQuery.mockResolvedValue({ insertId: 1 });

      // Act
      const result = await ClienteModel.create(clienteData);

      // Assert
      expect(result).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO clientes'),
        expect.arrayContaining([
          clienteData.nombre,
          clienteData.apellido,
          clienteData.cedula,
          clienteData.numero,
          clienteData.email
        ])
      );
    });
  });

  describe('update', () => {
    it('should update existing cliente', async () => {
      // Arrange
      const updateData = {
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        numero: '987654321',
        email: 'juan.carlos@example.com'
      };

      mockExecuteQuery.mockResolvedValue({ affectedRows: 1 });

      // Act
      const result = await ClienteModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when cliente not found for update', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue({ affectedRows: 0 });

      // Act
      const result = await ClienteModel.update(999, { nombre: 'Test' });

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete cliente', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue({ affectedRows: 1 });

      // Act
      const result = await ClienteModel.delete(1);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when cliente not found for deletion', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue({ affectedRows: 0 });

      // Act
      const result = await ClienteModel.delete(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getActiveCount', () => {
    it('should return count of active clientes', async () => {
      // Arrange
      const mockCountResult = [{ total: 5 }];
      mockExecuteQuery.mockResolvedValue(mockCountResult);

      // Act
      const result = await ClienteModel.getActiveCount();

      // Assert
      expect(result).toBe(5);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "SELECT COUNT(*) as total FROM clientes WHERE estado = 'activo'"
      );
    });

    it('should return 0 when no active clientes found', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const result = await ClienteModel.getActiveCount();

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when total is undefined', async () => {
      // Arrange
      const mockCountResult = [{ total: undefined }];
      mockExecuteQuery.mockResolvedValue(mockCountResult);

      // Act
      const result = await ClienteModel.getActiveCount();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('update - comprehensive field testing', () => {
    it('should update cliente with all optional fields', async () => {
      // Arrange
      const updateData = {
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        cedula: '0987654321',
        numero: '987654321',
        email: 'juan.carlos@example.com',
        fecha_nacimiento: '1985-05-15',
        genero: 'M' as const,
        locacion: 'Quito',
        estado: 'inactivo' as const
      };

      mockExecuteQuery.mockResolvedValue({ affectedRows: 1 });

      // Act
      const result = await ClienteModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE clientes SET nombre = ?, apellido = ?, cedula = ?, numero = ?, email = ?, fecha_nacimiento = ?, genero = ?, locacion = ?, estado = ?'),
        expect.arrayContaining([
          'Juan Carlos',
          'Pérez García',
          '0987654321',
          '987654321',
          'juan.carlos@example.com',
          '1985-05-15',
          'M',
          'Quito',
          'inactivo',
          1
        ])
      );
    });

    it('should update only specific fields', async () => {
      // Arrange
      const updateData = {
        fecha_nacimiento: '1990-12-25',
        genero: 'F' as const
      };

      mockExecuteQuery.mockResolvedValue({ affectedRows: 1 });

      // Act
      const result = await ClienteModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE clientes SET fecha_nacimiento = ?, genero = ? WHERE id = ?',
        ['1990-12-25', 'F', 1]
      );
    });

    it('should update locacion field', async () => {
      // Arrange
      const updateData = {
        locacion: 'Guayaquil'
      };

      mockExecuteQuery.mockResolvedValue({ affectedRows: 1 });

      // Act
      const result = await ClienteModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE clientes SET locacion = ? WHERE id = ?',
        ['Guayaquil', 1]
      );
    });

    it('should update estado field', async () => {
      // Arrange
      const updateData = {
        estado: 'inactivo' as const
      };

      mockExecuteQuery.mockResolvedValue({ affectedRows: 1 });

      // Act
      const result = await ClienteModel.update(1, updateData);

      // Assert
      expect(result).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        'UPDATE clientes SET estado = ? WHERE id = ?',
        ['inactivo', 1]
      );
    });

    it('should return false when no fields provided for update', async () => {
      // Arrange
      const updateData = {};

      // Act
      const result = await ClienteModel.update(1, updateData);

      // Assert
      expect(result).toBe(false);
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it('should return false when update affects no rows', async () => {
      // Arrange
      const updateData = { nombre: 'Test' };
      mockExecuteQuery.mockResolvedValue({ affectedRows: 0 });

      // Act
      const result = await ClienteModel.update(999, updateData);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('create - comprehensive testing', () => {
    it('should create cliente with all fields including optional ones', async () => {
      // Arrange
      const clienteData = {
        nombre: 'María',
        apellido: 'González',
        cedula: '0987654321',
        numero: '0987654321',
        email: 'maria@example.com',
        fecha_nacimiento: '1990-05-15',
        genero: 'F' as const,
        locacion: 'Quito',
        estado: 'activo' as const
      };

      mockExecuteQuery.mockResolvedValue({ insertId: 2 });

      // Act
      const result = await ClienteModel.create(clienteData);

      // Assert
      expect(result).toBe(2);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO clientes'),
        [
          'María',
          'González',
          '0987654321',
          '0987654321',
          'maria@example.com',
          '1990-05-15',
          'F',
          'Quito',
          'activo'
        ]
      );
    });

    it('should create cliente with minimal required data', async () => {
      // Arrange
      const clienteData = {
        nombre: 'Pedro',
        apellido: 'Ruiz',
        cedula: '1122334455',
        numero: '1122334455',
        fecha_nacimiento: '1985-01-01',
        genero: 'M' as const,
        estado: 'activo' as const
      };

      mockExecuteQuery.mockResolvedValue({ insertId: 3 });

      // Act
      const result = await ClienteModel.create(clienteData);

      // Assert
      expect(result).toBe(3);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO clientes'),
        [
          'Pedro',
          'Ruiz',
          '1122334455',
          '1122334455',
          null, // email (optional, becomes null)
          '1985-01-01',
          'M',
          null, // locacion (optional, becomes null)
          'activo'
        ]
      );
    });
  });

  describe('findAll - edge cases', () => {
    it('should handle empty search results', async () => {
      // Arrange
      const mockRows: any[] = [];
      const mockCountResult = [{ total: 0 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockRows)
        .mockResolvedValueOnce(mockCountResult);

      // Act
      const result = await ClienteModel.findAll(10, 0);

      // Assert
      expect(result.clientes).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle total result without total field', async () => {
      // Arrange
      const mockRows: any[] = [];
      const mockCountResult: any[] = [];

      mockExecuteQuery
        .mockResolvedValueOnce(mockRows)
        .mockResolvedValueOnce(mockCountResult);

      // Act
      const result = await ClienteModel.findAll(10, 0);

      // Assert
      expect(result.clientes).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle complete cliente data mapping', async () => {
      // Arrange
      const mockRows = [
        {
          id: 1,
          nombre: 'Ana',
          apellido: 'Martínez',
          cedula: '1357924680',
          numero: '0991234567',
          email: 'ana@example.com',
          fecha_nacimiento: '1988-03-20',
          genero: 'F',
          locacion: 'Cuenca',
          estado: 'activo',
          fecha_creacion: new Date('2024-01-15')
        }
      ];

      const mockCountResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockRows)
        .mockResolvedValueOnce(mockCountResult);

      // Act
      const result = await ClienteModel.findAll(10, 0);

      // Assert
      expect(result.clientes).toHaveLength(1);
      expect(result.clientes[0]).toEqual({
        id: 1,
        nombre: 'Ana',
        apellido: 'Martínez',
        cedula: '1357924680',
        numero: '0991234567',
        email: 'ana@example.com',
        fecha_nacimiento: '1988-03-20',
        genero: 'F',
        locacion: 'Cuenca',
        estado: 'activo',
        fecha_creacion: new Date('2024-01-15')
      });
    });
  });

  describe('findById - edge cases', () => {
    it('should handle cliente with all optional fields populated', async () => {
      // Arrange
      const mockRow = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
        numero: '123456789',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        locacion: 'Quito',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockRow]);

      // Act
      const result = await ClienteModel.findById(1);

      // Assert
      expect(result).toBeDefined();
      expect(result?.email).toBe('juan@example.com');
      expect(result?.fecha_nacimiento).toBe('1990-01-01');
      expect(result?.genero).toBe('M');
      expect(result?.locacion).toBe('Quito');
    });
  });

  describe('findByCedula - edge cases', () => {
    it('should handle cedula with complete cliente data', async () => {
      // Arrange
      const mockRow = {
        id: 2,
        nombre: 'Carlos',
        apellido: 'Silva',
        cedula: '0987654321',
        numero: '0987654321',
        email: 'carlos@example.com',
        fecha_nacimiento: '1975-11-30',
        genero: 'M',
        locacion: 'Ambato',
        estado: 'inactivo',
        fecha_creacion: new Date()
      };

      mockExecuteQuery.mockResolvedValue([mockRow]);

      // Act
      const result = await ClienteModel.findByCedula('0987654321');

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(2);
      expect(result?.nombre).toBe('Carlos');
      expect(result?.estado).toBe('inactivo');
      expect(result?.locacion).toBe('Ambato');
    });
  });

  describe('create - edge cases for default values', () => {
    it('should handle missing email and set to null', async () => {
      // Arrange
      const clienteData = {
        nombre: 'Test',
        apellido: 'User',
        cedula: '1111111111',
        numero: '1111111111',
        fecha_nacimiento: '1990-01-01',
        genero: 'M' as const,
        estado: 'activo' as const
        // email is omitted to test the || null branch
      };

      mockExecuteQuery.mockResolvedValue({ insertId: 4 });

      // Act
      const result = await ClienteModel.create(clienteData);

      // Assert
      expect(result).toBe(4);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO clientes'),
        [
          'Test',
          'User',
          '1111111111',
          '1111111111',
          null, // email should be null when omitted
          '1990-01-01',
          'M',
          null,
          'activo'
        ]
      );
    });

    it('should handle empty string email and set to null', async () => {
      // Arrange
      const clienteData = {
        nombre: 'Test',
        apellido: 'User',
        cedula: '2222222222',
        numero: '2222222222',
        fecha_nacimiento: '1985-01-01',
        genero: 'F' as const,
        estado: 'activo' as const,
        email: '' // Empty string should trigger || null
      };

      mockExecuteQuery.mockResolvedValue({ insertId: 5 });

      // Act
      const result = await ClienteModel.create(clienteData);

      // Assert
      expect(result).toBe(5);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO clientes'),
        [
          'Test',
          'User',
          '2222222222',
          '2222222222',
          null, // empty string email should become null
          '1985-01-01',
          'F',
          null,
          'activo'
        ]
      );
    });

    it('should handle missing locacion and set to null', async () => {
      // Arrange
      const clienteData = {
        nombre: 'Test',
        apellido: 'User',
        cedula: '3333333333',
        numero: '3333333333',
        fecha_nacimiento: '1992-01-01',
        genero: 'M' as const,
        estado: 'activo' as const
        // locacion is omitted to test the || null branch
      };

      mockExecuteQuery.mockResolvedValue({ insertId: 6 });

      // Act
      const result = await ClienteModel.create(clienteData);

      // Assert
      expect(result).toBe(6);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO clientes'),
        [
          'Test',
          'User',
          '3333333333',
          '3333333333',
          null,
          '1992-01-01',
          'M',
          null, // locacion should be null when omitted
          'activo'
        ]
      );
    });

    it('should handle missing estado and default to activo', async () => {
      // Arrange - Test by creating an object without estado and then removing it
      const baseData = {
        nombre: 'Test',
        apellido: 'User',
        cedula: '4444444444',
        numero: '4444444444',
        fecha_nacimiento: '1988-01-01',
        genero: 'F' as const,
        estado: 'inactivo' as const
      };
      
      // Remove estado to test the default fallback
      const { estado, ...clienteData } = baseData;

      mockExecuteQuery.mockResolvedValue({ insertId: 7 });

      // Act
      const result = await ClienteModel.create(clienteData as any);

      // Assert
      expect(result).toBe(7);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO clientes'),
        [
          'Test',
          'User',
          '4444444444',
          '4444444444',
          null,
          '1988-01-01',
          'F',
          null,
          'activo' // estado should default to 'activo' when missing
        ]
      );
    });
  });

  describe('findAll - default parameter coverage', () => {
    it('should use default limit and offset when not provided', async () => {
      // Arrange
      const mockRows = [
        {
          id: 1,
          nombre: 'Test',
          apellido: 'User',
          cedula: '1234567890',
          numero: '123456789',
          email: 'test@example.com',
          fecha_nacimiento: '1990-01-01',
          genero: 'M',
          locacion: 'Quito',
          estado: 'activo',
          fecha_creacion: new Date()
        }
      ];

      const mockCountResult = [{ total: 1 }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockRows)
        .mockResolvedValueOnce(mockCountResult);

      // Act - Call without parameters to test defaults
      const result = await ClienteModel.findAll();

      // Assert
      expect(result.clientes).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ? OFFSET ?'),
        [10, 0] // Should use default limit=10, offset=0
      );
    });
  });
});
