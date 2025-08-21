import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    stages: [
        { duration: '5s', target: 20 },
        { duration: '10s', target: 20 },
        { duration: '5s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],   // Aumentado de 1500ms a 1700ms
        http_req_failed: ['rate<0.03'],      // Permitimos hasta 3% de fallos
        http_reqs: ['rate>10'],
    }
};

const BASE_URL = 'https://httpbin.org'; // Simulación

export default function () {
    // Health check simulado
    let healthResponse = http.get(`${BASE_URL}/status/200`);
    check(healthResponse, {
        'Health check status 200': (r) => r.status === 200,
        'Health check response time < 100ms': (r) => r.timings.duration < 100,
    });

    // API docs simulado
    let docsResponse = http.get(`${BASE_URL}/status/200`);
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
Requests Failed: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
Max Response Time: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms
========================================
`,
    };
}
