# SPA Modern - Backend API

API REST construida con Node.js, Express y TypeScript para el Sistema de Administración SPA modernizado.

## Tecnologías

- **Node.js 18+**
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Jest** - Testing
- **Swagger** - Documentación API
- **ESLint** - Linter
- **Helmet** - Seguridad
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - Logging
- **Express Validator** - Validación

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tu configuración
```

3. Configurar base de datos:
- Crear base de datos MySQL llamada `spa_modern`
- Ejecutar el script `../database/init.sql`

4. Compilar TypeScript:
```bash
npm run build
```

## Desarrollo

```bash
# Modo desarrollo con hot reload
npm run dev

# Compilar código
npm run build

# Iniciar en producción
npm start
```

## Testing

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

## Linting

```bash
# Verificar código
npm run lint

# Corregir errores automáticamente
npm run lint:fix
```

## Estructura del Proyecto

```
src/
├── config/              # Configuración de la aplicación
│   ├── index.ts         # Configuración principal
│   └── database.ts      # Configuración de base de datos
├── controllers/         # Controladores de rutas
│   ├── AuthController.ts
│   └── ClienteController.ts
├── middleware/          # Middlewares personalizados
│   ├── auth.ts          # Autenticación y autorización
│   └── validation.ts    # Validaciones
├── models/              # Modelos de datos
│   ├── Usuario.ts
│   └── Cliente.ts
├── routes/              # Definición de rutas
│   ├── auth.ts
│   └── clientes.ts
├── services/            # Lógica de negocio
├── types/               # Tipos TypeScript
│   └── index.ts
├── utils/               # Utilidades
├── tests/               # Pruebas unitarias
│   ├── setup.ts
│   └── auth.test.ts
└── index.ts             # Punto de entrada
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil (requiere auth)
- `PUT /api/auth/profile` - Actualizar perfil (requiere auth)
- `POST /api/auth/logout` - Cerrar sesión (requiere auth)

### Clientes
- `GET /api/clientes` - Listar clientes (requiere auth)
- `GET /api/clientes/:id` - Obtener cliente por ID (requiere auth)
- `GET /api/clientes/cedula/:cedula` - Obtener cliente por cédula (requiere auth)
- `POST /api/clientes` - Crear cliente (requiere auth)
- `PUT /api/clientes/:id` - Actualizar cliente (requiere auth)
- `DELETE /api/clientes/:id` - Eliminar cliente (requiere auth)

### Dashboard
- `GET /api/dashboard/stats` - Obtener estadísticas (requiere auth)

### Sistema
- `GET /health` - Health check
- `GET /api-docs` - Documentación Swagger

## Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. 

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "usuario": "admin",
  "password": "password123"
}
```

### Usando el token
```bash
GET /api/clientes
Authorization: Bearer <jwt_token>
```

## Roles y Permisos

- **admin** - Acceso completo
- **ventas** - Acceso a clientes, ventas, reportes
- **bodega** - Acceso a productos, servicios, proveedores
- **supervisor** - Acceso de lectura a todos los módulos

## Variables de Entorno

```env
NODE_ENV=development
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=spa_modern

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# CORS
ALLOWED_ORIGINS=http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Documentación API

La documentación completa de la API está disponible en:
- **Desarrollo**: http://localhost:3000/api-docs
- **Producción**: https://your-domain.com/api-docs

## Seguridad

- Validación de entrada con express-validator
- Sanitización de datos
- Rate limiting
- Helmet para headers de seguridad
- CORS configurado
- Contraseñas encriptadas con bcrypt
- JWT para autenticación stateless

## Logging

La aplicación utiliza Morgan para logging de requests HTTP. Los logs incluyen:
- Método HTTP
- URL
- Código de respuesta
- Tiempo de respuesta
- User agent
- IP

## Error Handling

Manejo centralizado de errores con:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## Base de Datos

### Migraciones
Los scripts SQL se encuentran en `../database/init.sql`

### Conexiones
- Pool de conexiones para mejor rendimiento
- Transacciones para operaciones críticas
- Reconexión automática

## Deployment

### Docker (Recomendado)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### PM2
```bash
npm install -g pm2
pm2 start dist/index.js --name spa-api
```

## Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

MIT
