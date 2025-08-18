import { Router } from 'express';
import { body, param } from 'express-validator';
import { ClienteController } from '../controllers/ClienteController';
import { authenticateToken, authorizePermissions } from '../middleware/auth';
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

// GET /api/clientes - Obtener todos los clientes con paginación
router.get('/', 
  sanitizePagination,
  ClienteController.getAll
);

// GET /api/clientes/:id - Obtener cliente por ID
router.get('/:id', 
  ...idValidation,
  handleValidationErrors,
  ClienteController.getById
);

// POST /api/clientes - Crear nuevo cliente
router.post('/', 
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('apellido').notEmpty().withMessage('El apellido es requerido'),
  body('cedula').notEmpty().withMessage('La cédula es requerida'),
  handleValidationErrors,
  ClienteController.create
);

// PUT /api/clientes/:id - Actualizar cliente
router.put('/:id', 
  ...idValidation,
  handleValidationErrors,
  ClienteController.update
);

// DELETE /api/clientes/:id - Eliminar cliente
router.delete('/:id', 
  ...idValidation,
  handleValidationErrors,
  ClienteController.delete
);

// PUT /api/clientes/:id/toggle-status - Cambiar estado del cliente
router.put('/:id/toggle-status', 
  ...idValidation,
  handleValidationErrors,
  ClienteController.toggleStatus
);

// GET /api/clientes/cedula/:cedula - Obtener cliente por cédula
router.get('/cedula/:cedula', 
  param('cedula').notEmpty().withMessage('La cédula es requerida'),
  handleValidationErrors,
  ClienteController.getByCedula
);

export default router;
