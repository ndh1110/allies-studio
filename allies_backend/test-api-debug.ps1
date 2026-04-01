# Script PowerShell để debug API lỗi 400
# Kiểm tra database và API endpoints

$baseUrl = "http://localhost:8080/api"

Write-Host "=== DEBUGGING API ERRORS ===" -ForegroundColor Red

# 1. Test online users API
Write-Host "`n1. Testing online users API..." -ForegroundColor Yellow
try {
    $onlineUsers = Invoke-RestMethod -Uri "$baseUrl/chat/online-users" -Method Get
    Write-Host "Online users: $($onlineUsers.Count)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test friends API với user có trong database
Write-Host "`n2. Testing friends API with user5..." -ForegroundColor Yellow
try {
    $friends = Invoke-RestMethod -Uri "$baseUrl/users/friends/user5" -Method Get
    Write-Host "Friends of user5: $($friends.Count)" -ForegroundColor Green
    if ($friends.Count -gt 0) {
        $friends | ForEach-Object { Write-Host "- $($_.tenDn)" -ForegroundColor White }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

# 3. Test conversations API với user ID 6 (user5)
Write-Host "`n3. Testing conversations API with user ID 6..." -ForegroundColor Yellow
try {
    $conversations = Invoke-RestMethod -Uri "$baseUrl/chat/conversations/6" -Method Get
    Write-Host "Conversations for user 6: $($conversations.Count)" -ForegroundColor Green
    if ($conversations.Count -gt 0) {
        $conversations | ForEach-Object { Write-Host "- Partner: $($_.partnerName), Last: $($_.lastMessage)" -ForegroundColor White }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

# 4. Test conversations API với user ID 7 (admin123)
Write-Host "`n4. Testing conversations API with user ID 7..." -ForegroundColor Yellow
try {
    $conversations = Invoke-RestMethod -Uri "$baseUrl/chat/conversations/7" -Method Get
    Write-Host "Conversations for user 7: $($conversations.Count)" -ForegroundColor Green
    if ($conversations.Count -gt 0) {
        $conversations | ForEach-Object { Write-Host "- Partner: $($_.partnerName), Last: $($_.lastMessage)" -ForegroundColor White }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== DEBUG COMPLETE ===" -ForegroundColor Red
