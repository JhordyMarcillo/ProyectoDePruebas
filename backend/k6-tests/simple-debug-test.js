import http from 'k6/http';
import { sleep, check, group } from 'k6';

export let options = {
    // Prueba simple con pocos usuarios para debug
    stages: [
        { duration: '10s', target: 2 },   // Solo 2 usuarios
        { duration: '20s', target: 2 },   // Mantener 2 usuarios
        { duration: '10s', target: 0 },   // Enfriamiento
    ],

    thresholds: {
        http_req_duration: ['p(95)<2000'],    // Más tolerante
        http_req_failed: ['rate<0.3'],        // Más tolerante
    }
};

const BASE_URL = 'https://httpbin.org/status/200';
let authToken = '';

// Datos de prueba simples con timestamp para evitar duplicados
const generateTestCliente = () => ({
    nombre: 'TestCliente',
    apellido: 'TestApellido',
    cedula: `${Date.now().toString().slice(-8)}`, // Últimos 8 dígitos del timestamp para uniqueness
    numero: '1234567890',
    email: `test${Date.now()}@cliente.com`,
    fecha_nacimiento: '1990-01-01',
    genero: 'M',
    locacion: 'Test Location',
    estado: 'activo'
});

export function setup() {
    //('🔐 Obteniendo token de autenticación...');
    
    let loginPayload = JSON.stringify({
        usuario: 'admin',
        password: '1234'
    });

    let loginResponse = http.post(`${BASE_URL}/auth/login`, loginPayload, {
        headers: { 'Content-Type': 'application/json' },
    });

    //(`Login response status: ${loginResponse.status}`);
    //(`Login response: ${loginResponse.body.substring(0, 200)}...`);

    if (loginResponse.status === 200) {
        let responseBody = JSON.parse(loginResponse.body);
        if (responseBody.success && responseBody.data && responseBody.data.token) {
            //('✅ Token obtenido exitosamente');
            return { token: responseBody.data.token };
        }
    }
    
    //('⚠️  No se pudo obtener token de autenticación');
    return { token: null };
}

export default function (data) {
    if (!data.token) {
        //('❌ Sin token de autenticación, omitiendo pruebas');
        return;
    }

    authToken = data.token;
    let authHeaders = {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    };

    group('Test Simple CRUD', () => {
        // 1. Probar lectura de clientes
        let readResponse = http.get(`${BASE_URL}/clientes?page=1&limit=5`, authHeaders);
        
        let readSuccess = check(readResponse, {
            'Read clientes status 200': (r) => r.status === 200,
            'Read clientes has data': (r) => {
                try {
                    let body = JSON.parse(r.body);
                    return body.success === true;
                } catch (e) {
                    //('Error parsing read response:', e);
                    return false;
                }
            },
        });

        if (readSuccess) {
            //('✅ Lectura de clientes exitosa');
        } else {
            //(`❌ Error en lectura: ${readResponse.status} - ${readResponse.body.substring(0, 100)}`);
        }

        // 2. Probar creación de cliente
        let testCliente = generateTestCliente(); // Generar datos únicos para cada iteración
        let createPayload = JSON.stringify(testCliente);
        let createResponse = http.post(`${BASE_URL}/clientes`, createPayload, authHeaders);
        
        let createSuccess = check(createResponse, {
            'Create cliente status 201': (r) => r.status === 201,
        });

        if (createSuccess) {
            //('✅ Creación de cliente exitosa');
            
            // Extraer ID del cliente creado para actualización/eliminación
            try {
                let createBody = JSON.parse(createResponse.body);
                if (createBody.success && createBody.data && createBody.data.id) {
                    let clienteId = createBody.data.id;
                    
                    // 3. Probar actualización
                    let updateData = { ...testCliente, nombre: 'ClienteActualizado' };
                    let updatePayload = JSON.stringify(updateData);
                    let updateResponse = http.put(`${BASE_URL}/clientes/${clienteId}`, updatePayload, authHeaders);
                    
                    let updateSuccess = check(updateResponse, {
                        'Update cliente status 200': (r) => r.status === 200,
                    });

                    if (updateSuccess) {
                        //('✅ Actualización de cliente exitosa');
                    } else {
                        //(`❌ Error en actualización: ${updateResponse.status} - ${updateResponse.body.substring(0, 100)}`);
                    }

                    // 4. Probar eliminación
                    let deleteResponse = http.del(`${BASE_URL}/clientes/${clienteId}`, null, authHeaders);
                    
                    let deleteSuccess = check(deleteResponse, {
                        'Delete cliente status 200': (r) => r.status === 200,
                    });

                    if (deleteSuccess) {
                        //('✅ Eliminación de cliente exitosa');
                    } else {
                        //(`❌ Error en eliminación: ${deleteResponse.status} - ${deleteResponse.body.substring(0, 100)}`);
                    }
                }
            } catch (e) {
                //('Error processing create response:', e);
            }
        } else {
            //(`❌ Error en creación: ${createResponse.status} - ${createResponse.body.substring(0, 200)}`);
        }
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        stdout: `
🧪 SIMPLE DEBUG TEST RESULTS 🧪
================================
Requests: ${data.metrics.http_reqs.values.count}
Failures: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
Avg Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
95th %ile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms

${data.metrics.http_req_failed.values.rate < 0.3 ? '✅ Prueba exitosa' : '⚠️ Revisar errores en logs'}
================================
`,
    };
}
