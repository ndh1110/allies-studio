# Script PowerShell để test chat realtime
# Chạy script này để test gửi tin nhắn giữa 2 users

$baseUrl = "http://localhost:8080/api"

Write-Host "=== TESTING CHAT REALTIME ===" -ForegroundColor Cyan

# Test 1: Gửi tin nhắn qua REST API
Write-Host "`n1. Testing REST API message sending..." -ForegroundColor Yellow

$messageBody = @{
    maTkA = @{
        maTk = 6
        tenDn = "user5"
        mk = ""
        avarta = "default-avatar.png"
    }
    maTkB = @{
        maTk = 7
        tenDn = "admin123"
        mk = ""
        avarta = "default-avatar.png"
    }
    noiDung = "Test message from PowerShell"
    thoiGian = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    trangThai = "sending"
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/chat/send" -Method Post -Body $messageBody -ContentType "application/json"
    Write-Host "REST API Success: Message ID " $response.id -ForegroundColor Green
    Write-Host "Message content: " $response.noiDung -ForegroundColor Green
} catch {
    Write-Host "REST API Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Test 2: Lấy lịch sử chat
Write-Host "`n2. Testing chat history..." -ForegroundColor Yellow

try {
    $chatHistory = Invoke-RestMethod -Uri "$baseUrl/chat/messages/6/7" -Method Get
    Write-Host "Chat history found: " $chatHistory.Count " messages" -ForegroundColor Green
    foreach ($msg in $chatHistory) {
        Write-Host "- From: $($msg.maTkA.tenDn), To: $($msg.maTkB.tenDn), Content: $($msg.noiDung)" -ForegroundColor White
    }
} catch {
    Write-Host "Chat history Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test WebSocket endpoint
Write-Host "`n3. Testing WebSocket endpoint..." -ForegroundColor Yellow

try {
    $wsTest = Invoke-WebRequest -Uri "http://localhost:8080/ws" -Method Get
    Write-Host "WebSocket endpoint accessible: " $wsTest.StatusCode -ForegroundColor Green
} catch {
    Write-Host "WebSocket endpoint Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test online users
Write-Host "`n4. Testing online users..." -ForegroundColor Yellow

try {
    $onlineUsers = Invoke-RestMethod -Uri "$baseUrl/chat/online-users" -Method Get
    Write-Host "Online users: " $onlineUsers.Count -ForegroundColor Green
    foreach ($user in $onlineUsers) {
        Write-Host "- $($user.tenDn) (ID: $($user.id))" -ForegroundColor White
    }
} catch {
    Write-Host "Online users Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Cyan
Write-Host "Check backend console for WebSocket message logs" -ForegroundColor Yellow
Write-Host "Check frontend console for received message logs" -ForegroundColor Yellow
