import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { randomString, randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export let options = {
    stages: [
        { duration: '10s', target: 30 },   // Calentamiento
        { duration: '15s', target: 80 },   // Carga de trabajo
        { duration: '20s', target: 120 },  // Pico de carga
        { duration: '10s', target: 0 },    // Enfriamiento
    ],

    thresholds: {
        http_req_duration: ['p(95)<1000'],    // 95% < 1s
        http_req_failed: ['rate<0.1'],        // < 10% errores
        'http_req_duration{operation:create}': ['p(95)<1500'],  // Creación < 1.5s
        'http_req_duration{operation:read}': ['p(95)<500'],     // Lectura < 500ms
        'http_req_duration{operation:update}': ['p(95)<1200'],  // Actualización < 1.2s
        'http_req_duration{operation:delete}': ['p(95)<800'],   // Eliminación < 800ms
    }
};

const BASE_URL = 'https://httpbin.org/status/200';
let authToken = '';

// Datos de prueba para diferentes entidades
const testData = {
    clientes: () => ({
        nombre: `Cliente${randomString(5)}`,
        apellido: `Apellido${randomString(5)}`,
        cedula: `${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 99)}`, // Timestamp + random para uniqueness
        numero: `${Math.floor(Math.random() * 9000000000) + 1000000000}`, // 10 dígitos sin prefijo
        email: `cliente${Date.now()}${randomString(3)}@test.com`,
        fecha_nacimiento: '1990-01-01',
        genero: randomItem(['M', 'F']),
        locacion: `Calle ${randomString(8)} #${Math.floor(Math.random() * 999) + 1}`,
        estado: 'activo'
    }),
    productos: () => ({
        nombre_producto: `Producto ${randomString(6)}`,
        cantidad_producto: Math.floor(Math.random() * 100) + 1,
        proveedor_producto: `Proveedor${randomString(5)}`,
        precio_producto: Math.floor(Math.random() * 1000) + 10,
        precio_compra: Math.floor(Math.random() * 500) + 5,
        marca_producto: randomItem(['Apple', 'Samsung', 'Sony', 'LG', 'HP']),
        categoria_producto: randomItem(['Electrónicos', 'Hogar', 'Deportes', 'Ropa']),
        estado: 'activo'
    }),
    servicios: () => ({
        nombre: `Servicio ${randomString(6)}`,
        descripcion: `Descripción del servicio ${randomString(10)}`,
        productos: [],
        coste_total: Math.floor(Math.random() * 500) + 50,
        costo_servicio: Math.floor(Math.random() * 300) + 30,
        estado: 'activo'
    }),
    proveedores: () => ({
        nombre_empresa: `Empresa ${randomString(7)}`,
        email: `proveedor${Date.now()}${randomString(3)}@empresa.com`,
        numero: `${Math.floor(Math.random() * 9000000000) + 1000000000}`, // 10 dígitos sin prefijo
        web: `https://www.empresa${randomString(5)}.com`,
        estado: 'activo'
    })
};

export function setup() {
    // Login para obtener token
    //('🔐 Obteniendo token de autenticación...');
    
    let loginPayload = JSON.stringify({
        usuario: 'admin',
        password: '1234'
    });

    let loginResponse = http.post(`${BASE_URL}/auth/login`, loginPayload, {
        headers: { 'Content-Type': 'application/json' },
    });

    //(`Login response status: ${loginResponse.status}`);
    //(`Login response body: ${loginResponse.body}`);

    if (loginResponse.status === 200) {
        let responseBody = JSON.parse(loginResponse.body);
        if (responseBody.success && responseBody.data && responseBody.data.token) {
            //('✅ Token obtenido exitosamente');
            return { token: responseBody.data.token };
        }
    }
    
    //('⚠️  No se pudo obtener token de autenticación');
    //(`Response: ${loginResponse.body}`);
    return { token: null };
}

export default function (data) {
    if (!data.token) {
        //('❌ Sin token de autenticación, omitiendo pruebas CRUD');
        return;
    }

    authToken = data.token;
    let authHeaders = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    };

    // Seleccionar entidad aleatoria para probar
    let entities = ['clientes', 'productos', 'servicios', 'proveedores'];
    let selectedEntity = randomItem(entities);
    
    // Seleccionar operación CRUD aleatoria
    let operations = ['create', 'read', 'update', 'delete'];
    let operation = randomItem(operations);

    group(`CRUD Operations - ${selectedEntity}`, () => {
        switch (operation) {
            case 'create':
                performCreate(selectedEntity, authHeaders);
                break;
            case 'read':
                performRead(selectedEntity, authHeaders);
                break;
            case 'update':
                performUpdate(selectedEntity, authHeaders);
                break;
            case 'delete':
                performDelete(selectedEntity, authHeaders);
                break;
        }
    });

    sleep(Math.random() * 2 + 0.5); // Sleep entre 0.5 y 2.5 segundos
}

function performCreate(entity, headers) {
    let payload = JSON.stringify(testData[entity]());
    
    let response = http.post(`${BASE_URL}/${entity}`, payload, {
        ...headers,
        tags: { operation: 'create' }
    });

    check(response, {
        [`Create ${entity} status 201`]: (r) => r.status === 201,
        [`Create ${entity} has ID`]: (r) => {
            try {
                let body = JSON.parse(r.body);
                return body.data && body.data.id;
            } catch (e) {
                return false;
            }
        },
    });
}

function performRead(entity, headers) {
    // Leer lista con paginación
    let listResponse = http.get(`${BASE_URL}/${entity}?page=1&limit=10`, {
        ...headers,
        tags: { operation: 'read' }
    });

    check(listResponse, {
        [`List ${entity} status 200`]: (r) => r.status === 200,
        [`List ${entity} has data`]: (r) => {
            try {
                let body = JSON.parse(r.body);
                return Array.isArray(body.data);
            } catch (e) {
                return false;
            }
        },
    });

    // Si hay datos, leer un elemento específico
    try {
        let listBody = JSON.parse(listResponse.body);
        if (listBody.data && listBody.data.length > 0) {
            let itemId = listBody.data[0].id;
            
            let itemResponse = http.get(`${BASE_URL}/${entity}/${itemId}`, {
                ...headers,
                tags: { operation: 'read' }
            });

            check(itemResponse, {
                [`Get ${entity} by ID status 200`]: (r) => r.status === 200,
                [`Get ${entity} by ID has data`]: (r) => {
                    try {
                        let body = JSON.parse(r.body);
                        return body.data && body.data.id === itemId;
                    } catch (e) {
                        return false;
                    }
                },
            });
        }
    } catch (e) {
        //(`Error reading specific ${entity}:`, e);
    }
}

function performUpdate(entity, headers) {
    // Primero obtener un elemento para actualizar
    let listResponse = http.get(`${BASE_URL}/${entity}?page=1&limit=5`, headers);
    
    if (listResponse.status === 200) {
        try {
            let listBody = JSON.parse(listResponse.body);
            if (listBody.data && listBody.data.length > 0) {
                let item = listBody.data[0];
                let updateData = { ...testData[entity](), id: item.id };
                
                let updateResponse = http.put(`${BASE_URL}/${entity}/${item.id}`, 
                    JSON.stringify(updateData), {
                    ...headers,
                    tags: { operation: 'update' }
                });

                check(updateResponse, {
                    [`Update ${entity} status 200`]: (r) => r.status === 200,
                    [`Update ${entity} response time < 1200ms`]: (r) => r.timings.duration < 1200,
                });
            }
        } catch (e) {
            //(`Error updating ${entity}:`, e);
        }
    }
}

function performDelete(entity, headers) {
    // Crear un elemento para eliminar
    let createPayload = JSON.stringify(testData[entity]());
    let createResponse = http.post(`${BASE_URL}/${entity}`, createPayload, headers);
    
    if (createResponse.status === 201) {
        try {
            let createBody = JSON.parse(createResponse.body);
            if (createBody.data && createBody.data.id) {
                let deleteResponse = http.del(`${BASE_URL}/${entity}/${createBody.data.id}`, null, {
                    ...headers,
                    tags: { operation: 'delete' }
                });

                check(deleteResponse, {
                    [`Delete ${entity} status 200`]: (r) => r.status === 200,
                    [`Delete ${entity} response time < 800ms`]: (r) => r.timings.duration < 800,
                });
            }
        } catch (e) {
            //(`Error deleting ${entity}:`, e);
        }
    }
}

export function handleSummary(data) {
    return {
        'crud-operations-results.json': JSON.stringify(data, null, 2),
        stdout: `
========================================
    CRUD OPERATIONS TEST RESULTS
========================================
Total VUs: ${data.metrics.vus_max.values.max}
Total Requests: ${data.metrics.http_reqs.values.count}
Failed Requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%

Response Times:
- Average: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
- 95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
- Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms

Operation Performance:
- Create (95th): ${data.metrics['http_req_duration{operation:create}'] ? data.metrics['http_req_duration{operation:create}'].values['p(95)'].toFixed(2) + 'ms' : 'N/A'}
- Read (95th): ${data.metrics['http_req_duration{operation:read}'] ? data.metrics['http_req_duration{operation:read}'].values['p(95)'].toFixed(2) + 'ms' : 'N/A'}
- Update (95th): ${data.metrics['http_req_duration{operation:update}'] ? data.metrics['http_req_duration{operation:update}'].values['p(95)'].toFixed(2) + 'ms' : 'N/A'}
- Delete (95th): ${data.metrics['http_req_duration{operation:delete}'] ? data.metrics['http_req_duration{operation:delete}'].values['p(95)'].toFixed(2) + 'ms' : 'N/A'}
========================================
`,
    };
}
