import http from 'k6/http';
import { sleep, check, group } from 'k6';

export let options = {
    // Prueba de estrés - incremento gradual hasta niveles altos
    stages: [
        { duration: '30s', target: 50 },    // Calentamiento normal
        { duration: '60s', target: 200 },   // Incremento rápido
        { duration: '120s', target: 500 },  // Carga alta
        { duration: '180s', target: 800 },  // Estrés máximo
        { duration: '120s', target: 500 },  // Reducción gradual
        { duration: '60s', target: 200 },   // Normalización
        { duration: '30s', target: 0 },     // Enfriamiento
    ],

    // Umbrales más relajados para pruebas de estrés
    thresholds: {
        http_req_duration: ['p(95)<2000'],      // 95% < 2s bajo estrés
        http_req_failed: ['rate<0.2'],          // < 20% errores bajo estrés
        http_reqs: ['rate>50'],                 // Mínimo 50 requests/segundo
        vus_max: ['value<=800'],                // Máximo 800 usuarios simultáneos
    }
};

const BASE_URL = 'http://localhost:3000/api';
const HEALTH_URL = 'http://localhost:3000/health';

// Simulación de diferentes tipos de usuarios
const userBehaviors = [
    'admin',      // 10% - Operaciones administrativas
    'employee',   // 30% - Operaciones de empleados
    'viewer',     // 60% - Solo consultas
];

export function setup() {
    console.log('🔥 Iniciando prueba de estrés...');
    console.log('⚡ Se probará el sistema con hasta 800 usuarios concurrentes');
    
    // Verificar que el sistema esté disponible antes de empezar
    let healthCheck = http.get(HEALTH_URL);
    if (healthCheck.status !== 200) {
        throw new Error('Sistema no disponible para prueba de estrés');
    }
    
    return { startTime: Date.now() };
}

export default function (data) {
    // Seleccionar comportamiento de usuario aleatoriamente
    let userType = userBehaviors[Math.floor(Math.random() * userBehaviors.length)];
    
    group(`Stress Test - ${userType} behavior`, () => {
        switch (userType) {
            case 'admin':
                adminBehavior();
                break;
            case 'employee':
                employeeBehavior();
                break;
            case 'viewer':
                viewerBehavior();
                break;
        }
    });

    // Tiempo de espera variable para simular comportamiento real
    sleep(Math.random() * 3 + 0.5); // 0.5 a 3.5 segundos
}

function adminBehavior() {
    // Comportamiento de administrador - operaciones pesadas
    group('Admin Operations', () => {
        // Health check
        let healthResponse = http.get(HEALTH_URL);
        check(healthResponse, {
            'Health check OK': (r) => r.status === 200,
        });

        // Consultas de reportes (simuladas con múltiples endpoints)
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
                [`Admin ${endpoint} accessible`]: (r) => r.status === 200 || r.status === 401,
                [`Admin ${endpoint} response time < 3s`]: (r) => r.timings.duration < 3000,
            });
        });
    });
}

function employeeBehavior() {
    // Comportamiento de empleado - operaciones mixtas
    group('Employee Operations', () => {
        // Consultas comunes
        let commonEndpoints = [
            '/clientes?page=1&limit=20',
            '/productos?page=1&limit=30',
            '/servicios?page=1&limit=20',
            '/proveedores?page=1&limit=15'
        ];

        let selectedEndpoint = commonEndpoints[Math.floor(Math.random() * commonEndpoints.length)];
        let response = http.get(`${BASE_URL}${selectedEndpoint}`);
        
        check(response, {
            'Employee endpoint accessible': (r) => r.status === 200 || r.status === 401,
            'Employee response time < 2s': (r) => r.timings.duration < 2000,
        });

        // Simular búsqueda
        if (Math.random() < 0.3) { // 30% de probabilidad de búsqueda
            let searchResponse = http.get(`${BASE_URL}/productos?search=test&page=1&limit=10`);
            check(searchResponse, {
                'Search response OK': (r) => r.status === 200 || r.status === 401,
            });
        }
    });
}

function viewerBehavior() {
    // Comportamiento de solo lectura - operaciones ligeras
    group('Viewer Operations', () => {
        // Solo consultas básicas
        let viewEndpoints = [
            '/productos?page=1&limit=10',
            '/servicios?page=1&limit=10',
            '/clientes?page=1&limit=5'
        ];

        let selectedEndpoint = viewEndpoints[Math.floor(Math.random() * viewEndpoints.length)];
        let response = http.get(`${BASE_URL}${selectedEndpoint}`);
        
        check(response, {
            'Viewer endpoint accessible': (r) => r.status === 200 || r.status === 401,
            'Viewer response time < 1s': (r) => r.timings.duration < 1000,
        });

        // Health check ocasional
        if (Math.random() < 0.1) { // 10% de probabilidad
            let healthResponse = http.get(HEALTH_URL);
            check(healthResponse, {
                'Viewer health check OK': (r) => r.status === 200,
            });
        }
    });
}

export function teardown(data) {
    let duration = (Date.now() - data.startTime) / 1000;
    console.log(`🏁 Prueba de estrés completada en ${duration.toFixed(2)} segundos`);
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
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
                        STRESS TEST RESULTS
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

📊 LOAD METRICS:
   • Max Concurrent Users: ${maxVUs}
   • Total Requests: ${totalRequests}
   • Request Rate: ${requestRate} req/s
   
⚡ PERFORMANCE METRICS:
   • Failed Requests: ${failureRate}%
   • Average Response Time: ${avgResponseTime}ms
   • 95th Percentile: ${p95ResponseTime}ms
   • Maximum Response Time: ${maxResponseTime}ms

🎯 STRESS TEST ANALYSIS:
   ${failureRate < 10 ? '✅ EXCELLENT: Sistema estable bajo estrés' : 
     failureRate < 20 ? '⚠️  ACCEPTABLE: Sistema funcional con degradación' : 
     '❌ CRITICAL: Sistema sobrecargado, requiere optimización'}
   
   ${p95ResponseTime < 1000 ? '✅ EXCELLENT: Tiempos de respuesta aceptables' :
     p95ResponseTime < 2000 ? '⚠️  ACCEPTABLE: Tiempos de respuesta elevados' :
     '❌ CRITICAL: Tiempos de respuesta inaceptables'}

🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
`,
    };
}
