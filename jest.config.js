/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Detecta todos los archivos de test en TS
  testMatch: ['**/src/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],

  // Cobertura
  collectCoverage: true,
  collectCoverageFrom: [
    'backend/src/**/*.ts',        // TODOS los archivos de código a cubrir
    '!backend/src/**/*.d.ts',     // Excluir definiciones de tipo
    '!backend/src/index.ts',      // Opcional: entry point si no quieres medirlo
    '!backend/src/types/**',      // Excluir tipos
    '!backend/src/config/**',     // Excluir configuración
    '!backend/src/tests/**'       // Excluir cualquier test dentro de src (si los hubiera)
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/src/$1'
  },


  globals: {
    'ts-jest': {
      useESM: true,
      diagnostics: true,
      isolatedModules: false,
    },
  },

  testTimeout: 10000,
  verbose: true,
};
