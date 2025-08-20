import http from 'k6/http';
import { sleep, check, group } from 'k6';

export let options = {
    // Prueba de picos - carga súbita y luego normal
    stages: [
        { duration: '10s', target: 20 },    // Línea base
        { duration: '5s', target: 500 },   // Pico súbito 🚀
        { duration: '10s', target: 500 },   // Mantener pico
        { duration: '5s', target: 20 },    // Caída súbita
        { duration: '30s', target: 20 },    // Estabilización
        { duration: '5s', target: 800 },    // Segundo pico más alto 🚀🚀
        { duration: '20s', target: 800 },   // Mantener segundo pico
        { duration: '15s', target: 0 },     // Enfriamiento
    ],

    thresholds: {
        http_req_duration: ['p(95)<3000'],      // Más tolerante durante picos
        http_req_failed: ['rate<0.3'],          // < 30% errores durante picos
        http_reqs: ['rate>30'],                 // Mínimo 30 requests/segundo
        'http_req_duration{scenario:spike}': ['p(95)<5000'], // Picos hasta 5s
    }
};

const BASE_URL = 'http://localhost:3000/api';
const HEALTH_URL = 'http://localhost:3000/health';

// Simulación de diferentes patrones de tráfico durante picos
const spikePatterns = [
    'heavy_read',     // 50% - Muchas consultas simultáneas
    'mixed_load',     // 30% - Carga mixta
    'health_flood',   // 20% - Flood de health checks
];

export function setup() {
    //('🚀 Iniciando prueba de picos de tráfico...');
    //('⚡ Se simularán picos súbitos de hasta 800 usuarios');
    
    // Verificar sistema disponible
    let healthCheck = http.get(HEALTH_URL);
    if (healthCheck.status !== 200) {
        throw new Error('Sistema no disponible para prueba de picos');
    }
    
    return { startTime: Date.now() };
}

export default function (data) {
    // Detectar si estamos en un pico basado en la etapa actual
    let currentVUs = __VU;
    let isSpike = currentVUs > 100; // Considerar pico si hay más de 100 VUs
    
    // Seleccionar patrón de comportamiento
    let pattern = spikePatterns[Math.floor(Math.random() * spikePatterns.length)];
    
    let tags = { scenario: isSpike ? 'spike' : 'normal' };
    
    group(`Spike Test - ${pattern} (${isSpike ? 'SPIKE' : 'normal'})`, () => {
        switch (pattern) {
            case 'heavy_read':
                heavyReadPattern(tags);
                break;
            case 'mixed_load':
                mixedLoadPattern(tags);
                break;
            case 'health_flood':
                healthFloodPattern(tags);
                break;
        }
    });

    // Durante picos, menor tiempo de espera para maximizar carga
    if (isSpike) {
        sleep(Math.random() * 0.5 + 0.1); // 0.1 a 0.6 segundos
    } else {
        sleep(Math.random() * 2 + 0.5);   // 0.5 a 2.5 segundos
    }
}

function heavyReadPattern(tags) {
    // Patrón de lectura intensiva - simula usuarios consultando masivamente
    group('Heavy Read Pattern', () => {
        let readEndpoints = [
            '/productos?page=1&limit=50',
            '/clientes?page=1&limit=30',
            '/servicios?page=1&limit=25',
            '/proveedores?page=1&limit=20',
            '/ventas?page=1&limit=100'
        ];

        // Realizar múltiples consultas rápidas
        let numRequests = Math.floor(Math.random() * 3) + 1; // 1-3 requests
        for (let i = 0; i < numRequests; i++) {
            let endpoint = readEndpoints[Math.floor(Math.random() * readEndpoints.length)];
            let response = http.get(`${BASE_URL}${endpoint}`, { tags });
            
            check(response, {
                'Heavy read status OK': (r) => r.status === 200 || r.status === 401,
                'Heavy read response < 3s': (r) => r.timings.duration < 3000,
            });
        }
    });
}

function mixedLoadPattern(tags) {
    // Patrón mixto - simula operaciones variadas
    group('Mixed Load Pattern', () => {
        // 70% lecturas, 30% health checks
        if (Math.random() < 0.7) {
            // Operación de lectura
            let endpoints = [
                '/productos?page=1&limit=20',
                '/clientes?page=1&limit=15',
                '/servicios?page=1&limit=10'
            ];
            
            let endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
            let response = http.get(`${BASE_URL}${endpoint}`, { tags });
            
            check(response, {
                'Mixed load read OK': (r) => r.status === 200 || r.status === 401,
                'Mixed load response < 2s': (r) => r.timings.duration < 2000,
            });
        } else {
            // Health check
            let healthResponse = http.get(HEALTH_URL, { tags });
            check(healthResponse, {
                'Mixed load health OK': (r) => r.status === 200,
                'Mixed load health < 500ms': (r) => r.timings.duration < 500,
            });
        }
    });
}

function healthFloodPattern(tags) {
    // Patrón de flood de health checks - simula monitoreo intensivo
    group('Health Flood Pattern', () => {
        // Múltiples health checks rápidos
        let numHealthChecks = Math.floor(Math.random() * 5) + 1; // 1-5 checks
        
        for (let i = 0; i < numHealthChecks; i++) {
            let healthResponse = http.get(HEALTH_URL, { tags });
            check(healthResponse, {
                'Health flood status 200': (r) => r.status === 200,
                'Health flood response < 200ms': (r) => r.timings.duration < 200,
            });
            
            // Micro-pausa entre health checks
            if (i < numHealthChecks - 1) {
                sleep(0.05); // 50ms
            }
        }

        // Ocasionalmente, una consulta de API también
        if (Math.random() < 0.3) {
            let apiResponse = http.get(`${BASE_URL}/productos?page=1&limit=5`, { tags });
            check(apiResponse, {
                'Health flood API OK': (r) => r.status === 200 || r.status === 401,
            });
        }
    });
}

export function teardown(data) {
    let duration = (Date.now() - data.startTime) / 1000;
    //(`🏁 Prueba de picos completada en ${duration.toFixed(2)} segundos`);
}

export function handleSummary(data) {
    let maxVUs = data.metrics.vus_max.values.max;
    let totalRequests = data.metrics.http_reqs.values.count;
    let failureRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    let avgResponseTime = data.metrics.http_req_duration.values.avg.toFixed(2);
    let p95ResponseTime = data.metrics.http_req_duration.values['p(95)'].toFixed(2);
    let maxResponseTime = data.metrics.http_req_duration.values.max.toFixed(2);
    let requestRate = data.metrics.http_reqs.values.rate.toFixed(2);

    // Análisis específico de picos
    let spikeP95 = data.metrics['http_req_duration{scenario:spike}'] ? 
        data.metrics['http_req_duration{scenario:spike}'].values['p(95)'].toFixed(2) : 'N/A';

    return {
        'spike-test-results.json': JSON.stringify(data, null, 2),
        stdout: `
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
                         SPIKE TEST RESULTS
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

📈 TRAFFIC SPIKE METRICS:
   • Peak Concurrent Users: ${maxVUs}
   • Total Requests: ${totalRequests}
   • Request Rate: ${requestRate} req/s
   
⚡ SPIKE PERFORMANCE:
   • Failed Requests: ${failureRate}%
   • Average Response Time: ${avgResponseTime}ms
   • 95th Percentile (Overall): ${p95ResponseTime}ms
   • 95th Percentile (Spikes): ${spikeP95}ms
   • Maximum Response Time: ${maxResponseTime}ms

🎯 SPIKE RESILIENCE ANALYSIS:
   ${failureRate < 15 ? '✅ EXCELLENT: Sistema resistente a picos de tráfico' : 
     failureRate < 30 ? '⚠️  ACCEPTABLE: Sistema funcional con degradación durante picos' : 
     '❌ CRITICAL: Sistema falló durante picos, requiere escalamiento'}
   
   ${spikeP95 !== 'N/A' && parseFloat(spikeP95) < 3000 ? '✅ EXCELLENT: Tiempos de respuesta controlados durante picos' :
     spikeP95 !== 'N/A' && parseFloat(spikeP95) < 5000 ? '⚠️  ACCEPTABLE: Tiempos elevados pero manejables durante picos' :
     '❌ CRITICAL: Tiempos de respuesta inaceptables durante picos'}

💡 RECOMMENDATIONS:
   ${failureRate > 20 ? '• Implementar auto-scaling o load balancing\n   • Considerar rate limiting más agresivo\n   • Optimizar queries de base de datos' : 
   failureRate > 10 ? '• Monitorear patrones de tráfico\n   • Considerar caching para consultas frecuentes' :
   '• Sistema bien preparado para picos de tráfico\n   • Mantener monitoreo continuo'}

🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
`,
    };
}
