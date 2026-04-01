# Allies Backend

Backend API cho ứng dụng Allies - nền tảng chat và video call.

## Yêu cầu hệ thống

- Java 17+
- Maven 3.6+
- SQL Server 2016+
- Spring Boot 3.5.6

## Cài đặt và chạy

### 1. Thiết lập Database

1. Chạy file `allies_database_schema.sql` trong SQL Server Management Studio
2. (Tùy chọn) Chạy `create_admin_account.sql` để tạo tài khoản admin

### 2. Cấu hình

**QUAN TRỌNG**: Cấu hình SQL Server connection trong `src/main/resources/application.properties`:

#### Nếu bạn CHƯA có mật khẩu SQL Server:
1. Chạy script: `.\configure-database.ps1`
2. Hoặc xem hướng dẫn: `SQL_SERVER_PASSWORD_SETUP.md`
3. Chạy file SQL: `setup_sql_password.sql` trong SSMS

#### Nếu bạn ĐÃ có mật khẩu SQL Server:
```properties
# Cách 1: SQL Server Authentication (Khuyến nghị)
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=allies_db;encrypt=false;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=your_sa_password_here

# Cách 2: Windows Authentication (Cần cấu hình đặc biệt)
# spring.datasource.url=jdbc:sqlserver://YOUR_SERVER\\SQLEXPRESS:1433;databaseName=allies_db;integratedSecurity=true;encrypt=false;trustServerCertificate=true
```

**Lưu ý**: Nếu gặp lỗi "integrated authentication", xem file `SQL_SERVER_SETUP.md` để biết cách sửa.

### 3. Chạy ứng dụng

#### Cách 1: Sử dụng script (Khuyến nghị)
```bash
# Windows
run.bat

# PowerShell
.\run.ps1
```

#### Cách 2: Maven commands
```bash
# Compile (bỏ qua tests)
mvn compile -DskipTests

# Chạy ứng dụng
mvn spring-boot:run -DskipTests
```

#### Cách 3: JAR file
```bash
# Build JAR (bỏ qua tests)
mvn package -DskipTests

# Chạy JAR
java -jar target/app-0.0.1-SNAPSHOT.jar
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/signup` - Đăng ký

### Chat
- `GET /api/chat/messages/{userId}` - Lấy tin nhắn
- `POST /api/chat/send` - Gửi tin nhắn

### WebSocket
- `/ws` - WebSocket endpoint
- `/app/chat.sendMessage` - Gửi tin nhắn qua WebSocket

## Cấu trúc Database

- **Taikhoan**: Quản lý tài khoản đăng nhập
- **user**: Thông tin người dùng
- **chat**: Tin nhắn riêng
- **nhom**: Nhóm chat
- **cuocgoi**: Cuộc gọi
- **quanhe**: Mối quan hệ bạn bè

## Lưu ý

- **Tests đã được tắt** để tránh lỗi configuration
- Sử dụng `-DskipTests` trong mọi Maven command
- Đảm bảo SQL Server đang chạy trước khi start ứng dụng
- Kiểm tra log để debug nếu có lỗi

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra SQL Server đang chạy
- Kiểm tra connection string trong `application.properties`
- Kiểm tra firewall port 1433

### Lỗi build
- Đảm bảo Java 17+ đã cài đặt
- Chạy `mvn clean` trước khi build lại
- Sử dụng `-DskipTests` để bỏ qua tests

