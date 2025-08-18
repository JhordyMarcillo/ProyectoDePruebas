# SPA Modern - Sistema de Administración

Esta es una versión modernizada del Sistema de Administración SPA, construida con:

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Angular 17
- **Base de datos**: MySQL
- **Autenticación**: JWT
- **Pruebas**: Jest (Backend) + Jasmine/Karma (Frontend)

## Estructura del Proyecto

```
spa-modern/
├── backend/          # API REST en Node.js/Express
├── frontend/         # Aplicación Angular
├── database/         # Scripts de base de datos
└── README.md         # Este archivo
```

## Funcionalidades

- ✅ Sistema de autenticación y autorización con JWT
- ✅ Gestión de usuarios y perfiles
- ✅ Administración de clientes
- ✅ Gestión de productos e inventario
- ✅ Sistema de ventas
- ✅ Gestión de servicios
- ✅ Administración de proveedores
- ✅ Reportes y estadísticas
- ✅ Sistema de auditoría (cambios)
- ✅ API REST completa
- ✅ Pruebas unitarias
- ✅ Interfaz moderna y responsiva

## Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- Angular CLI 17+
- MySQL 8.0+
- npm o yarn

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

### Base de Datos

1. Crear base de datos MySQL llamada `spa_modern`
2. Ejecutar el script de migración:

```bash
cd database
# Ejecutar el archivo init.sql en MySQL
```

## Desarrollo

### Backend API

- **Puerto**: 3000
- **Documentación**: http://localhost:3000/api-docs
- **Base URL**: http://localhost:3000/api

### Frontend

- **Puerto**: 4200
- **URL**: http://localhost:4200

## Testing

### Backend
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend
```bash
cd frontend
ng test
ng e2e
```

## Licencia

MIT
