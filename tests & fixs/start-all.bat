@echo off
echo ========================================
echo    STARTING ALLIES APPLICATION
echo ========================================
echo.

echo [1/3] Starting Backend...
start "Backend" cmd /k "cd allies_backend && mvn spring-boot:run -DskipTests"

echo [2/3] Waiting for backend to start...
timeout /t 15 /nobreak > nul

echo [3/3] Starting Frontend...
start "Frontend" cmd /k "cd allies_frontend && npm start"

echo.
echo ========================================
echo    APPLICATIONS STARTED
echo ========================================
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:4200
echo.
echo Wait for both to fully start, then test login!
echo.
pause
