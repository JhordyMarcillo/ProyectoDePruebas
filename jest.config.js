const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
};/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Detecta todos los archivos de test en TS
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],

  // Cobertura
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/types/**',
    '!src/config/**',
    '!src/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],


  // Transformación de TS a JS
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },

  // Soporte para imports con alias @/
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Ajustes extra
  testTimeout: 10000,
  verbose: true
};
