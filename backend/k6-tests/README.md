# K6 Performance Tests - SPA Modern Backend

Este directorio contiene las pruebas de rendimiento para el backend usando K6.

## Requisitos

1. Instalar K6: https://k6.io/docs/get-started/installation/
2. El backend debe estar ejecutándose en `http://localhost:3000`

## Scripts de Pruebas

### 1. `health-check.js`
Prueba básica del endpoint de health check.

### 2. `auth-load-test.js`
Pruebas de carga para el sistema de autenticación.

### 3. `crud-operations.js`
Pruebas de las operaciones CRUD principales (clientes, productos, etc.).

### 4. `stress-test.js`
Pruebas de estrés para evaluar el comportamiento bajo alta carga.

### 5. `spike-test.js`
Pruebas de picos de tráfico súbitos.

## Ejecución

```bash
# Prueba básica
k6 run health-check.js

# Prueba de autenticación
k6 run auth-load-test.js

# Pruebas CRUD
k6 run crud-operations.js

# Prueba de estrés
k6 run stress-test.js

# Prueba de picos
k6 run spike-test.js
```

## Métricas Importantes

- **http_req_duration**: Tiempo de respuesta
- **http_req_failed**: Tasa de errores
- **vus**: Usuarios virtuales activos
- **iterations**: Número total de iteraciones

## Umbrales de Rendimiento

- 95% de las peticiones < 500ms
- Tasa de errores < 5%
- Disponibilidad > 99%
