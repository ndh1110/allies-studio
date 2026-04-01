# Script PowerShell để test toàn bộ flow chat
# Test: Tìm kiếm user → Bắt đầu chat → Gửi/nhận tin nhắn

$baseUrl = "http://localhost:8080/api"

Write-Host "=== TESTING COMPLETE CHAT FLOW ===" -ForegroundColor Cyan

# Test 1: Tìm kiếm users
Write-Host "`n1. Testing user search..." -ForegroundColor Yellow

try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/users/search?q=admin" -Method Get
    Write-Host "Search results for 'admin':" -ForegroundColor Green
    foreach ($user in $searchResults) {
        Write-Host "- $($user.tenDn) (ID: $($user.id))" -ForegroundColor White
    }
} catch {
    Write-Host "Search Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Tạo friendship giữa user5 và admin123
Write-Host "`n2. Creating friendship..." -ForegroundColor Yellow

$friendshipBody = @{
    username1 = "user5"
    username2 = "admin123"
} | ConvertTo-Json

try {
    $friendshipResponse = Invoke-RestMethod -Uri "$baseUrl/users/friends" -Method Post -Body $friendshipBody -ContentType "application/json"
    Write-Host "Friendship created: $friendshipResponse" -ForegroundColor Green
} catch {
    Write-Host "Friendship Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Lấy danh sách bạn bè của user5
Write-Host "`n3. Getting friends of user5..." -ForegroundColor Yellow

try {
    $friends = Invoke-RestMethod -Uri "$baseUrl/users/friends/user5" -Method Get
    Write-Host "Friends of user5:" -ForegroundColor Green
    if ($friends.Count -gt 0) {
        foreach ($friend in $friends) {
            Write-Host "- $($friend.tenDn) (ID: $($friend.id))" -ForegroundColor White
        }
    } else {
        Write-Host "No friends found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Get friends Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Gửi tin nhắn từ user5 đến admin123
Write-Host "`n4. Sending message from user5 to admin123..." -ForegroundColor Yellow

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
    noiDung = "Hello from user5 to admin123!"
    thoiGian = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    trangThai = "sending"
} | ConvertTo-Json -Depth 3

try {
    $messageResponse = Invoke-RestMethod -Uri "$baseUrl/chat/send" -Method Post -Body $messageBody -ContentType "application/json"
    Write-Host "Message sent successfully! ID: $($messageResponse.id)" -ForegroundColor Green
    Write-Host "Content: $($messageResponse.noiDung)" -ForegroundColor Green
} catch {
    Write-Host "Send message Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Gửi tin nhắn từ admin123 đến user5
Write-Host "`n5. Sending message from admin123 to user5..." -ForegroundColor Yellow

$messageBody2 = @{
    maTkA = @{
        maTk = 7
        tenDn = "admin123"
        mk = ""
        avarta = "default-avatar.png"
    }
    maTkB = @{
        maTk = 6
        tenDn = "user5"
        mk = ""
        avarta = "default-avatar.png"
    }
    noiDung = "Hello from admin123 to user5!"
    thoiGian = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    trangThai = "sending"
} | ConvertTo-Json -Depth 3

try {
    $messageResponse2 = Invoke-RestMethod -Uri "$baseUrl/chat/send" -Method Post -Body $messageBody2 -ContentType "application/json"
    Write-Host "Message sent successfully! ID: $($messageResponse2.id)" -ForegroundColor Green
    Write-Host "Content: $($messageResponse2.noiDung)" -ForegroundColor Green
} catch {
    Write-Host "Send message Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Lấy lịch sử chat giữa user5 và admin123
Write-Host "`n6. Getting chat history between user5 and admin123..." -ForegroundColor Yellow

try {
    $chatHistory = Invoke-RestMethod -Uri "$baseUrl/chat/messages/6/7" -Method Get
    Write-Host "Chat history found: $($chatHistory.Count) messages" -ForegroundColor Green
    foreach ($msg in $chatHistory) {
        Write-Host "- From: $($msg.maTkA.tenDn), To: $($msg.maTkB.tenDn), Content: $($msg.noiDung)" -ForegroundColor White
    }
} catch {
    Write-Host "Chat history Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Cyan
Write-Host "Now test in browser:" -ForegroundColor Yellow
Write-Host "1. Open 2 browser tabs" -ForegroundColor White
Write-Host "2. Login as user5 in tab 1" -ForegroundColor White
Write-Host "3. Login as admin123 in tab 2" -ForegroundColor White
Write-Host "4. In tab 1: Go to Search → Find admin123 → Start chat" -ForegroundColor White
Write-Host "5. Send message from tab 1" -ForegroundColor White
Write-Host "6. Check if message appears in tab 2" -ForegroundColor White
Write-Host "7. Send reply from tab 2" -ForegroundColor White
Write-Host "8. Check if reply appears in tab 1" -ForegroundColor White
