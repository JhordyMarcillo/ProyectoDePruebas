import { beforeAll, afterAll } from '@jest/globals';

// Setup de pruebas
beforeAll(async () => {
  // Configuración inicial para todas las pruebas
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = 'spa_modern_test';
});

afterAll(async () => {
  // Limpieza después de todas las pruebas
});
