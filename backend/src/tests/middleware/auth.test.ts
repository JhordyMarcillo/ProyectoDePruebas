import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  authenticateToken,
  requirePermission,
  requireSpecificPermission,
  requireAdmin,
  requirePermissionOrRole,
  authorizePermissions
} from '../../middleware/auth';
import { config } from '../../config';
import { AuthPayload } from '../../types';

// Mocks de request, response y next
const mockRequest = {} as Partial<Request>;
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as Partial<Response>;
const mockNext = jest.fn();

// 🔹 Mock de jsonwebtoken
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../config');

const mockConfig = config as jest.Mocked<typeof config>;

/*mockJwt.verify.mockImplementation((token, secret, callback: any) => {
  const mockDecoded = {
    userId: 1,
    username: 'testuser',
    perfil: 'admin',
    permisos: ['Usuarios']
  };
  callback(null, mockDecoded);
});*/

describe('Auth Middleware', () => {
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
      headers: {},
      query: {}
    };

    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    jest.clearAllMocks();
    
    // Mock config
    mockConfig.jwt = {
      secret: 'test-secret',
      expiresIn: '24h'
    };
  });

  describe('authenticateToken', () => {
    it('should authenticate user with valid token in Authorization header', () => {
      // Arrange
      const mockDecoded: AuthPayload = {
        userId: 1,
        username: 'testuser',
        perfil: 'admin',
        permisos: ['Usuarios']
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      //mockJwt.verify.mockImplementation((token, secret, callback: any) => {
       // callback(null, mockDecoded);
      //});

      // Act
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);


      // Assert
      //expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret', expect.any(Function));
      expect(mockRequest.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should authenticate user with valid token in query parameter', () => {
      // Arrange
      const mockDecoded: AuthPayload = {
        userId: 1,
        username: 'testuser',
        perfil: 'admin',
        permisos: ['Usuarios']
      };

      mockRequest.query = {
        token: 'valid-query-token'
      };

      //mockJwt.verify.mockImplementation((token, secret, callback: any) => {
      //  callback(null, mockDecoded);
      //});

      // Act
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      //expect(mockJwt.verify).toHaveBeenCalledWith('valid-query-token', 'test-secret', expect.any(Function));
      expect(mockRequest.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', () => {
      // Arrange
      // No token in headers or query

      // Act
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Token de acceso requerido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when token is invalid', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

     // mockJwt.verify.mockImplementation((token, secret, callback: any) => {
     //   callback(new Error('Invalid token'), null);
     // });

      // Act
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Token inválido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle malformed Authorization header', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      // Act
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Token de acceso requerido'
      });
    });
  });

  describe('requirePermission', () => {
    it('should allow access when user has required role', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'testuser',
        perfil: 'admin',
        permisos: ['Usuarios']
      };

      const middleware = requirePermission(['admin', 'moderator']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should deny access when user does not have required role', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'testuser',
        perfil: 'user',
        permisos: ['Usuarios']
      };

      const middleware = requirePermission(['admin', 'moderator']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      // Arrange
      delete mockRequest.user;
      const middleware = requirePermission(['admin']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireSpecificPermission', () => {
    it('should allow access when user has required permission', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'testuser',
        perfil: 'admin',
        permisos: ['Usuarios', 'Productos']
      };

      const middleware = requireSpecificPermission('Usuarios');

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should deny access when user does not have required permission', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'testuser',
        perfil: 'admin',
        permisos: ['Productos']
      };

      const middleware = requireSpecificPermission('Usuarios');

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes permiso para Usuarios'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      // Arrange
      delete mockRequest.user;
      const middleware = requireSpecificPermission('Usuarios');

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin users', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'admin',
        perfil: 'admin',
        permisos: ['Usuarios']
      };

      // Act
      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin users', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'user',
        perfil: 'user',
        permisos: ['Usuarios']
      };

      // Act
      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Acceso restringido a administradores'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      // Arrange
      delete mockRequest.user;

      // Act
      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requirePermissionOrRole', () => {
    it('should allow access when user has required permission and role', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'testuser',
        perfil: 'admin',
        permisos: ['Usuarios']
      };

      const middleware = requirePermissionOrRole(['Usuarios'], ['admin']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should allow access when no roles specified and user has permission', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'testuser',
        perfil: 'user',
        permisos: ['Usuarios']
      };

      const middleware = requirePermissionOrRole(['Usuarios']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should deny access when user lacks required permission', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'testuser',
        perfil: 'admin',
        permisos: ['Productos']
      };

      const middleware = requirePermissionOrRole(['Usuarios'], ['admin']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when user lacks required role', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'testuser',
        perfil: 'user',
        permisos: ['Usuarios']
      };

      const middleware = requirePermissionOrRole(['Usuarios'], ['admin']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      // Arrange
      delete mockRequest.user;
      const middleware = requirePermissionOrRole(['Usuarios'], ['admin']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorizePermissions', () => {
    it('should work as an alias for requirePermissionOrRole', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'testuser',
        perfil: 'admin',
        permisos: ['Usuarios']
      };

      const middleware = authorizePermissions(['Usuarios']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should deny access when user lacks permission', () => {
      // Arrange
      mockRequest.user = {
        userId: 1,
        username: 'testuser',
        perfil: 'admin',
        permisos: ['Productos']
      };

      const middleware = authorizePermissions(['Usuarios']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
