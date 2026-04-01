# Hướng dẫn cấu hình SQL Server cho Allies Backend

## Vấn đề thường gặp

Lỗi: `This driver is not configured for integrated authentication`

## Nguyên nhân

SQL Server JDBC driver cần cấu hình đặc biệt để sử dụng Windows Authentication (integratedSecurity).

## Giải pháp

### Cách 1: Sử dụng SQL Server Authentication (Khuyến nghị)

1. **Cấu hình SQL Server để cho phép SQL Server Authentication:**
   ```sql
   -- Mở SQL Server Management Studio
   -- Right-click server → Properties → Security
   -- Chọn "SQL Server and Windows Authentication mode"
   -- Restart SQL Server service
   ```

2. **Tạo tài khoản sa:**
   ```sql
   -- Đổi mật khẩu cho sa account
   ALTER LOGIN sa WITH PASSWORD = 'YourStrongPassword123!';
   ALTER LOGIN sa ENABLE;
   ```

3. **Cập nhật application.properties:**
   ```properties
   spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=allies_db;encrypt=false;trustServerCertificate=true
   spring.datasource.username=sa
   spring.datasource.password=YourStrongPassword123!
   ```

### Cách 2: Sử dụng Windows Authentication

1. **Tải SQL Server JDBC Authentication Library:**
   - Tải từ: https://docs.microsoft.com/en-us/sql/connect/jdbc/download-microsoft-jdbc-driver-for-sql-server
   - Giải nén và copy file `mssql-jdbc_auth-12.10.1.x64.dll` vào thư mục Java

2. **Cập nhật application.properties:**
   ```properties
   spring.datasource.url=jdbc:sqlserver://YOUR_SERVER\\SQLEXPRESS:1433;databaseName=allies_db;integratedSecurity=true;encrypt=false;trustServerCertificate=true
   spring.datasource.username=
   spring.datasource.password=
   ```

3. **Thêm JVM arguments:**
   ```bash
   -Djava.library.path=C:\path\to\sqljdbc_auth.dll
   ```

### Cách 3: Sử dụng tài khoản SQL Server cụ thể

1. **Tạo tài khoản mới:**
   ```sql
   CREATE LOGIN allies_user WITH PASSWORD = 'AlliesPassword123!';
   USE allies_db;
   CREATE USER allies_user FOR LOGIN allies_user;
   ALTER ROLE db_owner ADD MEMBER allies_user;
   ```

2. **Cập nhật application.properties:**
   ```properties
   spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=allies_db;encrypt=false;trustServerCertificate=true
   spring.datasource.username=allies_user
   spring.datasource.password=AlliesPassword123!
   ```

## Kiểm tra kết nối

1. **Test connection trong SQL Server Management Studio:**
   - Server: `localhost` hoặc `YOUR_SERVER\\SQLEXPRESS`
   - Authentication: SQL Server Authentication
   - Login: `sa` hoặc tài khoản bạn tạo
   - Password: mật khẩu tương ứng

2. **Kiểm tra firewall:**
   - Đảm bảo port 1433 được mở
   - Windows Firewall: Allow SQL Server through firewall

3. **Kiểm tra SQL Server service:**
   - Services.msc → SQL Server (SQLEXPRESS) → Running

## Troubleshooting

### Lỗi: Login failed for user
- Kiểm tra username/password
- Kiểm tra SQL Server Authentication mode
- Kiểm tra tài khoản có bị disable không

### Lỗi: Cannot connect to server
- Kiểm tra SQL Server service đang chạy
- Kiểm tra port 1433
- Kiểm tra firewall settings

### Lỗi: Database does not exist
- Chạy script `allies_database_schema.sql` trước
- Kiểm tra tên database trong connection string

## Cấu hình mẫu hoạt động

```properties
# File: application.properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=allies_db;encrypt=false;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=your_password_here
spring.jpa.hibernate.ddl-auto=update
```

## Lưu ý bảo mật

- Không commit mật khẩu vào Git
- Sử dụng environment variables cho production
- Tạo tài khoản riêng thay vì dùng sa
- Bật encryption trong production
