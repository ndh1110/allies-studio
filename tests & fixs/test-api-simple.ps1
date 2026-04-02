# Simple API Test Script
Write-Host "=== SIMPLE API TEST ===" -ForegroundColor Green

# Test 1: Check backend
Write-Host "`n[1] Testing backend connection..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "http://localhost:8080/api/test/users" -Method GET
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host "Found users: $($users.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend not running: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Create friendship
Write-Host "`n[2] Creating friendship..." -ForegroundColor Yellow
try {
    $body = @{
        username1 = "user5"
        username2 = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/create-friendship" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Success: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check friends
Write-Host "`n[3] Checking friends..." -ForegroundColor Yellow
try {
    $friends1 = Invoke-RestMethod -Uri "http://localhost:8080/api/test/friends/user5" -Method GET
    Write-Host "Friends of user5: $friends1" -ForegroundColor White
    
    $friends2 = Invoke-RestMethod -Uri "http://localhost:8080/api/test/friends/admin123" -Method GET
    Write-Host "Friends of admin123: $friends2" -ForegroundColor White
} catch {
    Write-Host "❌ Error checking friends: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Green


