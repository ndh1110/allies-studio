# Test Backend API
Write-Host "Testing Backend API..." -ForegroundColor Green

# Wait for backend to start
Start-Sleep -Seconds 5

# Test 1: Get all users
Write-Host "`n[1] Testing GET /api/test/users" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/users" -Method GET
    Write-Host "Success! Found users:" -ForegroundColor Green
    $response | ForEach-Object { Write-Host "  - $($_.tenDn)" -ForegroundColor White }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Test login endpoint
Write-Host "`n[2] Testing POST /api/auth/login" -ForegroundColor Yellow
try {
    $body = @{
        username = "user1"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Success! Login response:" -ForegroundColor Green
    $response | ConvertTo-Json | Write-Host -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Green
