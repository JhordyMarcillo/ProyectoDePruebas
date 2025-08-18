import { Router } from 'express';
import { body, param } from 'express-validator';
import { VentaController } from '../controllers/VentaController';
import { authenticateToken, authorizePermissions } from '../middleware/auth';
import { handleValidationErrors, sanitizePagination } from '../middleware/validation';

const router = Router();

// Validación para parámetros de ID
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];

// Ruta de factura SIN autenticación (debe ir ANTES del middleware de autenticación)
// GET /api/ventas/:id/factura - Generar factura HTML (sin autenticación para simplicidad)
router.get('/:id/factura', 
  ...idValidation,
  handleValidationErrors,
  VentaController.generarFactura
);

// Todas las demás rutas requieren autenticación
router.use(authenticateToken);

// Validación para cédula
const cedulaValidation = [
  param('cedula')
    .notEmpty()
    .withMessage('La cédula es requerida')
];

// Validaciones para crear venta
const createVentaValidation = [
  body('cedula_cliente')
    .notEmpty()
    .withMessage('La cédula del cliente es requerida'),
  body('productos')
    .optional()
    .isArray()
    .withMessage('Los productos deben ser un array'),
  body('productos.*.id')
    .optional()
    .notEmpty()
    .withMessage('El ID del producto es requerido'),
  body('productos.*.cantidad')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad del producto debe ser un número entero positivo'),
  body('productos.*.costo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo del producto debe ser un número válido'),
  body('servicios')
    .optional()
    .isArray()
    .withMessage('Los servicios deben ser un array'),
  body('servicios.*.id')
    .optional()
    .notEmpty()
    .withMessage('El ID del servicio es requerido'),
  body('servicios.*.cantidad')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad del servicio debe ser un número entero positivo'),
  body('servicios.*.costo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo del servicio debe ser un número válido'),
  body('iva')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('El IVA debe ser un número entre 0 y 100'),
  body('metodo')
    .optional()
    .isIn(['efectivo', 'tarjeta', 'transferencia', 'credito'])
    .withMessage('El método de pago debe ser válido')
];

// GET /api/ventas - Obtener todas las ventas con paginación
router.get('/', 
  authorizePermissions(['Ventas', 'Reportes']),
  sanitizePagination,
  VentaController.getAll
);

// GET /api/ventas/stats - Obtener estadísticas de ventas
router.get('/stats', 
  authorizePermissions(['Ventas', 'Reportes']),
  VentaController.getStats
);

// GET /api/ventas/:id - Obtener venta por ID
router.get('/:id', 
  authorizePermissions(['Ventas', 'Reportes']),
  ...idValidation,
  handleValidationErrors,
  VentaController.getById
);

// GET /api/ventas/cliente/:cedula - Obtener ventas por cliente
router.get('/cliente/:cedula', 
  authorizePermissions(['Ventas', 'Reportes']),
  ...cedulaValidation,
  handleValidationErrors,
  VentaController.getVentasByCliente
);

// POST /api/ventas - Crear nueva venta
router.post('/', 
  authorizePermissions(['Ventas']),
  ...createVentaValidation,
  handleValidationErrors,
  VentaController.create
);

// PUT /api/ventas/:id - Actualizar venta
router.put('/:id', 
  authorizePermissions(['Ventas']),
  ...idValidation,
  handleValidationErrors,
  VentaController.update
);

// DELETE /api/ventas/:id - Eliminar venta
router.delete('/:id', 
  authorizePermissions(['Ventas']),
  ...idValidation,
  handleValidationErrors,
  VentaController.delete
);

export default router;
