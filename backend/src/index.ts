import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { testConnection } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import clientesRoutes from './routes/clientes';
import productosRoutes from './routes/productos';
import serviciosRoutes from './routes/servicios';
import proveedoresRoutes from './routes/proveedores';
import dashboardRoutes from './routes/dashboard';
import ventasRoutes from './routes/ventas';
import cambiosRoutes from './routes/cambios';
import reportesRoutes from './routes/reportes';
import usuariosRoutes from './routes/usuarios';
import { errorHandler } from './middleware/errorHandler';

// Crear instancia de Express
const app = express();

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SPA Modern API',
      version: '1.0.0',
      description: 'API REST para Sistema de Administración SPA modernizado',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@spa.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(swaggerOptions);

// Middlewares globales
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbConnected ? 'Connected' : 'Disconnected',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: 'Database connection failed'
    });
  }
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/cambios', cambiosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo global de errores
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    app.listen(config.port, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${config.port}`);
      console.log(`📚 Documentación disponible en http://localhost:${config.port}/api-docs`);
      console.log(`🏥 Health check en http://localhost:${config.port}/health`);
      console.log(`🌍 Entorno: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
