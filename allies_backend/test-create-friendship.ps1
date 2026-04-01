# Script PowerShell để test tạo friendship
# Chạy script này để tạo friendship giữa 2 users

$baseUrl = "http://localhost:8080/api/users"

# Test data - tạo friendships cho user5
$friendships = @(
    @{username1 = "user5"; username2 = "admin123"},
    @{username1 = "user5"; username2 = "admin"},
    @{username1 = "admin"; username2 = "admin123"}
)

Write-Host "Creating friendships..." -ForegroundColor Cyan

foreach ($friendship in $friendships) {
    $username1 = $friendship.username1
    $username2 = $friendship.username2
    
    Write-Host "`nCreating friendship between $username1 and $username2..."

    $body = @{
        username1 = $username1
        username2 = $username2
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/friends" -Method Post -Body $body -ContentType "application/json"
        Write-Host "Success: $response" -ForegroundColor Green
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody" -ForegroundColor Red
        }
    }
}

# Test get friends for user5
Write-Host "`n" + "="*50 -ForegroundColor Yellow
Write-Host "Testing get friends for user5..." -ForegroundColor Yellow
try {
    $friends = Invoke-RestMethod -Uri "$baseUrl/friends/user5" -Method Get
    Write-Host "Friends of user5:" -ForegroundColor Green
    if ($friends.Count -gt 0) {
        $friends | ForEach-Object { Write-Host "- $($_.tenDn) (ID: $($_.id))" -ForegroundColor White }
    } else {
        Write-Host "No friends found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error getting friends for user5: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Test get friends for admin123
Write-Host "`nTesting get friends for admin123..." -ForegroundColor Yellow
try {
    $friends = Invoke-RestMethod -Uri "$baseUrl/friends/admin123" -Method Get
    Write-Host "Friends of admin123:" -ForegroundColor Green
    if ($friends.Count -gt 0) {
        $friends | ForEach-Object { Write-Host "- $($_.tenDn) (ID: $($_.id))" -ForegroundColor White }
    } else {
        Write-Host "No friends found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error getting friends for admin123: $($_.Exception.Message)" -ForegroundColor Red
}

# Test online users API
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "Testing online users API..." -ForegroundColor Cyan
try {
    $onlineUsers = Invoke-RestMethod -Uri "http://localhost:8080/api/chat/online-users" -Method Get
    Write-Host "Online users:" -ForegroundColor Green
    if ($onlineUsers.Count -gt 0) {
        $onlineUsers | ForEach-Object { Write-Host "- $($_.tenDn) (ID: $($_.id))" -ForegroundColor White }
    } else {
        Write-Host "No online users found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error getting online users: $($_.Exception.Message)" -ForegroundColor Red
}
