# Test Database Connection
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    ALLIES DATABASE CONNECTION TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test SQL Server Connection
Write-Host "[1/3] Testing SQL Server Connection..." -ForegroundColor Yellow
try {
    $connectionString = "Server=GiaBaoNgoHoang\SQLEXPRESS;Database=allies_db;User Id=sa;Password=Giabao123;TrustServerCertificate=True;"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    Write-Host "✅ SQL Server connection successful!" -ForegroundColor Green
    $connection.Close()
} catch {
    Write-Host "❌ SQL Server connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "[2/3] Testing Backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend API is running: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend API not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "[3/3] Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4200" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running on port 4200" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    TEST COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see errors above, please:" -ForegroundColor Yellow
Write-Host "1. Make sure SQL Server is running" -ForegroundColor White
Write-Host "2. Check database credentials in application.properties" -ForegroundColor White
Write-Host "3. Start backend with: cd allies_backend && mvn spring-boot:run" -ForegroundColor White
Write-Host "4. Start frontend with: cd allies_frontend && npm start" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"



