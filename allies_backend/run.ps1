# Allies Backend - Start Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Allies Backend - Starting Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cleaning previous build..." -ForegroundColor Yellow
mvn clean

Write-Host ""
Write-Host "Compiling application (skipping tests)..." -ForegroundColor Yellow
mvn compile -DskipTests

Write-Host ""
Write-Host "Starting Spring Boot application..." -ForegroundColor Green
mvn spring-boot:run -DskipTests

Write-Host ""
Write-Host "Application stopped." -ForegroundColor Red
Read-Host "Press Enter to exit"

