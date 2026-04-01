# Allies Backend - Database Configuration Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Allies Backend - Database Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra file application.properties
$configFile = "src\main\resources\application.properties"
if (-not (Test-Path $configFile)) {
    Write-Host "❌ File $configFile không tồn tại!" -ForegroundColor Red
    Write-Host "Tạo file từ template..."
    Copy-Item "src\main\resources\application.properties.example" $configFile
    Write-Host "✅ Đã tạo file $configFile" -ForegroundColor Green
}

Write-Host ""
Write-Host "Cấu hình SQL Server connection:" -ForegroundColor Yellow
Write-Host ""

# Kiểm tra xem có mật khẩu SQL Server chưa
Write-Host "Bạn đã có mật khẩu cho SQL Server chưa?" -ForegroundColor Cyan
Write-Host "1. Có - Tôi đã có mật khẩu" -ForegroundColor Green
Write-Host "2. Không - Tôi chưa có mật khẩu" -ForegroundColor Yellow
$hasPassword = Read-Host "Chọn (1 hoặc 2)"

if ($hasPassword -eq "2") {
    Write-Host ""
    Write-Host "Hướng dẫn tạo mật khẩu SQL Server:" -ForegroundColor Yellow
    Write-Host "1. Mở SQL Server Management Studio" -ForegroundColor White
    Write-Host "2. Kết nối bằng Windows Authentication" -ForegroundColor White
    Write-Host "3. Chạy file setup_sql_password.sql" -ForegroundColor White
    Write-Host "4. Hoặc xem file SQL_SERVER_PASSWORD_SETUP.md" -ForegroundColor White
    Write-Host ""
    Write-Host "Sau khi tạo mật khẩu, chạy lại script này!" -ForegroundColor Red
    Read-Host "Nhấn Enter để thoát"
    exit
}

# Nhập thông tin kết nối
$server = Read-Host "SQL Server (mặc định: localhost)"
if ([string]::IsNullOrEmpty($server)) {
    $server = "localhost"
}

$database = Read-Host "Database name (mặc định: allies_db)"
if ([string]::IsNullOrEmpty($database)) {
    $database = "allies_db"
}

$username = Read-Host "Username (mặc định: sa)"
if ([string]::IsNullOrEmpty($username)) {
    $username = "sa"
}

$password = Read-Host "Password" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Đang cập nhật cấu hình..." -ForegroundColor Yellow

# Đọc file hiện tại
$content = Get-Content $configFile -Raw

# Tạo connection string mới
$connectionString = "jdbc:sqlserver://$server`:1433;databaseName=$database;encrypt=false;trustServerCertificate=true"

# Cập nhật các giá trị
$content = $content -replace "spring\.datasource\.url=.*", "spring.datasource.url=$connectionString"
$content = $content -replace "spring\.datasource\.username=.*", "spring.datasource.username=$username"
$content = $content -replace "spring\.datasource\.password=.*", "spring.datasource.password=$plainPassword"

# Ghi file
Set-Content $configFile $content -Encoding UTF8

Write-Host "✅ Đã cập nhật cấu hình database!" -ForegroundColor Green
Write-Host ""
Write-Host "Thông tin kết nối:" -ForegroundColor Cyan
Write-Host "Server: $server" -ForegroundColor White
Write-Host "Database: $database" -ForegroundColor White
Write-Host "Username: $username" -ForegroundColor White
Write-Host ""

# Hỏi có muốn test connection không
$testConnection = Read-Host "Bạn có muốn test kết nối database? (y/n)"
if ($testConnection -eq "y" -or $testConnection -eq "Y") {
    Write-Host ""
    Write-Host "Đang test kết nối..." -ForegroundColor Yellow
    
    # Test bằng cách chạy mvn compile
    $result = & mvn compile -DskipTests 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Kết nối database thành công!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Bạn có thể chạy ứng dụng bằng:" -ForegroundColor Cyan
        Write-Host "mvn spring-boot:run -DskipTests" -ForegroundColor White
        Write-Host "Hoặc sử dụng script: .\run.ps1" -ForegroundColor White
    } else {
        Write-Host "❌ Lỗi kết nối database!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Các bước khắc phục:" -ForegroundColor Yellow
        Write-Host "1. Kiểm tra SQL Server đang chạy" -ForegroundColor White
        Write-Host "2. Kiểm tra username/password" -ForegroundColor White
        Write-Host "3. Kiểm tra database '$database' đã được tạo chưa" -ForegroundColor White
        Write-Host "4. Xem file SQL_SERVER_SETUP.md để biết thêm chi tiết" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "Để test kết nối, chạy:" -ForegroundColor Cyan
    Write-Host "mvn compile -DskipTests" -ForegroundColor White
}

Write-Host ""
Write-Host "Nhấn Enter để thoát..."
Read-Host
