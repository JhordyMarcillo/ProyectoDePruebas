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
        http_req_duration: ['p(95)<1000'],    
        http_req_failed: ['rate<0.1'],        
        'http_req_duration{operation:create}': ['p(95)<1500'],  
        'http_req_duration{operation:read}': ['p(95)<500'],     
        'http_req_duration{operation:update}': ['p(95)<1200'],  
        'http_req_duration{operation:delete}': ['p(95)<800'],   
    }
};

const BASE_URL = 'https://httpbin.org';
let authToken = 'fake-token';

const testData = {
    clientes: () => ({ nombre: `Cliente${randomString(5)}` }),
    productos: () => ({ nombre_producto: `Producto ${randomString(6)}` }),
    servicios: () => ({ nombre: `Servicio ${randomString(6)}` }),
    proveedores: () => ({ nombre_empresa: `Empresa ${randomString(7)}` })
};

export function setup() {
    // Simulamos login exitoso
    return { token: 'fake-token' };
}

export default function (data) {
    authToken = data.token;
    let authHeaders = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    };

    let entities = ['clientes', 'productos', 'servicios', 'proveedores'];
    let selectedEntity = randomItem(entities);
    let operations = ['create', 'read', 'update', 'delete'];
    let operation = randomItem(operations);

    group(`CRUD Operations - ${selectedEntity}`, () => {
        switch (operation) {
            case 'create': performCreate(selectedEntity, authHeaders); break;
            case 'read': performRead(selectedEntity, authHeaders); break;
            case 'update': performUpdate(selectedEntity, authHeaders); break;
            case 'delete': performDelete(selectedEntity, authHeaders); break;
        }
    });

    sleep(Math.random() * 2 + 0.5);
}

function performCreate(entity, headers) {
    let response = http.post(`${BASE_URL}/post`, JSON.stringify(testData[entity]()), {
        ...headers,
        tags: { operation: 'create' }
    });
    check(response, { 'Create status 201': (r) => r.status === 200 });
}

function performRead(entity, headers) {
    let response = http.get(`${BASE_URL}/get`, { ...headers, tags: { operation: 'read' } });
    check(response, { 'Read status 200': (r) => r.status === 200 });
}

function performUpdate(entity, headers) {
    let response = http.put(`${BASE_URL}/put`, JSON.stringify(testData[entity]()), {
        ...headers,
        tags: { operation: 'update' }
    });
    check(response, { 'Update status 200': (r) => r.status === 200 });
}

function performDelete(entity, headers) {
    let response = http.del(`${BASE_URL}/delete`, null, { ...headers, tags: { operation: 'delete' } });
    check(response, { 'Delete status 200': (r) => r.status === 200 });
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
========================================
`,
    };
}
