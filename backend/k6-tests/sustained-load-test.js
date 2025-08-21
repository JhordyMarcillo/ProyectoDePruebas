import http from 'k6/http';
import { sleep, check, group } from 'k6';

export let options = {
    stages: [
        { duration: '15s', target: 100 },
        { duration: '20s', target: 150 },
        { duration: '20s', target: 100 },
        { duration: '20s', target: 250 },
        { duration: '15s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'], 
        'http_req_duration{endpoint:read}': ['p(95)<2500'],
        'http_req_duration{endpoint:write}': ['p(95)<2500'],
        http_req_failed: ['rate<0.08'],
        http_reqs: ['rate>1500'],
        vus: ['value<=250'],
    }
};

const BASE_URL = 'https://httpbin.org/status/200';
const HEALTH_URL = 'https://httpbin.org/status/200';

const operationWeights = {
    read: 0.7,
    write: 0.2,
    health: 0.1
};

export function setup() {
    let healthCheck = http.get(HEALTH_URL);
    if (healthCheck.status !== 200) {
        throw new Error('Sistema no disponible para prueba sostenida');
    }
    return { startTime: Date.now() };
}

export default function () {
    let operation = selectOperation();

    group(`Sustained Load - ${operation}`, () => {
        switch (operation) {
            case 'read': performReadOperation(); break;
            case 'write': performWriteOperation(); break;
            case 'health': performHealthCheck(); break;
        }
    });

    sleep(Math.random() * 0.5 + 0.1);
}

function selectOperation() {
    let r = Math.random();
    if (r < operationWeights.read) return 'read';
    if (r < operationWeights.read + operationWeights.write) return 'write';
    return 'health';
}

function performReadOperation() {
    group('Read Operations', () => {
        let response = http.get(BASE_URL, { tags: { endpoint: 'read' } });
        check(response, {
            'Read status 200': (r) => r.status === 200,
            'Read response < 1s': (r) => r.timings.duration < 1000
        });
    });
}

function performWriteOperation() {
    group('Write Operations', () => {
        let payload = JSON.stringify({ test: true });
        let response = http.post(BASE_URL, payload, {
            headers: { 'Content-Type': 'application/json' },
            tags: { endpoint: 'write' }
        });
        check(response, {
            'Write status 200': (r) => r.status === 200,
            'Write response < 1.5s': (r) => r.timings.duration < 1500
        });
    });
}

function performHealthCheck() {
    group('Health Check', () => {
        let response = http.get(HEALTH_URL, { tags: { endpoint: 'health' } });
        check(response, {
            'Health status 200': (r) => r.status === 200,
            'Health response < 200ms': (r) => r.timings.duration < 200
        });
    });
}

export function teardown(data) {
    let duration = (Date.now() - data.startTime) / 1000 / 60;
}

export function handleSummary(data) {
    return {
        'sustained-load-results.json': JSON.stringify(data, null, 2),
        stdout: 'Sustained load test completed.'
    };
}
