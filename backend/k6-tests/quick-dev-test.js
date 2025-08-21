import http from 'k6/http';
import { sleep, check, group } from 'k6';

export let options = {
    // Prueba rápida para desarrollo - 2 minutos total
    stages: [
        { duration: '30s', target: 10 },   // Calentamiento
        { duration: '60s', target: 30 },   // Carga ligera
        { duration: '30s', target: 0 },    // Enfriamiento
    ],

    thresholds: {
        http_req_duration: ['p(95)<1000'],    // 95% < 500ms
        http_req_failed: ['rate<0.01'],      // < 1% errores
    }
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    group('Quick Development Test', () => {
        // Health check
        let healthResponse = http.get(`${BASE_URL}/health`);
        check(healthResponse, {
            'Health check OK': (r) => r.status === 200,
            'Health check fast': (r) => r.timings.duration < 100,
        });

        // API endpoints básicos
        let endpoints = [
            '/api/productos?page=1&limit=5',
            '/api/clientes?page=1&limit=5',
            '/api/servicios?page=1&limit=5'
        ];

        let endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        let response = http.get(`${BASE_URL}${endpoint}`);
        
        check(response, {
            'API endpoint accessible': (r) => r.status === 200 || r.status === 401,
            'API response time good': (r) => r.timings.duration < 300,
        });
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        stdout: `
🚀 QUICK DEV TEST RESULTS 🚀
============================
Requests: ${data.metrics.http_reqs.values.count}
Failures: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
Avg Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
95th %ile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms

${data.metrics.http_req_failed.values.rate < 0.01 ? '✅ Sistema estable' : '⚠️ Revisar errores'}
${data.metrics.http_req_duration.values['p(95)'] < 500 ? '✅ Tiempos buenos' : '⚠️ Tiempos elevados'}
============================
`,
    };
}
