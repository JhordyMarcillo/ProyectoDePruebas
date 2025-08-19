import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler, asyncHandler } from '../../middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    mockNext = jest.fn();

    mockRequest = {
      method: 'GET',
      url: '/test'
    };

    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    // Mock // para los tests
    // = jest.fn();
    
    // Reset environment
    process.env.NODE_ENV = 'test';
    
    jest.clearAllMocks();
  });

  describe('AppError Class', () => {
    it('should create AppError with default status code 500', () => {
      // Arrange
      const message = 'Test error message';

      // Act
      const error = new AppError(message);

      // Assert
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should create AppError with custom status code', () => {
      // Arrange
      const message = 'Not found error';
      const statusCode = 404;

      // Act
      const error = new AppError(message, statusCode);

      // Assert
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.isOperational).toBe(true);
    });

    it('should capture stack trace correctly', () => {
      // Arrange
      const message = 'Stack trace test';

      // Act
      const error = new AppError(message);

      // Assert
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Stack trace test');
    });
  });

  describe('errorHandler Function', () => {
    it('should handle AppError with custom status and message', () => {
      // Arrange
      const customError = new AppError('Custom error message', 404);

      // Act
      errorHandler(customError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Custom error message'
        }
      });
    });

    it('should handle ValidationError with 400 status', () => {
      // Arrange
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';

      // Act
      errorHandler(validationError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Datos de entrada inválidos'
        }
      });
    });

    it('should handle JsonWebTokenError with 401 status', () => {
      // Arrange
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';

      // Act
      errorHandler(jwtError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Token inválido'
        }
      });
    });

    it('should handle TokenExpiredError with 401 status', () => {
      // Arrange
      const expiredTokenError = new Error('Token expired');
      expiredTokenError.name = 'TokenExpiredError';

      // Act
      errorHandler(expiredTokenError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Token expirado'
        }
      });
    });

    it('should handle generic Error with 500 status', () => {
      // Arrange
      const genericError = new Error('Generic error message');

      // Act
      errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Error interno del servidor'
        }
      });
    });

    it('should include stack trace in development environment', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const testError = new Error('Development error');
      testError.stack = 'Error stack trace';

      // Act
      errorHandler(testError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(//).toHaveBeenCalledWith('Error:', testError);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Error interno del servidor',
          stack: 'Error stack trace'
        }
      });
    });

    it('should not include stack trace in production environment', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const testError = new Error('Production error');
      testError.stack = 'Error stack trace';

      // Act
      errorHandler(testError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(//).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Error interno del servidor'
        }
      });
    });

    it('should not log error when not in development environment', () => {
      // Arrange
      process.env.NODE_ENV = 'test';
      const testError = new Error('Test error');

      // Act
      errorHandler(testError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(//).not.toHaveBeenCalled();
    });

    it('should handle AppError in development with stack trace', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const appError = new AppError('App error in development', 422);
      appError.stack = 'AppError stack trace';

      // Act
      errorHandler(appError, mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(//).toHaveBeenCalledWith('Error:', appError);
      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'App error in development',
          stack: 'AppError stack trace'
        }
      });
    });
  });

  describe('asyncHandler Function', () => {
    it('should call function and not call next when function succeeds', async () => {
      // Arrange
      const mockFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(mockFn);

      // Act
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error when function throws', async () => {
      // Arrange
      const testError = new Error('Async function error');
      const mockFn = jest.fn().mockRejectedValue(testError);
      const wrappedFn = asyncHandler(mockFn);

      // Act
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(testError);
    });

    it('should handle synchronous function that returns a value', async () => {
      // Arrange
      const mockFn = jest.fn().mockReturnValue('sync result');
      const wrappedFn = asyncHandler(mockFn);

      // Act
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle async function that calls next with error', async () => {
      // Arrange
      const testError = new AppError('Async function error', 422);
      const mockFn = jest.fn().mockImplementation(async (req, res, next) => {
        next(testError);
      });
      const wrappedFn = asyncHandler(mockFn);

      // Act
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(testError);
    });

    it('should handle async function with Promise.resolve', async () => {
      // Arrange
      const mockFn = jest.fn().mockImplementation(() => Promise.resolve('resolved'));
      const wrappedFn = asyncHandler(mockFn);

      // Act
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle async function with Promise.reject', async () => {
      // Arrange
      const testError = new AppError('Promise rejected', 400);
      const mockFn = jest.fn().mockImplementation(() => Promise.reject(testError));
      const wrappedFn = asyncHandler(mockFn);

      // Act
      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });
});
