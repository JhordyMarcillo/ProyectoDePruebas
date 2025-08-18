import http from 'k6/http';
import { sleep, check, group } from 'k6';

export let options = {
    // Prueba de carga sostenida - mantener carga constante por tiempo prolongado
    stages: [
        { duration: '60s', target: 100 },   // Calentamiento gradual
        { duration: '300s', target: 150 },  // Carga sostenida 5 minutos
        { duration: '300s', target: 200 },  // Incremento sostenido 5 minutos
        { duration: '300s', target: 250 },  // Carga alta sostenida 5 minutos
        { duration: '60s', target: 0 },     // Enfriamiento
    ],

    thresholds: {
        http_req_duration: ['p(95)<1000'],      // 95% < 1s durante carga sostenida
        http_req_failed: ['rate<0.05'],         // < 5% errores
        http_reqs: ['rate>100'],                // Mínimo 100 requests/segundo
        vus: ['value<=250'],                    // Máximo 250 usuarios
        'http_req_duration{endpoint:read}': ['p(95)<500'],   // Lecturas rápidas
        'http_req_duration{endpoint:write}': ['p(95)<1500'], // Escrituras más lentas
    }
};

const BASE_URL = 'http://localhost:3000/api';
const HEALTH_URL = 'http://localhost:3000/health';

// Distribución realista de operaciones
const operationWeights = {
    read: 0.70,     // 70% lecturas
    write: 0.20,    // 20% escrituras
    health: 0.10    // 10% health checks
};

export function setup() {
    console.log('⏱️  Iniciando prueba de carga sostenida...');
    console.log('🎯 Se mantendrá carga constante por 15+ minutos');
    
    // Verificar disponibilidad del sistema
    let healthCheck = http.get(HEALTH_URL);
    if (healthCheck.status !== 200) {
        throw new Error('Sistema no disponible para prueba sostenida');
    }
    
    return { 
        startTime: Date.now(),
        operationsCount: 0 
    };
}

export default function (data) {
    // Seleccionar tipo de operación según distribución
    let operation = selectOperation();
    
    group(`Sustained Load - ${operation}`, () => {
        switch (operation) {
            case 'read':
                performReadOperation();
                break;
            case 'write':
                performWriteOperation();
                break;
            case 'health':
                performHealthCheck();
                break;
        }
    });

    // Patrón de sleep más realista
    sleep(Math.random() * 1.5 + 0.5); // 0.5 a 2 segundos
}

function selectOperation() {
    let random = Math.random();
    if (random < operationWeights.read) return 'read';
    if (random < operationWeights.read + operationWeights.write) return 'write';
    return 'health';
}

function performReadOperation() {
    group('Read Operations', () => {
        // Operaciones de lectura variadas
        let readOperations = [
            // Consultas simples
            { endpoint: '/productos', params: '?page=1&limit=20', weight: 0.3 },
            { endpoint: '/clientes', params: '?page=1&limit=15', weight: 0.25 },
            { endpoint: '/servicios', params: '?page=1&limit=10', weight: 0.2 },
            { endpoint: '/proveedores', params: '?page=1&limit=10', weight: 0.15 },
            // Consultas más pesadas
            { endpoint: '/ventas', params: '?page=1&limit=50', weight: 0.08 },
            { endpoint: '/reportes', params: '?page=1&limit=100', weight: 0.02 }
        ];

        let selectedOp = selectWeightedOperation(readOperations);
        let response = http.get(`${BASE_URL}${selectedOp.endpoint}${selectedOp.params}`, {
            tags: { endpoint: 'read', operation: selectedOp.endpoint.substring(1) }
        });

        check(response, {
            'Read operation status OK': (r) => r.status === 200 || r.status === 401,
            'Read operation response time < 1s': (r) => r.timings.duration < 1000,
            'Read operation has content': (r) => r.body && r.body.length > 0,
        });

        // Ocasionalmente, operación de búsqueda
        if (Math.random() < 0.1) { // 10% de probabilidad
            let searchResponse = http.get(`${BASE_URL}/productos?search=test&page=1&limit=5`, {
                tags: { endpoint: 'read', operation: 'search' }
            });
            
            check(searchResponse, {
                'Search operation OK': (r) => r.status === 200 || r.status === 401,
            });
        }
    });
}

function performWriteOperation() {
    group('Write Operations', () => {
        // Solo simular requests de escritura (sin autenticación real)
        let writeOperations = [
            { endpoint: '/productos', method: 'POST', weight: 0.4 },
            { endpoint: '/clientes', method: 'POST', weight: 0.3 },
            { endpoint: '/servicios', method: 'POST', weight: 0.2 },
            { endpoint: '/proveedores', method: 'POST', weight: 0.1 }
        ];

        let selectedOp = selectWeightedOperation(writeOperations);
        
        // Payload de prueba genérico
        let payload = JSON.stringify({
            nombre: `Test-${Date.now()}`,
            descripcion: `Test description ${Math.random()}`,
            test: true
        });

        let response = http.post(`${BASE_URL}${selectedOp.endpoint}`, payload, {
            headers: { 'Content-Type': 'application/json' },
            tags: { endpoint: 'write', operation: selectedOp.endpoint.substring(1) }
        });

        check(response, {
            'Write operation response': (r) => r.status === 201 || r.status === 401 || r.status === 400,
            'Write operation response time < 1.5s': (r) => r.timings.duration < 1500,
        });
    });
}

function performHealthCheck() {
    group('Health Check', () => {
        let healthResponse = http.get(HEALTH_URL, {
            tags: { endpoint: 'health', operation: 'health' }
        });

        check(healthResponse, {
            'Health check status 200': (r) => r.status === 200,
            'Health check response time < 200ms': (r) => r.timings.duration < 200,
            'Health check has status': (r) => r.body && r.body.includes('status'),
        });
    });
}

function selectWeightedOperation(operations) {
    let random = Math.random();
    let cumulative = 0;
    
    for (let op of operations) {
        cumulative += op.weight;
        if (random <= cumulative) {
            return op;
        }
    }
    
    return operations[operations.length - 1]; // Fallback
}

export function teardown(data) {
    let duration = (Date.now() - data.startTime) / 1000 / 60; // En minutos
    console.log(`🏁 Prueba de carga sostenida completada en ${duration.toFixed(2)} minutos`);
}

export function handleSummary(data) {
    let duration = data.state.testRunDurationMs / 1000 / 60; // En minutos
    let maxVUs = data.metrics.vus_max.values.max;
    let avgVUs = data.metrics.vus.values.avg;
    let totalRequests = data.metrics.http_reqs.values.count;
    let failureRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    let avgResponseTime = data.metrics.http_req_duration.values.avg.toFixed(2);
    let p95ResponseTime = data.metrics.http_req_duration.values['p(95)'].toFixed(2);
    let requestRate = data.metrics.http_reqs.values.rate.toFixed(2);
    
    // Análisis por tipo de operación
    let readP95 = data.metrics['http_req_duration{endpoint:read}'] ? 
        data.metrics['http_req_duration{endpoint:read}'].values['p(95)'].toFixed(2) : 'N/A';
    let writeP95 = data.metrics['http_req_duration{endpoint:write}'] ? 
        data.metrics['http_req_duration{endpoint:write}'].values['p(95)'].toFixed(2) : 'N/A';

    return {
        'sustained-load-results.json': JSON.stringify(data, null, 2),
        stdout: `
⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️
                     SUSTAINED LOAD TEST RESULTS
⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️

📊 SUSTAINED LOAD METRICS:
   • Test Duration: ${duration.toFixed(2)} minutes
   • Peak Concurrent Users: ${maxVUs}
   • Average Concurrent Users: ${avgVUs.toFixed(0)}
   • Total Requests: ${totalRequests}
   • Request Rate: ${requestRate} req/s
   
⚡ SUSTAINED PERFORMANCE:
   • Failed Requests: ${failureRate}%
   • Average Response Time: ${avgResponseTime}ms
   • 95th Percentile (Overall): ${p95ResponseTime}ms
   • 95th Percentile (Read Ops): ${readP95}ms
   • 95th Percentile (Write Ops): ${writeP95}ms

🎯 SUSTAINABILITY ANALYSIS:
   ${failureRate < 3 ? '✅ EXCELLENT: Sistema estable bajo carga sostenida' : 
     failureRate < 5 ? '⚠️  GOOD: Sistema funcional con mínima degradación' : 
     failureRate < 10 ? '⚠️  ACCEPTABLE: Sistema funcional con degradación notable' :
     '❌ CRITICAL: Sistema inestable bajo carga sostenida'}
   
   ${parseFloat(p95ResponseTime) < 500 ? '✅ EXCELLENT: Tiempos de respuesta consistentes' :
     parseFloat(p95ResponseTime) < 1000 ? '⚠️  GOOD: Tiempos de respuesta aceptables' :
     parseFloat(p95ResponseTime) < 2000 ? '⚠️  ACCEPTABLE: Tiempos de respuesta elevados' :
     '❌ CRITICAL: Tiempos de respuesta degradados'}

📈 SCALABILITY INSIGHTS:
   • Throughput: ${(totalRequests / (duration * 60)).toFixed(2)} req/min
   • User Efficiency: ${(totalRequests / maxVUs).toFixed(2)} req/user
   • Stability Index: ${(100 - parseFloat(failureRate)).toFixed(1)}%

💡 SUSTAINABILITY RECOMMENDATIONS:
   ${failureRate > 5 ? '• Investigar causas de errores bajo carga sostenida\n   • Optimizar conexiones de base de datos\n   • Implementar connection pooling' : 
   parseFloat(p95ResponseTime) > 1000 ? '• Optimizar queries lentas\n   • Considerar implementar caching\n   • Revisar índices de base de datos' :
   '• Sistema bien preparado para carga sostenida\n   • Mantener monitoreo de métricas clave\n   • Considerar auto-scaling para picos'}

⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️⏱️
`,
    };
}
