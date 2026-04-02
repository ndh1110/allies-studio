# Script PowerShell để kiểm tra trạng thái ngrok và lấy URL

Write-Host "=== CHECKING NGROK STATUS ===" -ForegroundColor Green

# Kiểm tra ngrok có đang chạy không
try {
    $ngrokInfo = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    
    if ($ngrokInfo.tunnels.Count -gt 0) {
        Write-Host "`n✅ Ngrok đang chạy!" -ForegroundColor Green
        
        foreach ($tunnel in $ngrokInfo.tunnels) {
            Write-Host "`n📡 Tunnel Info:" -ForegroundColor Cyan
            Write-Host "  Name: $($tunnel.name)" -ForegroundColor White
            Write-Host "  Public URL: $($tunnel.public_url)" -ForegroundColor Green
            Write-Host "  Local URL: $($tunnel.config.addr)" -ForegroundColor Yellow
            Write-Host "  Protocol: $($tunnel.proto)" -ForegroundColor White
            Write-Host "  Status: $($tunnel.state)" -ForegroundColor White
        }
        
        # Lấy URL chính
        $mainUrl = $ngrokInfo.tunnels[0].public_url
        Write-Host "`n🌐 Main URL: $mainUrl" -ForegroundColor Green
        
        # Kiểm tra backend có accessible không
        try {
            $backendUrl = "$mainUrl/api/test/health"
            Write-Host "`n🔍 Testing backend connectivity..." -ForegroundColor Yellow
            $response = Invoke-WebRequest -Uri $backendUrl -TimeoutSec 10
            Write-Host "✅ Backend accessible via ngrok!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Backend not accessible via ngrok" -ForegroundColor Red
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Không có tunnel nào đang chạy" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Ngrok không chạy hoặc không thể kết nối" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Hướng dẫn:" -ForegroundColor Yellow
    Write-Host "1. Khởi động ngrok: ngrok http 8080" -ForegroundColor White
    Write-Host "2. Đảm bảo backend đang chạy trên port 8080" -ForegroundColor White
    Write-Host "3. Kiểm tra ngrok dashboard: http://localhost:4040" -ForegroundColor White
}

Write-Host "`n📊 Ngrok Dashboard: http://localhost:4040" -ForegroundColor Cyan
Write-Host "🔧 Backend Health: http://localhost:8080/api/test/health" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:4200" -ForegroundColor Cyan
