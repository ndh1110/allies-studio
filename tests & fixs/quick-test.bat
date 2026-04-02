@echo off
echo ==========================================
echo QUICK LOGIN TEST
echo ==========================================

echo.
echo [1] Testing backend connection...
curl -s http://localhost:8080/api/test/users
if %errorlevel% neq 0 (
    echo ERROR: Backend not running!
    echo Please start backend first: cd allies_backend ^&^& mvn spring-boot:run
    pause
    exit /b 1
)

echo.
echo [2] Creating test user...
curl -s -X POST http://localhost:8080/api/test/create-test-user

echo.
echo [3] Testing login...
curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"user1\",\"password\":\"123456\"}" http://localhost:8080/api/auth/login

echo.
echo ==========================================
echo Test completed!
echo ==========================================
pause


