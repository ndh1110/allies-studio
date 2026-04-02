# Test Chat Script
Write-Host "=== TEST CHAT SCRIPT ===" -ForegroundColor Green

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

# Step 2: Test sending message
Write-Host "`n[2] Testing send message..." -ForegroundColor Yellow
try {
    $body = @{
        username1 = "user1"
        username2 = "user2"
        message = "Hello from PowerShell test!"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/test-chat" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Message sent successfully!" -ForegroundColor Green
    Write-Host $response -ForegroundColor White
} catch {
    Write-Host "❌ Error sending message: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Step 3: Test chat history
Write-Host "`n[3] Testing chat history..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/chat-history/user1/user2" -Method GET
    Write-Host "Chat history:" -ForegroundColor White
    Write-Host $response -ForegroundColor White
} catch {
    Write-Host "❌ Error getting chat history: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test sending another message
Write-Host "`n[4] Testing send another message..." -ForegroundColor Yellow
try {
    $body = @{
        username1 = "user2"
        username2 = "user1"
        message = "Reply from user2!"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/test-chat" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Reply sent successfully!" -ForegroundColor Green
    Write-Host $response -ForegroundColor White
} catch {
    Write-Host "❌ Error sending reply: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Check updated chat history
Write-Host "`n[5] Checking updated chat history..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/test/chat-history/user1/user2" -Method GET
    Write-Host "Updated chat history:" -ForegroundColor White
    Write-Host $response -ForegroundColor White
} catch {
    Write-Host "❌ Error getting updated chat history: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== CHAT TEST COMPLETED ===" -ForegroundColor Green


