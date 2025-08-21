/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
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
