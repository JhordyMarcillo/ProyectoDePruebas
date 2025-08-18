import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../core/services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:3000/api';

  beforeEach(() => {
    // Arrange - Configure testing module
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Assert - Verify no outstanding HTTP requests
    httpMock.verify();
  });

  describe('login', () => {
    it('should login successfully and store token', () => {
      // Arrange
      const loginData = {
        usuario: 'testuser',
        password: 'testpassword'
      };

      const mockResponse = {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: {
            id: 1,
            usuario: 'testuser',
            nombre: 'Test',
            apellido: 'User',
            email: 'test@example.com',
            genero: 'M',
            fecha_nacimiento: '1990-01-01',
            cedula: '12345678',
            perfil: 'admin',
            estado: 'activo',
            permisos: ['Cliente', 'Ventas']
          },
          token: 'mock-jwt-token'
        }
      };

      // Act
      service.login(loginData).subscribe((response: any) => {
        // Assert
        expect(response.success).toBe(true);
        expect(response.data.token).toBe('mock-jwt-token');
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      // Arrange
      const loginData = {
        usuario: 'testuser',
        password: 'wrongpassword'
      };

      const mockErrorResponse = {
        success: false,
        message: 'Credenciales inválidas'
      };

      // Act
      service.login(loginData).subscribe(
        (response: any) => fail('Should have failed'),
        (error: any) => {
          // Assert
          expect(error.error.success).toBe(false);
          expect(error.error.message).toBe('Credenciales inválidas');
        }
      );

      // Assert HTTP request
      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockErrorResponse, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should logout and clear stored data', () => {
      // Arrange - Set up initial logged in state
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, usuario: 'test' }));

      // Act
      service.logout();

      // Assert
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      // Arrange
      localStorage.setItem('token', 'mock-token');

      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when token does not exist', () => {
      // Arrange - localStorage is already clear

      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token when exists', () => {
      // Arrange
      localStorage.setItem('token', 'mock-token');

      // Act
      const result = service.getToken();

      // Assert
      expect(result).toBe('mock-token');
    });

    it('should return null when token does not exist', () => {
      // Arrange - localStorage is already clear

      // Act
      const result = service.getToken();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has required permission', () => {
      // Arrange
      const mockUser = {
        id: 1,
        usuario: 'testuser',
        permisos: ['Cliente', 'Ventas', 'Productos']
      };
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Act
      const result = service.hasPermission('Cliente');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user does not have required permission', () => {
      // Arrange
      const mockUser = {
        id: 1,
        usuario: 'testuser',
        permisos: ['Cliente']
      };
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Act
      const result = service.hasPermission('Productos');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when user is not logged in', () => {
      // Arrange - localStorage is already clear

      // Act
      const result = service.hasPermission('Cliente');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when user has no permissions', () => {
      // Arrange
      const mockUser = {
        id: 1,
        usuario: 'testuser',
        permisos: []
      };
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Act
      const result = service.hasPermission('Cliente');

      // Assert
      expect(result).toBe(false);
    });
  });
});
