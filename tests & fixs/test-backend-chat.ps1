# Test Backend Chat API
Write-Host "Testing Backend Chat API..." -ForegroundColor Green

# Test 1: Get online users
Write-Host "`n1. Testing get online users..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/chat/online-users" -Method GET
    Write-Host "✅ Online users: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error getting online users: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Send message via REST
Write-Host "`n2. Testing send message via REST..." -ForegroundColor Yellow
$message = @{
    maTkA = @{
        id = 1
        tenDn = "testuser1"
        avarta = "default-avatar.png"
    }
    maTkB = @{
        id = 2
        tenDn = "testuser2"
        avarta = "default-avatar.png"
    }
    noiDung = "Test message from PowerShell"
    thoiGian = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    trangThai = "sent"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/chat/send" -Method POST -Body $message -ContentType "application/json"
    Write-Host "✅ Message sent successfully: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error sending message: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get conversation
Write-Host "`n3. Testing get conversation..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/chat/messages/1/2" -Method GET
    Write-Host "✅ Conversation: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error getting conversation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nBackend Chat API test completed!" -ForegroundColor Green



