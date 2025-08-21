import http from 'k6/http';
import { sleep, check, group } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 50 },   // Calentamiento
        { duration: '15s', target: 100 },  // Carga normal
        { duration: '15s', target: 150 },  // Incremento de carga
        { duration: '15s', target: 150 },  // Carga sostenida
        { duration: '10s', target: 0 },    // Enfriamiento
    ],

    thresholds: {
        http_req_duration: ['p(95)<1500'],     
        http_req_failed: ['rate<0.05'],       
        'group_duration{group:::Login}': ['p(95)<1500'],  
    }
};

const BASE_URL = 'https://httpbin.org';
let authToken = 'fake-token';

// Datos de prueba
const testCredentials = {
    usuario: 'admin',
    password: '1234'
};

export function setup() {
    return { baseUrl: BASE_URL };
}

export default function (data) {
    group('Login Flow', () => {
        let loginResponse = http.post(`${BASE_URL}/post`, JSON.stringify(testCredentials), {
            headers: { 'Content-Type': 'application/json' }
        });
        
        let loginSuccess = check(loginResponse, {
            'Login status 200': (r) => r.status === 200,
            'Login response time < 500ms': (r) => r.timings.duration < 500,
            'Login response has body': (r) => r.body && r.body.length > 0,
        });

        // Simular token
        if (loginSuccess) {
            authToken = 'fake-token';
        }

        sleep(0.5);
    });

    group('Protected Routes', () => {
        if (authToken) {
            let protectedEndpoints = ['/get', '/anything', '/uuid'];
            protectedEndpoints.forEach(endpoint => {
                let response = http.get(`${BASE_URL}${endpoint}`);
                
                check(response, {
                    [`${endpoint} status 200`]: (r) => r.status === 200,
                    [`${endpoint} response time < 1000ms`]: (r) => r.timings.duration < 1000,
                    [`${endpoint} has data`]: (r) => r.body && r.body.length > 0,
                });
            });
        }

        sleep(1);
    });

    group('Logout Flow', () => {
        if (authToken) {
            let logoutResponse = http.post(`${BASE_URL}/post`, null, {
                headers: { 'Authorization': `Bearer ${authToken}` }
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
