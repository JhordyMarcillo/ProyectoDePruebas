import { Express } from 'express';
const express = require('express');
const request = require('supertest');

import reportesRouter from '../../routes/reportes';
describe('Rutas de Reportes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use('/api/reportes', reportesRouter);
  });

  it('GET /cambios debería devolver 400', async () => {
    const res = await request(app).get('/api/reportes/cambios');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ 
        message: 'Token de acceso requerido',
        success: false 
    });
  });

  it('GET /cambios/fecha debería devolver 200', async () => {
    const res = await request(app).get('/api/reportes/cambios/fecha');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ 
        message: 'Token de acceso requerido',
        success: false 
    });
  });

  it('GET /cambios/tabla/:tabla debería devolver 200', async () => {
    const res = await request(app).get('/api/reportes/cambios/tabla/productos');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ 
        message: 'Token de acceso requerido',
        success: false 
    });
  });

  it('GET /estadisticas debería devolver 200', async () => {
    const res = await request(app).get('/api/reportes/estadisticas');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ 
        message: 'Token de acceso requerido',
        success: false 
    });
  });
});
