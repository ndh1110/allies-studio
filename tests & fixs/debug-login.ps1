# Debug Login Script
Write-Host "=== DEBUG LOGIN SCRIPT ===" -ForegroundColor Green

# Step 1: Check if backend is running
Write-Host "`n[1] Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/users" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host "Found users:" -ForegroundColor White
    $response | ForEach-Object { Write-Host "  - $($_.tenDn)" -ForegroundColor White }
} catch {
    Write-Host "❌ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "Please start backend first: cd allies_backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Step 2: Create test user if not exists
Write-Host "`n[2] Creating test user..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/create-test-user" -Method POST
    Write-Host "✅ Test user created: $($response.tenDn)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*already exists*" -or $_.Exception.Message -like "*tồn tại*") {
        Write-Host "ℹ️  Test user already exists" -ForegroundColor Blue
    } else {
        Write-Host "❌ Error creating test user: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 3: Check user details
Write-Host "`n[3] Checking user details..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/check-password" -Method POST -Body @{
        username = "user1"
        password = "123456"
    }
    Write-Host "User details: $response" -ForegroundColor White
    
    # Extract password hash for BCrypt test
    if ($response -like "*Password hash: *") {
        $hash = $response -replace ".*Password hash: ", ""
        Write-Host "Extracted hash: $hash" -ForegroundColor Gray
        
        # Test BCrypt matching
        Write-Host "`n[3.1] Testing BCrypt matching..." -ForegroundColor Yellow
        try {
            $bcryptResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/test/test-bcrypt" -Method POST -Body @{
                password = "123456"
                hash = $hash
            }
            Write-Host "BCrypt test: $bcryptResponse" -ForegroundColor White
        } catch {
            Write-Host "❌ BCrypt test failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Error checking user: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test login with correct credentials
Write-Host "`n[4] Testing login with correct credentials..." -ForegroundColor Yellow
try {
    $body = @{
        username = "user1"
        password = "123456"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($response.token)" -ForegroundColor White
    Write-Host "User ID: $($response.id)" -ForegroundColor White
    Write-Host "Username: $($response.username)" -ForegroundColor White
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Step 5: Test login with wrong password
Write-Host "`n[5] Testing login with wrong password..." -ForegroundColor Yellow
try {
    $body = @{
        username = "user1"
        password = "wrongpassword"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "⚠️  Login should have failed but succeeded!" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Login correctly failed with wrong password" -ForegroundColor Green
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error message: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== DEBUG COMPLETED ===" -ForegroundColor Green
