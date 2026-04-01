# Script PowerShell để khởi động ngrok cho backend
# Tạo public URL để máy khác có thể truy cập

Write-Host "=== STARTING NGROK FOR BACKEND ===" -ForegroundColor Green

# Kiểm tra xem ngrok có được cài đặt không
try {
    $ngrokVersion = ngrok version
    Write-Host "Ngrok version: $ngrokVersion" -ForegroundColor Green
} catch {
    Write-Host "Ngrok chưa được cài đặt hoặc không có trong PATH" -ForegroundColor Red
    Write-Host "Vui lòng tải ngrok từ: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "Hoặc cài đặt qua chocolatey: choco install ngrok" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra xem backend có đang chạy không
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/test/health" -TimeoutSec 5
    Write-Host "Backend đang chạy trên port 8080" -ForegroundColor Green
} catch {
    Write-Host "Backend chưa chạy trên port 8080" -ForegroundColor Red
    Write-Host "Vui lòng khởi động backend trước khi chạy ngrok" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nKhởi động ngrok cho port 8080..." -ForegroundColor Yellow
Write-Host "Ngrok sẽ tạo public URL để máy khác có thể truy cập backend" -ForegroundColor Cyan
Write-Host "`nNhấn Ctrl+C để dừng ngrok" -ForegroundColor Red

# Khởi động ngrok
ngrok http 8080
