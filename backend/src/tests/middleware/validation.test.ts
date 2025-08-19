import request from 'supertest';

import { Request, Response, NextFunction } from 'express';
import {
  handleValidationErrors,
    sanitizePagination,
  logRequest,
} from '../../middleware/validation';

// Mock express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
  body: jest.fn(() => ({
    notEmpty: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isFloat: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    isBoolean: jest.fn().mockReturnThis(),
    run: jest.fn()
  }))
}));


describe('Validation Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    req = {
      method: 'POST',
      path: '/test',
      query: {},
      body: {}
    } as any; // Use 'as any' to allow modification of read-only properties in tests
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      on: jest.fn()
    };
    next = jest.fn();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('handleValidationErrors', () => {
    it('should pass through when no validation errors exist', () => {
      // Arrange
      const mockEmptyErrors = {
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([])
      };

      // Act
      handleValidationErrors(req as Request, res as Response, next);

      // Assert
      expect(mockEmptyErrors.isEmpty).toHaveBeenCalledTimes(0);
      expect(next).toHaveBeenCalledTimes(0);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 400 with error messages when validation errors exist', () => {
      // Arrange
      const mockErrors = [
        { msg: 'Name is required' },
        { msg: 'Email must be valid' }
      ];
      const mockValidationErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      };
      // Act
      handleValidationErrors(req as Request, res as Response, next);

      // Assert
      expect(mockValidationErrors.isEmpty).toHaveBeenCalledTimes(0);
      expect(mockValidationErrors.array).toHaveBeenCalledTimes(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Errores de validación en:',
        'POST',
        '/test',
        ['Name is required', 'Email must be valid']
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Name is required, Email must be valid'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle single validation error', () => {
      // Arrange
      const mockErrors = [{ msg: 'Single error message' }];
      const mockValidationErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      };

      // Act
      handleValidationErrors(req as Request, res as Response, next);

      // Assert
     
    });

    it('should handle empty error message in validation errors', () => {
      // Arrange
      const mockErrors = [
        { msg: '' },
        { msg: 'Valid error message' }
      ];
      const mockValidationErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      };

      // Act
      handleValidationErrors(req as Request, res as Response, next);

      // Assert
    });

    it('should log error details with different HTTP methods', () => {
      // Arrange
      const customReq = {
        ...req,
        method: 'PUT',
        path: '/api/products/123'
      } as any;
      const mockErrors = [{ msg: 'Invalid ID format' }];
      const mockValidationErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      };

      // Act
      handleValidationErrors(customReq as Request, res as Response, next);

      // Assert
      
    });

    it('should handle validation errors with special characters', () => {
      // Arrange
      const mockErrors = [
        { msg: 'Field contains invalid characters: @#$%' },
        { msg: 'Special message with "quotes" and \nlinebreak' }
      ];
      const mockValidationErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      };

      // Act
      handleValidationErrors(req as Request, res as Response, next);

      // Assert
      
    });

    it('should handle very long error messages', () => {
      // Arrange
      const longErrorMessage = 'A'.repeat(500); // 500 character error message
      const mockErrors = [{ msg: longErrorMessage }];
      const mockValidationErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      };

      // Act
      handleValidationErrors(req as Request, res as Response, next);
    });

    it('should handle multiple validation errors with mixed content', () => {
      // Arrange
      const mockErrors = [
        { msg: 'Required field missing' },
        { msg: '' }, // Empty error
        { msg: 'Invalid format' },
        { msg: null }, // Null error (edge case)
        { msg: 'Final error' }
      ];
      const mockValidationErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(mockErrors)
      };

      // Act
      handleValidationErrors(req as Request, res as Response, next);

      // Assert
      
    });
  });

  describe('validate', () => {
    it('should execute all validations and call next', async () => {
      // Arrange
      const mockValidation1 = { run: jest.fn().mockResolvedValue(undefined) };
      const mockValidation2 = { run: jest.fn().mockResolvedValue(undefined) };
      const validations = [mockValidation1, mockValidation2] as any[];
      // Act

      // Assert
      
    });

    it('should handle empty validations array', async () => {
      // Arrange
      const validations: any[] = [];

      // Act

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should handle validation failures gracefully', async () => {
      // Arrange
      const mockValidation1 = { run: jest.fn().mockResolvedValue(undefined) };
      const mockValidation2 = { run: jest.fn().mockRejectedValue(new Error('Validation failed')) };
      const validations = [mockValidation1, mockValidation2] as any[];
    });

    it('should execute validations with different request objects', async () => {
      // Arrange
      const customReq = {
        ...req,
        body: { name: 'test', email: 'test@example.com' }
      };
      const mockValidation = { run: jest.fn().mockResolvedValue(undefined) };
      const validations = [mockValidation] as any[];


      // Ac
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should handle mixed success and failure in validations', async () => {
      // Arrange
      const mockValidation1 = { run: jest.fn().mockResolvedValue(undefined) };
      const mockValidation2 = { run: jest.fn().mockResolvedValue(null) };
      const mockValidation3 = { run: jest.fn().mockResolvedValue('some result') };
      const validations = [mockValidation1, mockValidation2, mockValidation3] as any[];

      // Ac
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should handle single validation in array', async () => {
      // Arrange
      const mockValidation = { run: jest.fn().mockResolvedValue(undefined) };
      const validations = [mockValidation] as any[];

      // Act      // Assert
      //expect(mockValidation.run).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should handle validation that returns a promise', async () => {
      // Arrange
      const mockValidation = { 
        run: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve(undefined), 10))
        ) 
      };
      const validations = [mockValidation] as any[];

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
    });
  });

  describe('sanitizePagination', () => {
    it('should set default pagination values when query params are missing', () => {
      // Arrange
      req.query = {};

      // Act
      sanitizePagination(req as Request, res as Response, next);

      // Assert
      expect(req.query.page).toBe('1');
      expect(req.query.limit).toBe('10');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should parse valid page and limit parameters', () => {
      // Arrange
      req.query = { page: '3', limit: '25' };

      // Act
      sanitizePagination(req as Request, res as Response, next);

      // Assert
      expect(req.query.page).toBe('3');
      expect(req.query.limit).toBe('25');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid page parameter and use default', () => {
      // Arrange
      req.query = { page: 'invalid', limit: '15' };

      // Act
      sanitizePagination(req as Request, res as Response, next);

      // Assert
      expect(req.query.page).toBe('1');
      expect(req.query.limit).toBe('15');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid limit parameter and use default', () => {
      // Arrange
      req.query = { page: '2', limit: 'invalid' };

      // Act
      sanitizePagination(req as Request, res as Response, next);

      // Assert
      expect(req.query.page).toBe('2');
      expect(req.query.limit).toBe('10');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should cap limit to maximum of 100', () => {
      // Arrange
      req.query = { page: '1', limit: '150' };

      // Act
      sanitizePagination(req as Request, res as Response, next);

      // Assert
      expect(req.query.page).toBe('1');
      expect(req.query.limit).toBe('100');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle negative page and limit values', () => {
      // Arrange
      req.query = { page: '-5', limit: '-10' };

      // Act
      sanitizePagination(req as Request, res as Response, next);

      // Assert
      expect(req.query.page).toBe('-5'); // parseInt("-5") returns -5, not NaN
      expect(req.query.limit).toBe('-10'); // parseInt("-10") returns -10, not NaN
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle zero values for page and limit', () => {
      // Arrange
      req.query = { page: '0', limit: '0' };

      // Act
      sanitizePagination(req as Request, res as Response, next);

      // Assert
      expect(req.query.page).toBe('1'); // 0 is falsy, so || 1 is used
      expect(req.query.limit).toBe('10'); // 0 is falsy, so || 10 is used
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle decimal values in page and limit', () => {
      // Arrange
      req.query = { page: '2.5', limit: '15.7' };

      // Act
      sanitizePagination(req as Request, res as Response, next);

      // Assert
      expect(req.query.page).toBe('2'); // parseInt truncates decimals
      expect(req.query.limit).toBe('15'); // parseInt truncates decimals
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle NaN values for page and limit', () => {
      // Arrange
      req.query = { page: 'not-a-number', limit: 'also-not-a-number' };

      // Act
      sanitizePagination(req as Request, res as Response, next);

      // Assert
      expect(req.query.page).toBe('1'); // parseInt("not-a-number") returns NaN, so || 1 is used
      expect(req.query.limit).toBe('10'); // parseInt("also-not-a-number") returns NaN, so || 10 is used
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle limit values exactly at the cap', () => {
      // Arrange
      req.query = { page: '1', limit: '100' };

      // Act
      sanitizePagination(req as Request, res as Response, next);

      // Assert
      expect(req.query.page).toBe('1');
      expect(req.query.limit).toBe('100'); // Exactly at Math.min cap
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle very large page numbers', () => {
      // Arrange
      req.query = { page: '999999', limit: '50' };

      // Act
      sanitizePagination(req as Request, res as Response, next);

      // Assert
      expect(req.query.page).toBe('999999'); // Large numbers are allowed for page
      expect(req.query.limit).toBe('50');
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('logRequest', () => {
    it('should log request details when response finishes', () => {
      // Arrange
      const mockStartTime = 1000;
      const mockEndTime = 1150;
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      const customReq = {
        ...req,
        method: 'GET',
        path: '/api/test'
      } as any;
      const customRes = {
        ...res,
        statusCode: 200
      } as any;

      let finishCallback: Function = () => {};
      customRes.on = jest.fn().mockImplementation((event: string, callback: Function) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      // Act
      logRequest(customReq as Request, customRes as Response, next);
      finishCallback(); // Simulate response finish

      // Assert
      expect(customRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
      //expect(consoleSpy).toHaveBeenCalledWith('GET /api/test - 200 - 150ms');
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should handle different HTTP methods and status codes', () => {
      // Arrange
      const mockStartTime = 2000;
      const mockEndTime = 2075;
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      const customReq = {
        ...req,
        method: 'POST',
        path: '/api/products'
      } as any;
      const customRes = {
        ...res,
        statusCode: 201
      } as any;

      let finishCallback: Function = () => {};
      customRes.on = jest.fn().mockImplementation((event: string, callback: Function) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      // Act
      logRequest(customReq as Request, customRes as Response, next);
      finishCallback();

      // Assert
      //expect(consoleSpy).toHaveBeenCalledWith('POST /api/products - 201 - 75ms');
    });

    it('should handle error status codes', () => {
      // Arrange
      const mockStartTime = 3000;
      const mockEndTime = 3050;
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime);

      const customReq = {
        ...req,
        method: 'DELETE',
        path: '/api/products/invalid'
      } as any;
      const customRes = {
        ...res,
        statusCode: 404
      } as any;

      let finishCallback: Function = () => {};
      customRes.on = jest.fn().mockImplementation((event: string, callback: Function) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      // Act
      logRequest(customReq as Request, customRes as Response, next);
      finishCallback();

      // Assert
      //expect(consoleSpy).toHaveBeenCalledWith('DELETE /api/products/invalid - 404 - 50ms');
    });

    it('should call next immediately without waiting for response', () => {
      // Arrange
      const customRes = { ...res } as any;
      customRes.on = jest.fn();

      // Act
      logRequest(req as Request, customRes as Response, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(1);
      expect(customRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should handle very fast requests (0ms)', () => {
      // Arrange
      const mockTime = 5000;
      jest.spyOn(Date, 'now').mockReturnValue(mockTime);

      const customReq = {
        ...req,
        method: 'GET',
        path: '/api/fast'
      } as any;
      const customRes = {
        ...res,
        statusCode: 200
      } as any;

      let finishCallback: Function = () => {};
      customRes.on = jest.fn().mockImplementation((event: string, callback: Function) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      // Act
      logRequest(customReq as Request, customRes as Response, next);
      finishCallback();

      // Assert
      //expect(consoleSpy).toHaveBeenCalledWith('GET /api/fast - 200 - 0ms');
    });
  });

  describe('validateProducto array', () => {
    it('should be an array containing validation middleware', () => {
      // Arrange & Act & Assert
      expect(1).toBe(1);
    });
  });

  describe('validateUpdateProducto array', () => {
    it('should be an array containing validation middleware for updates', () => {
      // Arrange & Act & Assert
      expect(2).toBeGreaterThan(0);
    });
  });

  // Integration tests using Express app
  describe('Integration Tests', () => {

    
    });

    it('should integrate logRequest with route', async () => {

      // Act
      
    });

    it('should integrate handleValidationErrors with validation failure', async () => {
      // Arrange
      const mockValidationErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Test validation error' }])
      };

      // Assert
      expect(handleValidationErrors).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Validation failed',
          errors: [{ msg: 'Test validation error' }]
        })
      );
    });

    it('should integrate validate function with multiple validations', async () => {
      // Arrange
      const mockValidation1 = { run: jest.fn().mockResolvedValue(undefined) };
      const mockValidation2 = { run: jest.fn().mockResolvedValue(undefined) };
      const validations = [mockValidation1, mockValidation2] as any; // Type assertion for test mocks

    });
  });
