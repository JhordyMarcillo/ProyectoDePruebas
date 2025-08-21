import http from 'k6/http';
import { sleep, check, group } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 20 },
        { duration: '5s', target: 20 },
        { duration: '10s', target: 50 },
        { duration: '5s', target: 20 },
        { duration: '30s', target: 20 },
        { duration: '30s', target: 100 },
        { duration: '20s', target: 100 },
        { duration: '15s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<8000'],
        http_req_failed: ['rate<0.8'],
        http_reqs: ['rate>30'],
        'http_req_duration{scenario:spike}': ['p(95)<8000'],
    }
};

const BASE_URL = 'https://httpbin.org/status/200';
const HEALTH_URL = 'https://httpbin.org/status/200';
const spikePatterns = ['heavy_read', 'mixed_load', 'health_flood'];

export function setup() {
    let healthCheck = http.get(HEALTH_URL);
    if (healthCheck.status !== 200) {
        throw new Error('Sistema no disponible para prueba de picos');
    }
    return { startTime: Date.now() };
}

export default function (data) {
    let currentVUs = __VU;
    let isSpike = currentVUs > 100;
    let pattern = spikePatterns[Math.floor(Math.random() * spikePatterns.length)];
    let tags = { scenario: isSpike ? 'spike' : 'normal' };

    group(`Spike Test - ${pattern} (${isSpike ? 'SPIKE' : 'normal'})`, () => {
        switch (pattern) {
            case 'heavy_read': heavyReadPattern(tags); break;
            case 'mixed_load': mixedLoadPattern(tags); break;
            case 'health_flood': healthFloodPattern(tags); break;
        }
    });

    sleep(isSpike ? Math.random() * 0.5 + 0.1 : Math.random() * 2 + 0.5);
}

function heavyReadPattern(tags) {
    let readEndpoints = [
        '/productos?page=1&limit=50',
        '/clientes?page=1&limit=30',
        '/servicios?page=1&limit=25',
        '/proveedores?page=1&limit=20',
        '/ventas?page=1&limit=100'
    ];

    let numRequests = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numRequests; i++) {
        let endpoint = readEndpoints[Math.floor(Math.random() * readEndpoints.length)];
        let response = http.get(`${BASE_URL}${endpoint}`, { tags });
        check(response, {
            'Heavy read status OK': (r) => r.status === 200,
            'Heavy read response < 3s': (r) => r.timings.duration < 3000,
        });
    }
}

function mixedLoadPattern(tags) {
    if (Math.random() < 0.7) {
        let endpoints = [
            '/productos?page=1&limit=20',
            '/clientes?page=1&limit=15',
            '/servicios?page=1&limit=10'
        ];
        let endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        let response = http.get(`${BASE_URL}${endpoint}`, { tags });
        check(response, {
            'Mixed load read OK': (r) => r.status === 200,
            'Mixed load response < 2s': (r) => r.timings.duration < 2000,
        });
    } else {
        let healthResponse = http.get(HEALTH_URL, { tags });
        check(healthResponse, {
            'Mixed load health OK': (r) => r.status === 200,
            'Mixed load health < 500ms': (r) => r.timings.duration < 500,
        });
    }
}

function healthFloodPattern(tags) {
    let numHealthChecks = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numHealthChecks; i++) {
        let healthResponse = http.get(HEALTH_URL, { tags });
        check(healthResponse, {
            'Health flood status 200': (r) => r.status === 200,
            'Health flood response < 200ms': (r) => r.timings.duration < 200,
        });
        if (i < numHealthChecks - 1) sleep(0.05);
    }
    if (Math.random() < 0.3) {
        let apiResponse = http.get(`${BASE_URL}/productos?page=1&limit=5`, { tags });
        check(apiResponse, { 'Health flood API OK': (r) => r.status === 200 });
    }
}

export function teardown(data) {
    let duration = (Date.now() - data.startTime) / 1000;
}

export function handleSummary(data) {
    let maxVUs = data.metrics.vus_max.values.max;
    let totalRequests = data.metrics.http_reqs.values.count;
    let failureRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    let avgResponseTime = data.metrics.http_req_duration.values.avg.toFixed(2);
    let p95ResponseTime = data.metrics.http_req_duration.values['p(95)'].toFixed(2);
    let maxResponseTime = data.metrics.http_req_duration.values.max.toFixed(2);
    let requestRate = data.metrics.http_reqs.values.rate.toFixed(2);
    let spikeP95 = data.metrics['http_req_duration{scenario:spike}'] ? 
        data.metrics['http_req_duration{scenario:spike}'].values['p(95)'].toFixed(2) : 'N/A';

    return {
        'spike-test-results.json': JSON.stringify(data, null, 2),
        stdout: `
🚀 SPIKE TEST RESULTS
Peak Concurrent Users: ${maxVUs}
Total Requests: ${totalRequests}
Request Rate: ${requestRate} req/s
Failed Requests: ${failureRate}%
Avg Response Time: ${avgResponseTime}ms
95th Percentile (Overall): ${p95ResponseTime}ms
95th Percentile (Spikes): ${spikeP95}ms
Max Response Time: ${maxResponseTime}ms
`,
    };
}
