@echo off
echo ==========================================
echo TEST FRIENDSHIP CREATION
echo ==========================================

echo.
echo [1] Listing all users...
curl -s http://localhost:8080/api/test/users
if %errorlevel% neq 0 (
    echo ERROR: Backend not running!
    echo Please start backend first: cd allies_backend ^&^& mvn spring-boot:run
    pause
    exit /b 1
)

echo.
echo.
echo [2] Creating friendship between user5 and admin123...
curl -s -X POST "http://localhost:8080/api/test/create-friendship" -d "username1=user5&username2=admin123"

echo.
echo.
echo [3] Checking friends of user5...
curl -s "http://localhost:8080/api/test/friends/user5"

echo.
echo.
echo [4] Checking friends of admin123...
curl -s "http://localhost:8080/api/test/friends/admin123"

echo.
echo ==========================================
echo Friendship test completed!
echo ==========================================
pause


