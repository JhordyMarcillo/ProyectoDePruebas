import { Router } from 'express';
import { body, param } from 'express-validator';
import { ServicioController } from '../controllers/ServicioController';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors, sanitizePagination } from '../middleware/validation';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Validación para parámetros de ID
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
];

// Validación para crear servicios
const createServicioValidation = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre del servicio es requerido')
    .isLength({ min: 3 })
    .withMessage('El nombre debe tener al menos 3 caracteres'),
  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('costo_servicio')
    .isFloat({ min: 0 })
    .withMessage('El costo del servicio debe ser un número válido mayor o igual a 0'),
  body('productos')
    .optional()
    .isArray()
    .withMessage('Los productos deben ser un array'),
  body('productos.*.id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo'),
  body('productos.*.cantidad')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad del producto debe ser un número entero positivo'),
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo'])
    .withMessage('El estado debe ser "activo" o "inactivo"')
];

// Validación para actualizar servicios
const updateServicioValidation = [
  body('nombre')
    .optional()
    .isLength({ min: 3 })
    .withMessage('El nombre debe tener al menos 3 caracteres'),
  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('costo_servicio')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo del servicio debe ser un número válido mayor o igual a 0'),
  body('productos')
    .optional()
    .isArray()
    .withMessage('Los productos deben ser un array'),
  body('productos.*.id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero positivo'),
  body('productos.*.cantidad')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad del producto debe ser un número entero positivo'),
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo'])
    .withMessage('El estado debe ser "activo" o "inactivo"')
];

// GET /api/servicios - Obtener todos los servicios con paginación
router.get('/', 
  ServicioController.getAll
);

// GET /api/servicios/activos - Obtener servicios activos (para selección en formularios)
// IMPORTANTE: Esta ruta debe estar ANTES de /:id para evitar conflictos
router.get('/activos', 
  ServicioController.getActivos
);

// GET /api/servicios/:id - Obtener servicio por ID
router.get('/:id', 
  ...idValidation,
  handleValidationErrors,
  ServicioController.getById
);

// POST /api/servicios - Crear nuevo servicio
router.post('/', 
  ...createServicioValidation,
  handleValidationErrors,
  ServicioController.create
);

// PUT /api/servicios/:id - Actualizar servicio
router.put('/:id', 
  ...idValidation,
  ...updateServicioValidation,
  handleValidationErrors,
  ServicioController.update
);

// PATCH /api/servicios/:id/estado - Cambiar estado del servicio (activar/desactivar)
router.patch('/:id/estado',
  ...idValidation,
  body('estado')
    .isIn(['activo', 'inactivo'])
    .withMessage('El estado debe ser "activo" o "inactivo"'),
  handleValidationErrors,
  ServicioController.toggleEstado
);

// DELETE /api/servicios/:id - Eliminar servicio
router.delete('/:id', 
  ...idValidation,
  handleValidationErrors,
  ServicioController.delete
);

export default router;
