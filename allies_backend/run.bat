@echo off
echo ========================================
echo Allies Backend - Starting Application
echo ========================================
echo.

echo Cleaning previous build...
call mvn clean

echo.
echo Compiling application (skipping tests)...
call mvn compile -DskipTests

echo.
echo Starting Spring Boot application...
call mvn spring-boot:run -DskipTests

pause

