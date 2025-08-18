import { Router } from 'express';
import { body, param } from 'express-validator';
import { ProveedorController } from '../controllers/ProveedorController';
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

// GET /api/proveedores - Obtener todos los proveedores
router.get('/', 
  sanitizePagination,
  ProveedorController.getAll
);

// GET /api/proveedores/:id - Obtener proveedor por ID
router.get('/:id', 
  ...idValidation,
  handleValidationErrors,
  ProveedorController.getById
);

// POST /api/proveedores - Crear nuevo proveedor
router.post('/', 
  body('nombre_empresa').notEmpty().withMessage('El nombre de empresa es requerido'),
  body('email').optional().isEmail().withMessage('Email debe ser válido'),
  body('numero').optional().isString().withMessage('El número debe ser una cadena'),
  body('web').optional().isString().withMessage('La web debe ser una cadena'),
  body('estado').optional().isIn(['activo', 'inactivo']).withMessage('Estado debe ser activo o inactivo'),
  handleValidationErrors,
  ProveedorController.create
);

// PUT /api/proveedores/:id - Actualizar proveedor
router.put('/:id', 
  ...idValidation,
  body('nombre_empresa').optional().notEmpty().withMessage('El nombre de empresa es requerido'),
  body('email').optional().isEmail().withMessage('Email debe ser válido'),
  body('numero').optional().isString().withMessage('El número debe ser una cadena'),
  body('web').optional().isString().withMessage('La web debe ser una cadena'),
  body('estado').optional().isIn(['activo', 'inactivo']).withMessage('Estado debe ser activo o inactivo'),
  handleValidationErrors,
  ProveedorController.update
);

// DELETE /api/proveedores/:id - Eliminar proveedor
router.delete('/:id', 
  ...idValidation,
  handleValidationErrors,
  ProveedorController.delete
);

export default router;
