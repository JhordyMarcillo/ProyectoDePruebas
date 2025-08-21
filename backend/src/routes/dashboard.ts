import { Router, Request, Response } from 'express';
import { executeQuery } from '../config/database';
import { authenticateToken } from '../middleware/auth';



const router = Router();

// GET /api/dashboard/stats - Obtener estadísticas del dashboard
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Consultas para obtener estadísticas como en el original
    const statsQueries = {
      clients_count: "SELECT COUNT(*) as total FROM clientes",
      sales_count: "SELECT COUNT(*) as total FROM ventas",
      products_count: "SELECT COUNT(*) as total FROM productos",
      users_count: "SELECT COUNT(*) as total FROM perfiles",
      services_count: "SELECT COUNT(*) as total FROM servicios",
      providers_count: "SELECT COUNT(*) as total FROM proveedores"
    };

    const stats: any = {};

    // Ejecutar cada consulta
    for (const [key, sql] of Object.entries(statsQueries)) {
      try {
        const result = await executeQuery(sql);
        stats[key] = result[0]?.total || 0;
      } catch (error) {
        //(`Error en consulta ${key}:`, error);
        stats[key] = 0;
      }
    }

    res.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        total_clientes: stats['clients_count'],
        total_ventas: stats['sales_count'],
        total_productos: stats['products_count'],
        total_usuarios: stats['users_count'],
        total_servicios: stats['services_count'],
        total_proveedores: stats['providers_count'],
        ventas_hoy: 0,
        ventas_mes: 0,
        productos_bajo_stock: 0
      }
    });

  } catch (error) {
    //('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;
