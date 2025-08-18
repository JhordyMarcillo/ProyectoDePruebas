import { Router } from 'express';
import { ProductoController } from '../controllers/ProductoController';
import { authenticateToken, authorizePermissions } from '../middleware/auth';
import { body, param } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Validaciones
const handleValidationErrors = (req: any, res: any, next: any) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/productos - Obtener productos con paginación y filtros
router.get('/', 
  authorizePermissions(['Productos']),
  asyncHandler(ProductoController.getAll)
);

// GET /api/productos/activos - Obtener productos activos (DEBE IR ANTES DE /:id)
router.get('/activos', 
  // Permitir acceso con cualquier permiso de estos módulos
  (req: any, res: any, next: any) => {
    const userPermisos = req.user.permisos || [];
    const requiredPermisos = ['Productos', 'Ventas', 'Servicios'];
    const hasPermission = requiredPermisos.some(permiso => userPermisos.includes(permiso));
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Sin permisos para acceder a productos'
      });
    }
    next();
  },
  asyncHandler(ProductoController.getActivos)
);

// GET /api/productos/:id - Obtener un producto específico
router.get('/:id', 
  authorizePermissions(['Productos']),
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
  handleValidationErrors,
  asyncHandler(ProductoController.getById)
);

// POST /api/productos - Crear nuevo producto
router.post(
  '/',
  authorizePermissions(['Productos']),
  body('nombre_producto').notEmpty().withMessage('El nombre es requerido'),
  body('cantidad_producto').isInt({ min: 0 }).withMessage('La cantidad debe ser un número válido'),
  body('precio_producto').isFloat({ min: 0 }).withMessage('El precio debe ser válido'),
  body('precio_compra').isFloat({ min: 0 }).withMessage('El precio de compra debe ser válido'),
  body('proveedor_producto').notEmpty().withMessage('El proveedor es requerido'),
  body('marca_producto').notEmpty().withMessage('La marca es requerida'),
  body('categoria_producto').notEmpty().withMessage('La categoría es requerida'),
  handleValidationErrors,
  asyncHandler(ProductoController.create)
);

// PUT /api/productos/:id - Actualizar producto
router.put(
  '/:id',
  authorizePermissions(['Productos']),
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
  handleValidationErrors,
  asyncHandler(ProductoController.update)
);

// DELETE /api/productos/:id - Eliminar producto
router.delete(
  '/:id',
  authorizePermissions(['Productos']),
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
  handleValidationErrors,
  asyncHandler(ProductoController.delete)
);

// PUT /api/productos/:id/toggle-status - Cambiar estado del producto
router.put(
  '/:id/toggle-status',
  authorizePermissions(['Productos']),
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
  handleValidationErrors,
  asyncHandler(ProductoController.toggleStatus)
);

// PUT /api/productos/:id/quantity - Actualizar cantidad del producto
router.put(
  '/:id/quantity',
  authorizePermissions(['Productos']),
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
  body('cantidad').isInt({ min: 0 }).withMessage('La cantidad debe ser un número válido'),
  handleValidationErrors,
  asyncHandler(ProductoController.updateQuantity)
);

// PUT /api/productos/:id/add-stock - Añadir stock al producto
router.put(
  '/:id/add-stock',
  authorizePermissions(['Productos']),
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
  body('cantidad').isInt({ min: 1 }).withMessage('La cantidad a añadir debe ser un número positivo'),
  handleValidationErrors,
  asyncHandler(ProductoController.addStock)
);

// POST /api/productos/check-stock - Verificar stock de múltiples productos
router.post(
  '/check-stock',
  authorizePermissions(['Productos', 'Ventas']),
  body('productos').isArray().withMessage('Se requiere un array de productos'),
  handleValidationErrors,
  asyncHandler(ProductoController.checkStock)
);

export default router;
