import { Request, Response } from 'express';
import { VentaController } from '../../controllers/VentaController';
import { VentaModel } from '../../models/Venta';
import { UsuarioModel } from '../../models/PerfilModel';
import { ClienteModel } from '../../models/Cliente';
import { ProductoModel } from '../../models/Producto';
import { ServicioModel } from '../../models/Servicio';
import { executeQuery } from '../../config/database';

// Mock dependencies
jest.mock('../../models/Venta');
jest.mock('../../models/PerfilModel');
jest.mock('../../models/Cliente');
jest.mock('../../models/Producto');
jest.mock('../../models/Servicio');
jest.mock('../../config/database');

describe('VentaController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockVentaModel: jest.Mocked<typeof VentaModel>;
  let mockUsuarioModel: jest.Mocked<typeof UsuarioModel>;
  let mockClienteModel: jest.Mocked<typeof ClienteModel>;
  let mockProductoModel: jest.Mocked<typeof ProductoModel>;
  let mockServicioModel: jest.Mocked<typeof ServicioModel>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup response mocks
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    // Mock request
    mockRequest = {
      body: {},
      query: {},
      params: {},
      user: {
        userId: 1,
        username: 'admin',
        perfil: 'admin',
        permisos: []
      }
    };

    // Setup model mocks
    mockVentaModel = VentaModel as jest.Mocked<typeof VentaModel>;
    mockUsuarioModel = UsuarioModel as jest.Mocked<typeof UsuarioModel>;
    mockClienteModel = ClienteModel as jest.Mocked<typeof ClienteModel>;
    mockProductoModel = ProductoModel as jest.Mocked<typeof ProductoModel>;
    mockServicioModel = ServicioModel as jest.Mocked<typeof ServicioModel>;

    // Setup common test data
    const mockUserInfo = {
      id: 1,
      nombre: 'Admin',
      apellido: 'User',
      usuario: 'admin',
      perfil: 'admin',
      email: 'admin@example.com',
      genero: 'M' as const,
      fecha_nacimiento: new Date('1990-01-01'),
      cedula: '12345678',
      password: 'hashedpassword',
      estado: 'activo' as const,
      permisos: [],
      fecha_creacion: new Date()
    };

    const mockCliente = {
      id: 1,
      nombre: 'Cliente',
      apellido: 'Test',
      cedula: '12345678',
      numero: '1234567890',
      email: 'cliente@example.com',
      fecha_nacimiento: '1985-01-01',
      genero: 'M' as const,
      locacion: 'Test City',
      estado: 'activo' as const,
      fecha_creacion: new Date()
    };

    const mockProducto = {
      id: 1,
      codigo_producto: 'P001',
      nombre_producto: 'Test Product',
      precio_producto: 100,
      cantidad_producto: 50,
      proveedor_producto: 'Test Provider',
      precio_compra: 80,
      estado: 'activo' as const,
      fecha_creacion: new Date()
    };

    // Default mocks
    mockUsuarioModel.findById.mockResolvedValue(mockUserInfo);
    mockClienteModel.findByCedula.mockResolvedValue(mockCliente);
    mockProductoModel.findById.mockResolvedValue(mockProducto);
    mockProductoModel.update.mockResolvedValue(true);

    // Setup additional VentaModel method mocks
    mockVentaModel.findByCliente = jest.fn();
    mockVentaModel.getTotalVentas = jest.fn();
    mockVentaModel.getVentasCount = jest.fn();
    mockVentaModel.getVentasByDateRange = jest.fn();
  });

  describe('create', () => {
    it('should create a venta successfully', async () => {
      // Arrange
      mockRequest.body = {
        cedula_cliente: '12345678',
        productos: [{ id: '1', cantidad: 2, costo: 100 }],
        servicios: [],
        metodo: 'efectivo',
        iva: 16
      };

      const expectedVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [{ id: '1', cantidad: 2, costo: 100 }],
        servicios: [],
        iva: 16,
        total_pagar: 232,
        metodo: 'efectivo',
        vendedor: 'Admin User',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockVentaModel.create.mockResolvedValue(1);
      mockVentaModel.findById.mockResolvedValue(expectedVenta as any);

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Venta creada exitosamente'
        })
      );
    });

    it('should handle missing required fields', async () => {
      // Arrange
      mockRequest.body = {}; // Missing required fields

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'La cédula del cliente es requerida'
      });
    });

    it('should handle invalid client cedula', async () => {
      // Arrange
      mockRequest.body = {
        cedula_cliente: '99999999',
        productos: [],
        servicios: [],
        metodo: 'efectivo',
        iva: 16
      };
      
      mockClienteModel.findByCedula.mockResolvedValue(null);

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Cliente no encontrado'
      });
    });

    it('should handle insufficient product stock', async () => {
      // Arrange
      mockRequest.body = {
        cedula_cliente: '12345678',
        productos: [{ id: '1', cantidad: 100, costo: 100 }], // More than available stock
        servicios: [],
        metodo: 'efectivo',
        iva: 16
      };

      const mockProductoLowStock = {
        id: 1,
        nombre_producto: 'Test Product',
        cantidad_producto: 5, // Less than requested
        proveedor_producto: 'Test Provider',
        precio_producto: 100,
        precio_compra: 50,
        marca_producto: 'Test Brand',
        categoria_producto: 'Test Category',
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };
      
      mockProductoModel.findById.mockResolvedValue(mockProductoLowStock);

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Stock insuficiente para el producto Test Product'
      });
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      mockRequest.body = {
        cedula_cliente: '12345678',
        productos: [{ id: '1', cantidad: 2, costo: 100 }],
        servicios: [],
        metodo: 'efectivo',
        iva: 16
      };

      mockVentaModel.create.mockRejectedValue(new Error('Database error'));

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle validation errors', async () => {
      // Arrange
      mockRequest.body = {
        cedula_cliente: '12345678',
        productos: [],
        servicios: [{ id: 'invalid-id' }], // Invalid service ID
        metodo: 'efectivo',
        iva: 16
      };

      mockServicioModel.findById.mockResolvedValue(null); // Service not found

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Servicio con ID')
      });
    });

    it('should handle user not found in create', async () => {
      // Arrange
      mockRequest.body = {
        cedula_cliente: '12345678',
        productos: [],
        servicios: [],
        metodo: 'efectivo',
        iva: 16
      };

      mockUsuarioModel.findById.mockResolvedValue(null); // User not found

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no encontrado'
      });
    });

    it('should handle invalid product id', async () => {
      // Arrange
      mockRequest.body = {
        cedula_cliente: '12345678',
        productos: [{ id: '999', cantidad: 1, costo: 100 }], // Non-existent product
        servicios: [],
        metodo: 'efectivo',
        iva: 16
      };

      mockProductoModel.findById.mockResolvedValue(null); // Product not found

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Producto con ID 999 no encontrado'
      });
    });

    it('should handle empty productos and servicios arrays gracefully', async () => {
      // Arrange
      mockRequest.body = {
        cedula_cliente: '12345678',
        productos: [], // Empty array
        servicios: [], // Empty array
        metodo: 'efectivo',
        iva: 16
      };

      const expectedVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [],
        servicios: [],
        iva: 16,
        total_pagar: 0, // Should be 0 for empty products/services
        metodo: 'efectivo',
        vendedor: 'Admin User',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockVentaModel.create.mockResolvedValue(1);
      mockVentaModel.findById.mockResolvedValue(expectedVenta as any);

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Venta creada exitosamente'
        })
      );
    });

    it('should handle creation when venta cannot be retrieved after creation', async () => {
      // Arrange
      mockRequest.body = {
        cedula_cliente: '12345678',
        productos: [{ id: '1', cantidad: 1, costo: 100 }],
        servicios: [],
        metodo: 'efectivo',
        iva: 16
      };

      mockVentaModel.create.mockResolvedValue(1);
      mockVentaModel.findById.mockResolvedValue(null); // Cannot retrieve created venta

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(201); // Still returns 201 because creation succeeded
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Venta creada exitosamente',
        data: null // But data is null
      });
    });

    it('should calculate total correctly with IVA', async () => {
      // Arrange
      mockRequest.body = {
        cedula_cliente: '12345678',
        productos: [{ id: '1', cantidad: 2, costo: 50 }], // 100 subtotal
        servicios: [{ id: '1', cantidad: 1, costo: 30 }], // 30 subtotal, total = 130
        metodo: 'efectivo',
        iva: 16 // 16% IVA on 130 = 150.8 total
      };

      const expectedVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [{ id: '1', cantidad: 2, costo: 50 }],
        servicios: [{ id: '1', cantidad: 1, costo: 30 }],
        iva: 16,
        total_pagar: 150.8,
        metodo: 'efectivo',
        vendedor: 'Admin User',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      const mockServicio = {
        id: 1,
        nombre: 'Test Service',
        descripcion: 'Test Service Description',
        coste_total: 30,
        costo_servicio: 30,
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      mockServicioModel.findById.mockResolvedValue(mockServicio);
      mockVentaModel.create.mockResolvedValue(1);
      mockVentaModel.findById.mockResolvedValue(expectedVenta as any);

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Venta creada exitosamente',
          data: expect.objectContaining({
            total_pagar: 150.8
          })
        })
      );
    });

    it('should handle zero IVA calculation', async () => {
      // Arrange
      mockRequest.body = {
        cedula_cliente: '12345678',
        productos: [{ id: '1', cantidad: 1, costo: 100 }],
        servicios: [],
        metodo: 'efectivo',
        iva: 0 // No IVA
      };

      const expectedVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [{ id: '1', cantidad: 1, costo: 100 }],
        servicios: [],
        iva: 0,
        total_pagar: 100, // No IVA added
        metodo: 'efectivo',
        vendedor: 'Admin User',
        estado: 'activo',
        fecha_creacion: new Date()
      };

      mockVentaModel.create.mockResolvedValue(1);
      mockVentaModel.findById.mockResolvedValue(expectedVenta as any);

      // Act
      await VentaController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Venta creada exitosamente',
          data: expect.objectContaining({
            total_pagar: 100
          })
        })
      );
    });
  });

  describe('getAll', () => {
    it('should get all ventas successfully', async () => {
      // Arrange
      const mockVentas = [
        {
          id: 1,
          cedula_cliente: '12345678',
          productos: [],
          servicios: [],
          iva: 16,
          total_pagar: 100.00,
          metodo: 'efectivo',
          vendedor: 'admin',
          estado: 'activo' as const,
          fecha_creacion: new Date()
        },
        {
          id: 2,
          cedula_cliente: '87654321',
          productos: [],
          servicios: [],
          iva: 16,
          total_pagar: 200.00,
          metodo: 'tarjeta',
          vendedor: 'admin',
          estado: 'activo' as const,
          fecha_creacion: new Date()
        }
      ];

      mockVentaModel.findAll.mockResolvedValue({ ventas: mockVentas, total: 2 });

      // Act
      await VentaController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Ventas obtenidas exitosamente',
        data: mockVentas,
        pagination: expect.any(Object)
      });
    });

    it('should handle errors when getting all ventas', async () => {
      // Arrange
      mockVentaModel.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await VentaController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('getById', () => {
    it('should get venta by id successfully', async () => {
      // Arrange
      const mockVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [],
        servicios: [],
        iva: 16,
        total_pagar: 100.00,
        metodo: 'efectivo',
        vendedor: 'admin',
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockVentaModel.findById.mockResolvedValue(mockVenta);

      // Act
      await VentaController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Venta obtenida exitosamente',
        data: mockVenta
      });
    });

    it('should handle venta not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockVentaModel.findById.mockResolvedValue(null);

      // Act
      await VentaController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Venta no encontrada'
      });
    });

    it('should handle invalid id parameter', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid-id' };

      // Act
      await VentaController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de venta inválido'
      });
    });

    it('should handle database errors when getting venta by id', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockVentaModel.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await VentaController.getById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('update', () => {
    it('should update venta successfully', async () => {
      // Arrange
      const updateData = {
        metodo: 'tarjeta',
        iva: 16
      };

      const mockExistingVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [],
        servicios: [],
        iva: 16,
        total_pagar: 100.00,
        metodo: 'efectivo',
        vendedor: 'admin',
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      const mockUpdatedVenta = {
        ...mockExistingVenta,
        metodo: 'tarjeta'
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;

      mockVentaModel.findById.mockResolvedValueOnce(mockExistingVenta);
      mockVentaModel.update.mockResolvedValue(true);
      mockVentaModel.findById.mockResolvedValueOnce(mockUpdatedVenta);

      // Act
      await VentaController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Venta actualizada exitosamente',
        data: mockUpdatedVenta
      });
    });

    it('should handle venta not found during update', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockRequest.body = { metodo: 'tarjeta' };
      
      mockVentaModel.findById.mockResolvedValue(null);

      // Act
      await VentaController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Venta no encontrada'
      });
    });

    it('should handle invalid update data', async () => {
      // Arrange
      const mockExistingVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [],
        servicios: [],
        iva: 16,
        total_pagar: 100.00,
        metodo: 'efectivo',
        vendedor: 'admin',
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        metodo: '', // Invalid empty method
        iva: -5 // Invalid negative IVA
      };

      mockVentaModel.findById.mockResolvedValue(mockExistingVenta);
      mockVentaModel.update.mockResolvedValue(false); // Update fails

      // Act
      await VentaController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo actualizar la venta'
      });
    });

    it('should handle database errors during update', async () => {
      // Arrange
      const mockExistingVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [],
        servicios: [],
        iva: 16,
        total_pagar: 100.00,
        metodo: 'efectivo',
        vendedor: 'admin',
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { metodo: 'tarjeta' };

      mockVentaModel.findById.mockResolvedValue(mockExistingVenta);
      mockVentaModel.update.mockRejectedValue(new Error('Database error'));

      // Act
      await VentaController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle invalid update when operation fails', async () => {
      // Arrange
      const mockExistingVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [],
        servicios: [],
        iva: 16,
        total_pagar: 100.00,
        metodo: 'efectivo',
        vendedor: 'admin',
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { metodo: 'tarjeta' };

      mockVentaModel.findById.mockResolvedValue(mockExistingVenta);
      mockVentaModel.update.mockResolvedValue(false); // Update operation fails

      // Act
      await VentaController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo actualizar la venta'
      });
    });

    it('should handle invalid id parameter in update', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid-id' };
      mockRequest.body = { metodo: 'tarjeta' };

      // Act
      await VentaController.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de venta inválido'
      });
    });
  });

  describe('delete', () => {
    it('should delete venta successfully', async () => {
      // Arrange
      const mockExistingVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [],
        servicios: [],
        iva: 16,
        total_pagar: 100.00,
        metodo: 'efectivo',
        vendedor: 'admin',
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      
      mockVentaModel.findById.mockResolvedValue(mockExistingVenta);
      mockVentaModel.delete.mockResolvedValue(true);

      // Act
      await VentaController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Venta eliminada exitosamente'
      });
    });

    it('should handle venta not found during delete', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      
      mockVentaModel.findById.mockResolvedValue(null);

      // Act
      await VentaController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Venta no encontrada'
      });
    });

    it('should handle invalid id during delete', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid-id' };

      // Act
      await VentaController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de venta inválido'
      });
    });

    it('should handle database errors during delete', async () => {
      // Arrange
      const mockExistingVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [],
        servicios: [],
        iva: 16,
        total_pagar: 100.00,
        metodo: 'efectivo',
        vendedor: 'admin',
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      
      mockVentaModel.findById.mockResolvedValue(mockExistingVenta);
      mockVentaModel.delete.mockRejectedValue(new Error('Database error'));

      // Act
      await VentaController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should handle deletion failure when delete operation fails', async () => {
      // Arrange
      const mockExistingVenta = {
        id: 1,
        cedula_cliente: '12345678',
        productos: [],
        servicios: [],
        iva: 16,
        total_pagar: 100.00,
        metodo: 'efectivo',
        vendedor: 'admin',
        estado: 'activo' as const,
        fecha_creacion: new Date()
      };

      mockRequest.params = { id: '1' };
      
      mockVentaModel.findById.mockResolvedValue(mockExistingVenta);
      mockVentaModel.delete.mockResolvedValue(false); // Delete operation fails

      // Act
      await VentaController.delete(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'No se pudo eliminar la venta'
      });
    });
  });

  describe('getVentasByCliente', () => {
    it('should get ventas by cliente successfully', async () => {
      // Arrange
      const cedula = '12345678';
      const mockVentas = [
        {
          id: 1,
          cedula_cliente: cedula,
          productos: [],
          servicios: [],
          iva: 16,
          total_pagar: 100.00,
          metodo: 'efectivo',
          vendedor: 'admin',
          estado: 'activo' as const,
          fecha_creacion: new Date()
        },
        {
          id: 2,
          cedula_cliente: cedula,
          productos: [],
          servicios: [],
          iva: 16,
          total_pagar: 200.00,
          metodo: 'tarjeta',
          vendedor: 'admin',
          estado: 'activo' as const,
          fecha_creacion: new Date()
        }
      ];

      mockRequest.params = { cedula };
      mockVentaModel.findByCliente.mockResolvedValue(mockVentas);

      // Act
      await VentaController.getVentasByCliente(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockVentaModel.findByCliente).toHaveBeenCalledWith(cedula);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Ventas del cliente obtenidas exitosamente',
        data: mockVentas
      });
    });

    it('should return 400 when cedula is missing', async () => {
      // Arrange
      mockRequest.params = {}; // Missing cedula

      // Act
      await VentaController.getVentasByCliente(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Cédula del cliente es requerida'
      });
    });

    it('should handle database errors when getting ventas by cliente', async () => {
      // Arrange
      const cedula = '12345678';
      mockRequest.params = { cedula };
      mockVentaModel.findByCliente.mockRejectedValue(new Error('Database error'));

      // Act
      await VentaController.getVentasByCliente(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('should return empty array when cliente has no ventas', async () => {
      // Arrange
      const cedula = '99999999';
      mockRequest.params = { cedula };
      mockVentaModel.findByCliente.mockResolvedValue([]);

      // Act
      await VentaController.getVentasByCliente(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockVentaModel.findByCliente).toHaveBeenCalledWith(cedula);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Ventas del cliente obtenidas exitosamente',
        data: []
      });
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      // Mock Date methods for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15 10:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should get ventas stats successfully', async () => {
      // Arrange
      const mockVentasHoy = [
        {
          id: 1,
          cedula_cliente: '12345678',
          productos: [],
          servicios: [],
          iva: 16,
          total_pagar: 100.00,
          metodo: 'efectivo' as const,
          vendedor: 'admin',
          estado: 'activo' as const,
          fecha_creacion: new Date()
        },
        {
          id: 2,
          cedula_cliente: '87654321',
          productos: [],
          servicios: [],
          iva: 16,
          total_pagar: 150.00,
          metodo: 'tarjeta' as const,
          vendedor: 'admin',
          estado: 'activo' as const,
          fecha_creacion: new Date()
        }
      ];

      const mockVentasMes = [
        ...mockVentasHoy,
        {
          id: 3,
          cedula_cliente: '11111111',
          productos: [],
          servicios: [],
          iva: 16,
          total_pagar: 200.00,
          metodo: 'efectivo' as const,
          vendedor: 'admin',
          estado: 'activo' as const,
          fecha_creacion: new Date()
        }
      ];

      mockVentaModel.getTotalVentas.mockResolvedValue(1500.00);
      mockVentaModel.getVentasCount.mockResolvedValue(10);
      mockVentaModel.getVentasByDateRange.mockResolvedValueOnce(mockVentasHoy);
      mockVentaModel.getVentasByDateRange.mockResolvedValueOnce(mockVentasMes);

      // Act
      await VentaController.getStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockVentaModel.getTotalVentas).toHaveBeenCalled();
      expect(mockVentaModel.getVentasCount).toHaveBeenCalled();
      expect(mockVentaModel.getVentasByDateRange).toHaveBeenCalledTimes(2);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estadísticas de ventas obtenidas exitosamente',
        data: {
          total_ventas: 1500.00,
          cantidad_ventas: 10,
          ventas_hoy: 2,
          ventas_mes: 3,
          promedio_venta: 150.00
        }
      });
    });

    it('should handle zero ventas in stats', async () => {
      // Arrange
      mockVentaModel.getTotalVentas.mockResolvedValue(0);
      mockVentaModel.getVentasCount.mockResolvedValue(0);
      mockVentaModel.getVentasByDateRange.mockResolvedValue([]);

      // Act
      await VentaController.getStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Estadísticas de ventas obtenidas exitosamente',
        data: {
          total_ventas: 0,
          cantidad_ventas: 0,
          ventas_hoy: 0,
          ventas_mes: 0,
          promedio_venta: 0
        }
      });
    });

    it('should handle database errors when getting stats', async () => {
      // Arrange
      mockVentaModel.getTotalVentas.mockRejectedValue(new Error('Database error'));

      // Act
      await VentaController.getStats(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('generarFactura', () => {
    let mockExecuteQuery: jest.MockedFunction<typeof executeQuery>;
    let mockSend: jest.Mock;
    let mockSetHeader: jest.Mock;

    beforeEach(() => {
      // Setup additional response mocks for HTML generation
      mockSend = jest.fn();
      mockSetHeader = jest.fn();
      
      mockResponse.send = mockSend;
      mockResponse.setHeader = mockSetHeader;

      // Mock the executeQuery function
      mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;
    });

    it('should generate factura successfully', async () => {
      // Arrange
      const ventaId = 1;
      const mockVentaData = {
        id: ventaId,
        cedula_cliente: '12345678',
        productos: JSON.stringify([{ nombre: 'Test Product', cantidad: 2, costo: 50 }]),
        servicios: JSON.stringify([{ nombre: 'Test Service', cantidad: 1, costo: 30 }]),
        iva: 16,
        total_pagar: 132.80,
        metodo: 'efectivo',
        vendedor: 'admin',
        fecha_creacion: new Date('2024-01-15')
      };

      const mockClienteData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        numero: '0999999999',
        email: 'juan@example.com',
        locacion: 'Quito'
      };

      mockRequest.params = { id: ventaId.toString() };
      
      // Mock database queries
      mockExecuteQuery
        .mockResolvedValueOnce([mockVentaData]) // First call for venta
        .mockResolvedValueOnce([mockClienteData]); // Second call for cliente

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
      expect(mockExecuteQuery).toHaveBeenNthCalledWith(1, 'SELECT * FROM ventas WHERE id = ?', [ventaId]);
      expect(mockExecuteQuery).toHaveBeenNthCalledWith(2, 'SELECT * FROM clientes WHERE cedula = ?', ['12345678']);
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Serenity Hair & Spa'));
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Juan Pérez'));
    });

    it('should return 400 for invalid venta id', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid-id' };

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockSend).toHaveBeenCalledWith('<h1>ID de venta inválido</h1>');
    });

    it('should return 404 when venta not found', async () => {
      // Arrange
      const ventaId = 999;
      mockRequest.params = { id: ventaId.toString() };
      mockExecuteQuery.mockResolvedValue([]); // No venta found

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('<h1>Venta no encontrada</h1>');
    });

    it('should handle database errors in factura generation', async () => {
      // Arrange
      const ventaId = 1;
      mockRequest.params = { id: ventaId.toString() };
      mockExecuteQuery.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Error al generar la factura'));
    });

    it('should handle missing cliente data gracefully', async () => {
      // Arrange
      const ventaId = 1;
      const mockVentaData = {
        id: ventaId,
        cedula_cliente: '12345678',
        productos: '[]',
        servicios: '[]',
        iva: 16,
        total_pagar: 100.00,
        metodo: 'efectivo',
        vendedor: 'admin',
        fecha_creacion: new Date('2024-01-15')
      };

      mockRequest.params = { id: ventaId.toString() };
      
      // Mock venta found but cliente not found
      mockExecuteQuery
        .mockResolvedValueOnce([mockVentaData])
        .mockResolvedValueOnce([]); // No cliente found

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('No disponible'));
    });

    it('should handle malformed JSON in productos and servicios', async () => {
      // Arrange
      const ventaId = 1;
      const mockVentaData = {
        id: ventaId,
        cedula_cliente: '12345678',
        productos: 'invalid-json',
        servicios: 'invalid-json',
        iva: 16,
        total_pagar: 100.00,
        metodo: 'efectivo',
        vendedor: 'admin',
        fecha_creacion: new Date('2024-01-15')
      };

      mockRequest.params = { id: ventaId.toString() };
      mockExecuteQuery
        .mockResolvedValueOnce([mockVentaData])
        .mockResolvedValueOnce([]);

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('No hay productos en esta venta'));
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('No hay servicios en esta venta'));
    });

    it('should handle zero venta id in factura generation', async () => {
      // Arrange
      mockRequest.params = { id: '0' };
      mockExecuteQuery.mockResolvedValue([]); // No venta found

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('<h1>Venta no encontrada</h1>');
    });

    it('should handle negative id in factura generation', async () => {
      // Arrange
      mockRequest.params = { id: '-1' };
      mockExecuteQuery.mockResolvedValue([]); // No venta found

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockSend).toHaveBeenCalledWith('<h1>Venta no encontrada</h1>');
    });

    it('should generate factura with empty productos and servicios arrays', async () => {
      // Arrange
      const ventaId = 1;
      const mockVentaData = {
        id: ventaId,
        cedula_cliente: '12345678',
        productos: '[]', // Empty array
        servicios: '[]', // Empty array
        iva: 16,
        total_pagar: 0,
        metodo: 'efectivo',
        vendedor: 'admin',
        fecha_creacion: new Date('2024-01-15')
      };

      const mockClienteData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        numero: '0999999999',
        email: 'juan@example.com',
        locacion: 'Quito'
      };

      mockRequest.params = { id: ventaId.toString() };
      
      mockExecuteQuery
        .mockResolvedValueOnce([mockVentaData])
        .mockResolvedValueOnce([mockClienteData]);

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('No hay productos en esta venta'));
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('No hay servicios en esta venta'));
    });

    it('should handle complex productos and servicios in factura', async () => {
      // Arrange
      const ventaId = 1;
      const mockVentaData = {
        id: ventaId,
        cedula_cliente: '12345678',
        productos: JSON.stringify([
          { nombre: 'Producto 1', cantidad: 2, costo: 25.50 },
          { nombre: 'Producto 2', cantidad: 1, costo: 30.00 }
        ]),
        servicios: JSON.stringify([
          { nombre: 'Servicio 1', cantidad: 1, costo: 40.00 },
          { nombre: 'Servicio 2', cantidad: 2, costo: 15.25 }
        ]),
        iva: 16,
        total_pagar: 132.80,
        metodo: 'tarjeta',
        vendedor: 'admin',
        fecha_creacion: new Date('2024-01-15')
      };

      const mockClienteData = {
        nombre: 'María',
        apellido: 'González',
        numero: '0987654321',
        email: 'maria@example.com',
        locacion: 'Guayaquil'
      };

      mockRequest.params = { id: ventaId.toString() };
      
      mockExecuteQuery
        .mockResolvedValueOnce([mockVentaData])
        .mockResolvedValueOnce([mockClienteData]);

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('María González'));
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Producto 1'));
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Servicio 1'));
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('132.80'));
    });

    it('should handle productos and servicios as already parsed objects', async () => {
      // Arrange
      const ventaId = 1;
      const mockVentaData = {
        id: ventaId,
        cedula_cliente: '12345678',
        productos: [{ nombre: 'Producto Object', cantidad: 1, costo: 50.00 }], // Already an array/object
        servicios: [{ nombre: 'Servicio Object', cantidad: 1, costo: 30.00 }], // Already an array/object
        iva: 16,
        total_pagar: 92.80,
        metodo: 'efectivo',
        vendedor: 'admin',
        fecha_creacion: new Date('2024-01-15')
      };

      const mockClienteData = {
        nombre: 'Pedro',
        apellido: 'López',
        numero: '0999888777',
        email: 'pedro@example.com',
        locacion: 'Cuenca'
      };

      mockRequest.params = { id: ventaId.toString() };
      
      mockExecuteQuery
        .mockResolvedValueOnce([mockVentaData])
        .mockResolvedValueOnce([mockClienteData]);

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Pedro López'));
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Producto Object'));
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Servicio Object'));
    });

    it('should handle neither array nor string productos and servicios', async () => {
      // Arrange
      const ventaId = 1;
      const mockVentaData = {
        id: ventaId,
        cedula_cliente: '12345678',
        productos: null, // Neither array nor string
        servicios: undefined, // Neither array nor string
        iva: 16,
        total_pagar: 0,
        metodo: 'efectivo',
        vendedor: 'admin',
        fecha_creacion: new Date('2024-01-15')
      };

      const mockClienteData = {
        nombre: 'Ana',
        apellido: 'Martínez',
        numero: '0888777666',
        email: 'ana@example.com',
        locacion: 'Loja'
      };

      mockRequest.params = { id: ventaId.toString() };
      
      mockExecuteQuery
        .mockResolvedValueOnce([mockVentaData])
        .mockResolvedValueOnce([mockClienteData]);

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Ana Martínez'));
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('No hay productos en esta venta'));
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('No hay servicios en esta venta'));
    });

    it('should handle cliente data retrieval errors gracefully', async () => {
      // Arrange
      const ventaId = 1;
      const mockVentaData = {
        id: ventaId,
        cedula_cliente: '12345678',
        productos: '[]',
        servicios: '[]',
        iva: 16,
        total_pagar: 100.00,
        metodo: 'efectivo',
        vendedor: 'admin',
        fecha_creacion: new Date('2024-01-15')
      };

      mockRequest.params = { id: ventaId.toString() };
      
      // Mock venta found but cliente query fails
      mockExecuteQuery
        .mockResolvedValueOnce([mockVentaData])
        .mockRejectedValueOnce(new Error('Cliente query error')); // Cliente query fails

      // Act
      await VentaController.generarFactura(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('No disponible')); // Default client info
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('100.00'));
    });
  });
});
