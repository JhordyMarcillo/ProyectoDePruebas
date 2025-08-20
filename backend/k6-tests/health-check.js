import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    // Configuración de prueba básica
    stages: [
        { duration: '5s', target: 20 },  // Rampa hasta 20 usuarios
        { duration: '10s', target: 20 },  // Mantener 20 usuarios
        { duration: '5s', target: 0 },   // Rampa hacia abajo
    ],

    // Umbrales de rendimiento
    thresholds: {
        http_req_duration: ['p(95)<200'],   // 95% de peticiones < 200ms
        http_req_failed: ['rate<0.01'],     // Tasa de errores < 1%
        http_reqs: ['rate>10'],             // Mínimo 10 requests por segundo
    }
};

const BASE_URL = 'https://httpbin.org/status/200';

export default function () {
    // Test del health check
    let healthResponse = http.get(`${BASE_URL}/health`);
    
    check(healthResponse, {
        'Health check status 200': (r) => r.status === 200,
        'Health check response time < 100ms': (r) => r.timings.duration < 100,
        'Health check contains status': (r) => r.body.includes('status'),
    });

    // Test del endpoint de API docs
    let docsResponse = http.get(`${BASE_URL}/api-docs`);
    
    check(docsResponse, {
        'API docs status 200': (r) => r.status === 200,
        'API docs response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        'health-check-results.json': JSON.stringify(data, null, 2),
        stdout: `
========================================
    HEALTH CHECK TEST RESULTS
========================================
Requests Total: ${data.metrics.http_reqs.values.count}
Requests Failed: ${data.metrics.http_req_failed.values.rate * 100}%
Avg Response Time: ${data.metrics.http_req_duration.values.avg}ms
95th Percentile: ${data.metrics.http_req_duration.values['p(95)']}ms
Max Response Time: ${data.metrics.http_req_duration.values.max}ms
========================================
`,
    };
}
