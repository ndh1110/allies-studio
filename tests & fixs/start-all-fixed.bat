@echo off
echo ========================================
echo    ALLIES PROJECT - FIXED VERSION
echo ========================================
echo.

echo [1/4] Starting Backend (Spring Boot)...
cd allies_backend
start "Backend Server" cmd /k "mvn spring-boot:run"
echo Backend starting on port 8080...
timeout /t 3 /nobreak > nul

echo.
echo [2/4] Starting Frontend (Angular)...
cd ..\allies_frontend
start "Frontend Server" cmd /k "npm start"
echo Frontend starting on port 4200...
timeout /t 3 /nobreak > nul

echo.
echo [3/4] Opening test page...
start "Connection Test" test-connection.html
timeout /t 2 /nobreak > nul

echo.
echo [4/4] Opening main application...
start "Allies App" http://localhost:4200
timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo    ALL SERVICES STARTED
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:4200
echo Test:     test-connection.html
echo.
echo Press any key to exit...
pause > nul



