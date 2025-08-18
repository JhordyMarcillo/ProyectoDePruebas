import { Router } from 'express';
import { ReporteController } from '../controllers/ReporteController';
import { authenticateToken, authorizePermissions } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Todas las rutas requieren autenticación y permiso de Reportes
router.use(authenticateToken);
router.use(authorizePermissions(['Reportes']));

// GET /api/reportes/cambios - Obtener todos los cambios con paginación
router.get('/cambios', 
  asyncHandler(ReporteController.getAllCambios)
);

// GET /api/reportes/cambios/fecha - Obtener cambios por rango de fechas
router.get('/cambios/fecha', 
  asyncHandler(ReporteController.getCambiosPorFecha)
);

// GET /api/reportes/cambios/tabla/:tabla - Obtener cambios por tabla
router.get('/cambios/tabla/:tabla', 
  asyncHandler(ReporteController.getCambiosPorTabla)
);

// GET /api/reportes/estadisticas - Obtener estadísticas generales
router.get('/estadisticas', 
  asyncHandler(ReporteController.getEstadisticas)
);

export default router;
