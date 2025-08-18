import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Mock executeQuery function
const mockExecuteQuery = jest.fn() as jest.MockedFunction<any>;
jest.mock('../../config/database', () => ({
  executeQuery: mockExecuteQuery
}));

// Mock auth middleware
const mockAuthenticateToken = jest.fn((req: any, res: any, next: any) => {
  req.user = {
    id: 1,
    usuario: 'testuser', 
    permisos: ['Dashboard']
  };
  next();
});

jest.mock('../../middleware/auth', () => ({
  authenticateToken: mockAuthenticateToken
}));

// Importar router después de los mocks
import dashboardRouter from '../../routes/dashboard';

describe('Dashboard Router - Simple Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExecuteQuery.mockResolvedValue([{ total: 5 }]);
    
    app = express();
    app.use(express.json());
    app.use('/api/dashboard', dashboardRouter);
  });

  describe('GET /api/dashboard/stats', () => {
    it('should get dashboard statistics successfully', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([{ total: 10 }]);

      // Act
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          total_clientes: 10,
          total_ventas: 10,
          total_productos: 10,
          total_usuarios: 10,
          total_servicios: 10,
          total_proveedores: 10,
          ventas_hoy: 0,
          ventas_mes: 0,
          productos_bajo_stock: 0
        }
      });

      expect(mockExecuteQuery).toHaveBeenCalledTimes(6);
    });

    it('should handle empty query results', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_clientes).toBe(0);
    });

    it('should handle individual query errors gracefully', async () => {
      // Arrange
      let callCount = 0;
      mockExecuteQuery.mockImplementation(async (sql: any) => {
        callCount++;
        if (sql.includes('clientes')) {
          throw new Error('Database error');
        }
        return [{ total: 5 }];
      });
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_clientes).toBe(0); // Error case
      expect(response.body.data.total_ventas).toBe(5); // Success case
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error en consulta clients_count:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });

    it('should verify authentication middleware is applied', async () => {
      // Arrange & Act
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      // Assert
      expect(mockAuthenticateToken).toHaveBeenCalled();
      expect(response.body.success).toBe(true);
    });

    it('should handle large numbers correctly', async () => {
      // Arrange
      const largeNumber = 999999999;
      mockExecuteQuery.mockResolvedValue([{ total: largeNumber }]);

      // Act
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_clientes).toBe(largeNumber);
    });

    it('should execute queries in the correct order', async () => {
      // Arrange
      const queryCalls: string[] = [];
      mockExecuteQuery.mockImplementation(async (sql: any) => {
        if (sql.includes('clientes')) queryCalls.push('clients');
        else if (sql.includes('ventas')) queryCalls.push('sales');
        else if (sql.includes('productos')) queryCalls.push('products');
        else if (sql.includes('perfiles')) queryCalls.push('users');
        else if (sql.includes('servicios')) queryCalls.push('services');
        else if (sql.includes('proveedores')) queryCalls.push('providers');
        return [{ total: 1 }];
      });

      // Act
      await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      // Assert
      expect(queryCalls).toEqual(['clients', 'sales', 'products', 'users', 'services', 'providers']);
    });

    it('should handle null values correctly', async () => {
      // Arrange
      mockExecuteQuery.mockResolvedValue([{ total: null }]);

      // Act
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_clientes).toBe(0); // null becomes 0
    });
  });

  describe('Route Not Found', () => {
    it('should handle non-existent routes gracefully', async () => {
      // Act
      const response = await request(app)
        .get('/api/dashboard/nonexistent')
        .expect(404);

      // Assert
      expect(response.status).toBe(404);
    });
  });
});
