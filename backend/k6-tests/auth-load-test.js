import http from 'k6/http';
import { sleep, check, group } from 'k6';

export let options = {
    stages: [
        { duration: '20s', target: 50 },   // Calentamiento
        { duration: '60s', target: 100 },  // Carga normal
        { duration: '40s', target: 200 },  // Incremento de carga
        { duration: '60s', target: 200 },  // Carga sostenida
        { duration: '30s', target: 0 },    // Enfriamiento
    ],

    thresholds: {
        http_req_duration: ['p(95)<800'],     // 95% < 800ms
        http_req_failed: ['rate<0.05'],       // < 5% errores
        'group_duration{group:::Login}': ['p(95)<1000'],  // Login < 1s
    }
};

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Datos de prueba
const testCredentials = {
    usuario: 'admin',
    password: '1234'
};

export function setup() {
    // Configuración inicial - crear usuario de prueba si no existe
    //('🚀 Iniciando configuración de pruebas de autenticación...');
    return { baseUrl: BASE_URL };
}

export default function (data) {
    group('Login Flow', () => {
        // 1. Intentar login
        let loginPayload = JSON.stringify(testCredentials);
        let loginParams = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        let loginResponse = http.post(`${BASE_URL}/auth/login`, loginPayload, loginParams);
        
        let loginSuccess = check(loginResponse, {
            'Login status 200 or 401': (r) => r.status === 200 || r.status === 401,
            'Login response time < 500ms': (r) => r.timings.duration < 500,
            'Login response has body': (r) => r.body.length > 0,
        });

        // Si el login es exitoso, guardar el token
        if (loginResponse.status === 200) {
            try {
                let responseBody = JSON.parse(loginResponse.body);
                if (responseBody.success && responseBody.data && responseBody.data.token) {
                    authToken = responseBody.data.token;
                }
            } catch (e) {
                //('Error parsing login response:', e);
            }
        }

        sleep(0.5);
    });

    group('Protected Routes', () => {
        if (authToken) {
            let authHeaders = {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            };

            // Test endpoints protegidos
            let protectedEndpoints = [
                '/usuarios',
                '/clientes',
                '/productos',
                '/servicios',
                '/proveedores',
                '/ventas',
                '/reportes'
            ];

            protectedEndpoints.forEach(endpoint => {
                let response = http.get(`${BASE_URL}${endpoint}?page=1&limit=5`, authHeaders);
                
                check(response, {
                    [`${endpoint} status 200`]: (r) => r.status === 200,
                    [`${endpoint} response time < 1000ms`]: (r) => r.timings.duration < 1000,
                    [`${endpoint} has data`]: (r) => r.body.length > 0,
                });
            });
        }

        sleep(1);
    });

    group('Logout Flow', () => {
        if (authToken) {
            let logoutResponse = http.post(`${BASE_URL}/auth/logout`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            check(logoutResponse, {
                'Logout status 200': (r) => r.status === 200,
                'Logout response time < 300ms': (r) => r.timings.duration < 300,
            });
        }

        sleep(0.5);
    });
}

export function handleSummary(data) {
    return {
        'auth-load-test-results.json': JSON.stringify(data, null, 2),
        stdout: `
========================================
    AUTHENTICATION LOAD TEST RESULTS
========================================
Total VUs: ${data.metrics.vus_max.values.max}
Total Requests: ${data.metrics.http_reqs.values.count}
Failed Requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
Login Group Duration (95th): ${data.metrics['group_duration{group:::Login}'] ? data.metrics['group_duration{group:::Login}'].values['p(95)'].toFixed(2) + 'ms' : 'N/A'}
========================================
`,
    };
}
