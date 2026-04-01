# Hướng dẫn tạo mật khẩu cho SQL Server

## Trường hợp của bạn: SQL Server cũ không có mật khẩu

### Cách 1: Tạo mật khẩu cho tài khoản sa (Khuyến nghị)

1. **Mở SQL Server Management Studio (SSMS)**
   - Kết nối với server bằng Windows Authentication
   - Server name: `localhost` hoặc `.\SQLEXPRESS`

2. **Tạo mật khẩu cho sa account:**
   ```sql
   -- Mở New Query và chạy lệnh sau:
   USE master;
   GO
   
   -- Bật sa account
   ALTER LOGIN sa ENABLE;
   GO
   
   -- Đặt mật khẩu cho sa account
   ALTER LOGIN sa WITH PASSWORD = 'Allies123!';
   GO
   ```

3. **Kiểm tra SQL Server Authentication mode:**
   ```sql
   -- Kiểm tra authentication mode hiện tại
   SELECT SERVERPROPERTY('IsIntegratedSecurityOnly') AS [Is Windows Only Auth];
   
   -- Nếu kết quả là 1, cần thay đổi sang Mixed Mode
   ```

4. **Thay đổi sang Mixed Authentication Mode:**
   - Right-click server name trong SSMS
   - Chọn Properties → Security
   - Chọn "SQL Server and Windows Authentication mode"
   - Click OK và **restart SQL Server service**

### Cách 2: Tạo tài khoản mới

Nếu không muốn dùng sa account, tạo tài khoản mới:

```sql
-- Tạo login mới
CREATE LOGIN allies_user WITH PASSWORD = 'AlliesPassword123!';

-- Tạo user trong database allies_db
USE allies_db;
CREATE USER allies_user FOR LOGIN allies_user;

-- Cấp quyền db_owner
ALTER ROLE db_owner ADD MEMBER allies_user;
```

### Cách 3: Kiểm tra SQL Server có chạy không

1. **Kiểm tra SQL Server Service:**
   - Mở Services (services.msc)
   - Tìm "SQL Server (SQLEXPRESS)" hoặc "SQL Server (MSSQLSERVER)"
   - Đảm bảo Status = "Running"

2. **Kiểm tra port 1433:**
   ```cmd
   netstat -an | findstr 1433
   ```

## Cập nhật application.properties

Sau khi tạo mật khẩu, cập nhật file `src/main/resources/application.properties`:

```properties
# Sử dụng sa account
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=allies_db;encrypt=false;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=Allies123!

# Hoặc sử dụng tài khoản mới
# spring.datasource.username=allies_user
# spring.datasource.password=AlliesPassword123!
```

## Troubleshooting

### Lỗi: "Login failed for user 'sa'"
- Kiểm tra sa account đã được enable chưa
- Kiểm tra SQL Server Authentication mode đã được bật chưa
- Restart SQL Server service sau khi thay đổi authentication mode

### Lỗi: "Cannot connect to server"
- Kiểm tra SQL Server service đang chạy
- Kiểm tra server name (localhost hoặc .\SQLEXPRESS)
- Kiểm tra port 1433

### Lỗi: "Database 'allies_db' does not exist"
- Chạy script `allies_database_schema.sql` trước
- Hoặc tạo database thủ công:
  ```sql
  CREATE DATABASE allies_db;
  ```

## Script tự động

Chạy script PowerShell để tự động cấu hình:

```powershell
.\configure-database.ps1
```

Script sẽ hỏi bạn nhập thông tin và tự động cập nhật cấu hình.
