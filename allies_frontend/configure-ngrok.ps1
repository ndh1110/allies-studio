# Script PowerShell để cấu hình frontend với ngrok URL
# Cập nhật environment.ts với ngrok URL

Write-Host "=== CONFIGURING FRONTEND FOR NGROK ===" -ForegroundColor Green

# Lấy ngrok URL từ API
try {
    Write-Host "Đang lấy ngrok URL..." -ForegroundColor Yellow
    $ngrokInfo = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $ngrokUrl = $ngrokInfo.tunnels[0].public_url
    
    if ($ngrokUrl) {
        Write-Host "Ngrok URL: $ngrokUrl" -ForegroundColor Green
        
        # Cập nhật environment.ts
        $envFile = "src/environments/environment.ts"
        if (Test-Path $envFile) {
            Write-Host "Cập nhật $envFile với ngrok URL..." -ForegroundColor Yellow
            
            $content = @"
export const environment = {
  production: false,
  apiUrl: '$ngrokUrl'
};
"@
            Set-Content -Path $envFile -Value $content -Encoding UTF8
            Write-Host "Đã cập nhật environment.ts với ngrok URL" -ForegroundColor Green
        } else {
            Write-Host "Không tìm thấy $envFile" -ForegroundColor Red
        }
        
        # Cập nhật environment.prod.ts
        $prodEnvFile = "src/environments/environment.prod.ts"
        if (Test-Path $prodEnvFile) {
            Write-Host "Cập nhật $prodEnvFile với ngrok URL..." -ForegroundColor Yellow
            
            $content = @"
export const environment = {
  production: true,
  apiUrl: '$ngrokUrl'
};
"@
            Set-Content -Path $prodEnvFile -Value $content -Encoding UTF8
            Write-Host "Đã cập nhật environment.prod.ts với ngrok URL" -ForegroundColor Green
        }
        
        Write-Host "`n=== HƯỚNG DẪN SỬ DỤNG ===" -ForegroundColor Cyan
        Write-Host "1. Backend URL: $ngrokUrl" -ForegroundColor White
        Write-Host "2. Khởi động frontend: ng serve" -ForegroundColor White
        Write-Host "3. Frontend sẽ chạy trên: http://localhost:4200" -ForegroundColor White
        Write-Host "4. Máy khác có thể truy cập frontend qua: http://localhost:4200" -ForegroundColor White
        Write-Host "5. Frontend sẽ gọi API qua ngrok URL: $ngrokUrl" -ForegroundColor White
        
    } else {
        Write-Host "Không thể lấy ngrok URL" -ForegroundColor Red
    }
} catch {
    Write-Host "Lỗi khi lấy ngrok URL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Đảm bảo ngrok đang chạy và có thể truy cập http://localhost:4040" -ForegroundColor Yellow
}
