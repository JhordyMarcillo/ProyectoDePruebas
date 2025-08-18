import { Router } from 'express';
import { param } from 'express-validator';
import { CambioController } from '../controllers/CambioController';
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

// GET /api/cambios - Obtener todos los cambios con paginación
router.get('/', 
  authorizePermissions(['Reportes']),
  sanitizePagination,
  CambioController.getAll
);

// GET /api/cambios/stats - Obtener estadísticas de cambios
router.get('/stats', 
  authorizePermissions(['Reportes']),
  CambioController.getStats
);

// GET /api/cambios/:id - Obtener cambio por ID
router.get('/:id', 
  authorizePermissions(['Reportes']),
  ...idValidation,
  handleValidationErrors,
  CambioController.getById
);

// GET /api/cambios/tabla/:tabla - Obtener cambios por tabla
router.get('/tabla/:tabla', 
  authorizePermissions(['Reportes']),
  param('tabla').notEmpty().withMessage('El nombre de la tabla es requerido'),
  handleValidationErrors,
  CambioController.getByTabla
);

// GET /api/cambios/usuario/:usuario_id - Obtener cambios por usuario
router.get('/usuario/:usuario_id', 
  authorizePermissions(['Reportes']),
  param('usuario_id').notEmpty().withMessage('El ID del usuario es requerido'),
  handleValidationErrors,
  CambioController.getByUsuario
);

export default router;
