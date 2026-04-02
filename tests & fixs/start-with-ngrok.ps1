# Script PowerShell để khởi động toàn bộ hệ thống với ngrok
# Backend + Ngrok + Frontend

Write-Host "=== STARTING ALLIES SYSTEM WITH NGROK ===" -ForegroundColor Green

# Kiểm tra các thư mục
if (-not (Test-Path "allies_backend")) {
    Write-Host "Không tìm thấy thư mục allies_backend" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "allies_frontend")) {
    Write-Host "Không tìm thấy thư mục allies_frontend" -ForegroundColor Red
    exit 1
}

Write-Host "`n1. Khởi động Backend..." -ForegroundColor Yellow
cd allies_backend

# Khởi động backend trong background
Write-Host "Khởi động Spring Boot backend..." -ForegroundColor Cyan
Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WindowStyle Minimized

# Đợi backend khởi động
Write-Host "Đợi backend khởi động (30 giây)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Kiểm tra backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/test/health" -TimeoutSec 10
    Write-Host "Backend đã khởi động thành công!" -ForegroundColor Green
} catch {
    Write-Host "Backend chưa sẵn sàng, đợi thêm..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

Write-Host "`n2. Khởi động Ngrok..." -ForegroundColor Yellow
# Khởi động ngrok trong background
Start-Process -FilePath "ngrok" -ArgumentList "http 8080" -WindowStyle Minimized

# Đợi ngrok khởi động
Write-Host "Đợi ngrok khởi động (10 giây)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n3. Cấu hình Frontend..." -ForegroundColor Yellow
cd ..\allies_frontend

# Cấu hình frontend với ngrok URL
powershell -ExecutionPolicy Bypass -File configure-ngrok.ps1

Write-Host "`n4. Khởi động Frontend..." -ForegroundColor Yellow
Write-Host "Khởi động Angular frontend..." -ForegroundColor Cyan
Start-Process -FilePath "ng" -ArgumentList "serve" -WindowStyle Normal

Write-Host "`n=== HỆ THỐNG ĐÃ KHỞI ĐỘNG ===" -ForegroundColor Green
Write-Host "Backend: http://localhost:8080" -ForegroundColor White
Write-Host "Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "Ngrok Dashboard: http://localhost:4040" -ForegroundColor White
Write-Host "`nMáy khác có thể truy cập frontend qua: http://localhost:4200" -ForegroundColor Cyan
Write-Host "Frontend sẽ gọi API qua ngrok URL" -ForegroundColor Cyan

Write-Host "`nNhấn Enter để dừng tất cả..." -ForegroundColor Red
Read-Host

# Dừng tất cả processes
Write-Host "Đang dừng tất cả processes..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
