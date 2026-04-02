# Create Friendship Script
Write-Host "=== CREATE FRIENDSHIP SCRIPT ===" -ForegroundColor Green

# Step 1: Check if backend is running
Write-Host "`n[1] Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/users" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host "Found users:" -ForegroundColor White
    $response | ForEach-Object { Write-Host "  - $($_.tenDn) (ID: $($_.maTk))" -ForegroundColor White }
} catch {
    Write-Host "❌ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "Please start backend first: cd allies_backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Step 2: Create friendship between user5 and admin123
Write-Host "`n[2] Creating friendship between user5 and admin123..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/create-friendship" -Method POST -Body @{
        username1 = "user5"
        username2 = "admin123"
    }
    Write-Host "✅ Friendship created successfully!" -ForegroundColor Green
    Write-Host $response -ForegroundColor White
} catch {
    Write-Host "❌ Error creating friendship: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Step 3: Check friends of user5
Write-Host "`n[3] Checking friends of user5..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/friends/user5" -Method GET
    Write-Host "Friends of user5:" -ForegroundColor White
    Write-Host $response -ForegroundColor White
} catch {
    Write-Host "❌ Error getting friends: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Check friends of admin123
Write-Host "`n[4] Checking friends of admin123..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/friends/admin123" -Method GET
    Write-Host "Friends of admin123:" -ForegroundColor White
    Write-Host $response -ForegroundColor White
} catch {
    Write-Host "❌ Error getting friends: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== FRIENDSHIP CREATION COMPLETED ===" -ForegroundColor Green


