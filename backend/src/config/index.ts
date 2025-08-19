import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Servidor
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'spa_base',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'spa_modern_jwt_secret_fallback',
    expiresIn: process.env.JWT_EXPIRE || '24h'
  },
  
  // CORS
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
    credentials: true
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },
  
  // Uploads
  uploads: {
    directory: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10) // 5MB
  },
  
  // Paginación por defecto
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100
  },
  
  // Configuración de bcrypt
  bcrypt: {
    rounds: 12
  }
};

export default config;
