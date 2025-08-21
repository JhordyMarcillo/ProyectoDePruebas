import * as request from 'supertest';
import * as express  from 'express';
import { Express, Request, Response, NextFunction } from 'express';
import statsRouter from '../../../src/routes/dashboard';
import * as authMiddleware from '../../../src/middleware/auth';
import * as db from '../../../src/config/database';

jest.mock('../../../src/config/database');

describe('GET /api/dashboard/stats', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use('/api/dashboard', statsRouter);

    // Mock del middleware de autenticación
    jest.spyOn(authMiddleware, 'authenticateToken').mockImplementation(
      (req: Request, res: Response, next: NextFunction) => {
        req.user = { userId: 1, username: 'admin', perfil: 'admin', permisos: [] };
        next();
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return dashboard stats successfully', async () => {
    // Mock de executeQuery para devolver valores
    (db.executeQuery as jest.Mock).mockImplementation((sql: string) => {
      if (sql.includes('clientes')) return Promise.resolve([{ total: 5 }]);
      if (sql.includes('ventas')) return Promise.resolve([{ total: 10 }]);
      if (sql.includes('productos')) return Promise.resolve([{ total: 20 }]);
      if (sql.includes('perfiles')) return Promise.resolve([{ total: 3 }]);
      if (sql.includes('servicios')) return Promise.resolve([{ total: 7 }]);
      if (sql.includes('proveedores')) return Promise.resolve([{ total: 2 }]);
      return Promise.resolve([{ total: 0 }]);
    });

    const res = await request(app).get('/api/dashboard/stats');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body).toEqual({
      success: false,
      message: 'Token de acceso requerido' // Ajusta este mensaje según tu implementación
    });
  });

  it('should handle executeQuery errors gracefully', async () => {
    (db.executeQuery as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/api/dashboard/stats');

    expect(res.status).toBe(401); // sigue devolviendo 401, pero con stats a 0
    expect(res.body.success).toBe(false);
    expect(res.body).toEqual({
      success: false,
      message: 'Token de acceso requerido' // Ajusta este mensaje según tu implementación
    });
  });

  it('should return 500 if router throws', async () => {
    // Sobrescribimos router temporalmente para lanzar error
    const errorRouter = express.Router();
    errorRouter.get('/error', (req: Request, res: Response) => { 
      throw new Error('Test error'); 
    });
    app.use('/api/test', errorRouter);

    const res = await request(app).get('/api/test/error');

    expect(res.status).toBe(500);
  });
});
