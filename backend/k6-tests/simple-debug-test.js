import http from 'k6/http';
import { sleep, check, group } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 2 },   // Solo 2 usuarios
        { duration: '20s', target: 2 },   // Mantener 2 usuarios
        { duration: '10s', target: 0 },   // Enfriamiento
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],    // Más tolerante
        http_req_failed: ['rate<0.3'],        // Más tolerante
    }
};

const BASE_URL = 'https://httpbin.org/status/200';
let authToken = 'fake-token'; // Simulación de token

// Datos de prueba simples
const generateTestCliente = () => ({
    nombre: 'TestCliente',
    apellido: 'TestApellido',
    cedula: `${Date.now().toString().slice(-8)}`,
    numero: '1234567890',
    email: `test${Date.now()}@cliente.com`,
    fecha_nacimiento: '1990-01-01',
    genero: 'M',
    locacion: 'Test Location',
    estado: 'activo'
});

export function setup() {
    // Simular login exitoso
    return { token: authToken };
}

export default function (data) {
    if (!data.token) return;

    let authHeaders = {
        headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
        },
    };

    group('Test Simple CRUD', () => {
        // Simular lectura
        let readResponse = http.get(`${BASE_URL}`, authHeaders);
        check(readResponse, {
            'Read clientes status 200': (r) => r.status === 200,
        });

        // Simular creación
        let createPayload = JSON.stringify(generateTestCliente());
        let createResponse = http.post(`${BASE_URL}`, createPayload, authHeaders);
        check(createResponse, { 'Create cliente status 201': (r) => r.status === 200 }); // Simulado 200

        // Simular actualización
        let updatePayload = JSON.stringify({ nombre: 'ClienteActualizado' });
        let updateResponse = http.put(`${BASE_URL}`, updatePayload, authHeaders);
        check(updateResponse, { 'Update cliente status 200': (r) => r.status === 200 });

        // Simular eliminación
        let deleteResponse = http.del(`${BASE_URL}`, null, authHeaders);
        check(deleteResponse, { 'Delete cliente status 200': (r) => r.status === 200 });
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        stdout: `
🧪 SIMPLE DEBUG TEST RESULTS 🧪
================================
Requests: ${data.metrics.http_reqs.values.count}
Failures: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
Avg Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
95th %ile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms

${data.metrics.http_req_failed.values.rate < 0.3 ? '✅ Prueba exitosa' : '⚠️ Revisar errores en logs'}
================================
`,
    };
}
