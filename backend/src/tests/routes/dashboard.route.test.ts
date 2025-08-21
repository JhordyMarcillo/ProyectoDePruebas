import { jest } from '@jest/globals';
import type { Request, Response } from 'express';
import { executeQuery } from '../../config/database';

const supertest = require('supertest');
const express = require('express');
const request = supertest;

// Mock executeQuery function
const mockExecuteQuery = jest.fn() as jest.MockedFunction<typeof executeQuery>;
jest.mock('../../config/database', () => ({
  executeQuery: mockExecuteQuery
}));

// Mock auth middleware
const mockAuthenticateToken = jest.fn((req: any, res: any, next: any) => {
  // Verificar si hay un token en los headers
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
    return;
  }

  // Si hay token, establecer el usuario y continuar
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

// Create Express app
const app = express();

// Add dashboard routes
app.use('/api/dashboard', dashboardRouter);

describe('Dashboard Router - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fail without authentication token', async () => {
    const res = await request(app).get('/api/dashboard/stats');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body).toEqual({
      success: false,
      message: 'Token de acceso requerido'
    });
  });

  it('should return dashboard stats successfully with valid token', async () => {
    // Mock de executeQuery para devolver valores
    mockExecuteQuery.mockImplementation(<T>(sql: string) => {
      let result: T;
      if (sql.includes('clientes')) result = [{ total: 5 }] as T;
      else if (sql.includes('ventas')) result = [{ total: 10 }] as T;
      else if (sql.includes('productos')) result = [{ total: 20 }] as T;
      else if (sql.includes('perfiles')) result = [{ total: 3 }] as T;
      else if (sql.includes('servicios')) result = [{ total: 7 }] as T;
      else if (sql.includes('proveedores')) result = [{ total: 2 }] as T;
      else result = [{ total: 0 }] as T;
      return Promise.resolve(result);
    });

    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Estadísticas obtenidas exitosamente');
    expect(res.body.data).toBeDefined();
  });

  it('should handle executeQuery errors gracefully', async () => {
    mockExecuteQuery.mockRejectedValue(new Error('DB Error'));

    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body).toEqual({
      success: false,
      message: 'Error interno del servidor'
    });
  });

  it('should return 500 if router throws', async () => {
    // Sobrescribimos router temporalmente para lanzar error
    const errorRouter = express();
    errorRouter.get('/error', (req: Request, res: Response) => { 
      throw new Error('Test error'); 
    });
    app.use('/api/test', errorRouter);

    const res = await request(app).get('/api/test/error');

    expect(res.status).toBe(500);
  });
});
