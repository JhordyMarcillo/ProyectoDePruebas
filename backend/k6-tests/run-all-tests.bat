@echo off
REM Script para ejecutar todas las pruebas de K6 del sistema SPA Modern (Windows)
REM Asegúrate de que el backend esté ejecutándose en http://localhost:3000

echo 🚀 Iniciando suite completa de pruebas K6 para SPA Modern Backend
echo ==============================================================

REM Verificar que K6 esté instalado
k6 version >nul 2>&1
if errorlevel 1 (
    echo ❌ K6 no está instalado. Por favor instálalo desde https://k6.io/docs/get-started/installation/
    pause
    exit /b 1
)

REM Verificar que el backend esté ejecutándose
echo 🔍 Verificando que el backend esté disponible...
curl -s http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ El backend no está disponible en http://localhost:3000
    echo    Por favor inicia el backend antes de ejecutar las pruebas
    pause
    exit /b 1
)
echo ✅ Backend disponible

REM Crear directorio de resultados
set "timestamp=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "timestamp=%timestamp: =0%"
set "RESULTS_DIR=./results/%timestamp%"
mkdir "%RESULTS_DIR%" 2>nul

echo.
echo 📁 Los resultados se guardarán en: %RESULTS_DIR%
echo.

REM Función para ejecutar una prueba
:run_test
set test_name=%1
set test_file=%2
set description=%3

echo 🧪 Ejecutando: %test_name%
echo    %description%
echo    Archivo: %test_file%
echo    ⏰ Iniciado a las %time%

REM Ejecutar la prueba y capturar la salida
k6 run %test_file% --out json="%RESULTS_DIR%/%test_name%-raw.json" > "%RESULTS_DIR%/%test_name%-output.txt" 2>&1

if errorlevel 0 (
    echo    ✅ Completado exitosamente
) else (
    echo    ⚠️  Completado con advertencias
)

echo    📊 Resultados guardados en %RESULTS_DIR%/%test_name%-*
echo.
goto :eof

REM Ejecutar las pruebas en orden
echo 🏁 Comenzando ejecución de pruebas...
echo.

REM 1. Health Check Test
call :run_test "health-check" "health-check.js" "Prueba básica de salud del sistema"

REM Pausa entre pruebas
echo ⏸️  Pausa de 30 segundos entre pruebas...
timeout /t 30 /nobreak >nul

REM 2. Authentication Load Test
call :run_test "auth-load" "auth-load-test.js" "Prueba de carga del sistema de autenticación"

REM Pausa entre pruebas
echo ⏸️  Pausa de 60 segundos entre pruebas...
timeout /t 60 /nobreak >nul

REM 3. CRUD Operations Test
call :run_test "crud-operations" "crud-operations.js" "Prueba de operaciones CRUD bajo carga"

REM Pausa entre pruebas
echo ⏸️  Pausa de 90 segundos entre pruebas...
timeout /t 90 /nobreak >nul

REM 4. Stress Test
call :run_test "stress-test" "stress-test.js" "Prueba de estrés con alta concurrencia"

REM Pausa entre pruebas
echo ⏸️  Pausa de 120 segundos entre pruebas...
timeout /t 120 /nobreak >nul

REM 5. Spike Test
call :run_test "spike-test" "spike-test.js" "Prueba de picos súbitos de tráfico"

REM Pausa antes de finalizar
echo ⏸️  Pausa de 60 segundos antes de finalizar...
timeout /t 60 /nobreak >nul

REM 6. Sustained Load Test (opcional - comentada por defecto debido a duración)
echo ⚠️  Prueba de carga sostenida omitida (15+ minutos de duración)
echo    Para ejecutarla manualmente: k6 run sustained-load-test.js

echo.
echo 🎉 Suite de pruebas completada!
echo ==============================================================
echo 📂 Todos los resultados están en: %RESULTS_DIR%
echo.
echo 📋 Resumen de archivos generados:
dir "%RESULTS_DIR%" /b
echo.
echo 💡 Para analizar los resultados:
echo    - Revisa los archivos *-output.txt para resúmenes legibles
echo    - Los archivos *-raw.json contienen métricas detalladas
echo    - Los archivos *-results.json contienen resúmenes estructurados
echo.
echo 🔍 Para pruebas individuales futuras:
echo    k6 run health-check.js
echo    k6 run auth-load-test.js
echo    k6 run crud-operations.js
echo    k6 run stress-test.js
echo    k6 run spike-test.js
echo    k6 run sustained-load-test.js
echo.
pause
