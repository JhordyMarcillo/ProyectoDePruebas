import http from 'k6/http';
import { sleep, check, group } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 50 },
        { duration: '15s', target: 200 },
        { duration: '30s', target: 500 },
        { duration: '40s', target: 800 },
        { duration: '30s', target: 500 },
        { duration: '20s', target: 200 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.2'],
        http_reqs: ['rate>50'],
        vus_max: ['value<=800'],
    }
};

const BASE_URL = 'https://httpbin.org/status/200';
const HEALTH_URL = 'https://httpbin.org/status/200';
const userBehaviors = ['admin', 'employee', 'viewer'];

export function setup() {
    let healthCheck = http.get(HEALTH_URL);
    if (healthCheck.status !== 200) {
        throw new Error('Sistema no disponible para prueba de estrés');
    }
    return { startTime: Date.now() };
}

export default function (data) {
    let userType = userBehaviors[Math.floor(Math.random() * userBehaviors.length)];

    group(`Stress Test - ${userType} behavior`, () => {
        switch (userType) {
            case 'admin': adminBehavior(); break;
            case 'employee': employeeBehavior(); break;
            case 'viewer': viewerBehavior(); break;
        }
    });

    sleep(Math.random() * 3 + 0.5);
}

function adminBehavior() {
    group('Admin Operations', () => {
        let endpoints = [
            '/usuarios?page=1&limit=50',
            '/clientes?page=1&limit=100',
            '/productos?page=1&limit=100',
            '/ventas?page=1&limit=200',
            '/reportes?page=1&limit=500'
        ];

        endpoints.forEach(endpoint => {
            let response = http.get(`${BASE_URL}${endpoint}`);
            check(response, {
                [`Admin ${endpoint} accessible`]: (r) => r.status === 200,
                [`Admin ${endpoint} response time < 3s`]: (r) => r.timings.duration < 3000,
            });
        });
    });
}

function employeeBehavior() {
    group('Employee Operations', () => {
        let commonEndpoints = [
            '/clientes?page=1&limit=20',
            '/productos?page=1&limit=30',
            '/servicios?page=1&limit=20',
            '/proveedores?page=1&limit=15'
        ];
        let selectedEndpoint = commonEndpoints[Math.floor(Math.random() * commonEndpoints.length)];
        let response = http.get(`${BASE_URL}${selectedEndpoint}`);
        check(response, {
            'Employee endpoint accessible': (r) => r.status === 200,
            'Employee response time < 2s': (r) => r.timings.duration < 2000,
        });

        if (Math.random() < 0.3) {
            let searchResponse = http.get(`${BASE_URL}/productos?search=test&page=1&limit=10`);
            check(searchResponse, { 'Search response OK': (r) => r.status === 200 });
        }
    });
}

function viewerBehavior() {
    group('Viewer Operations', () => {
        let viewEndpoints = [
            '/productos?page=1&limit=10',
            '/servicios?page=1&limit=10',
            '/clientes?page=1&limit=5'
        ];
        let selectedEndpoint = viewEndpoints[Math.floor(Math.random() * viewEndpoints.length)];
        let response = http.get(`${BASE_URL}${selectedEndpoint}`);
        check(response, {
            'Viewer endpoint accessible': (r) => r.status === 200,
            'Viewer response time < 1s': (r) => r.timings.duration < 1000,
        });

        if (Math.random() < 0.1) {
            let healthResponse = http.get(HEALTH_URL);
            check(healthResponse, { 'Viewer health check OK': (r) => r.status === 200 });
        }
    });
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

    return {
        'stress-test-results.json': JSON.stringify(data, null, 2),
        stdout: `
🔥 STRESS TEST RESULTS
Max Concurrent Users: ${maxVUs}
Total Requests: ${totalRequests}
Request Rate: ${requestRate} req/s
Failed Requests: ${failureRate}%
Average Response Time: ${avgResponseTime}ms
95th Percentile: ${p95ResponseTime}ms
Max Response Time: ${maxResponseTime}ms
`,
    };
}
