@echo off
echo Starting Allies Application...
echo.

echo Starting Backend...
start "Backend" cmd /k "cd allies_backend && mvn spring-boot:run -DskipTests"

timeout /t 10 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd allies_frontend && npm start"

echo.
echo Both applications are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:4200
echo Test Login: http://localhost:4200/test-login.html
echo.
pause
