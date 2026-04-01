# Hướng dẫn thiết lập Database Allies

## 1. Yêu cầu hệ thống
- SQL Server 2016 trở lên hoặc SQL Server Management Studio
- Quyền tạo database và user

## 2. Các bước thiết lập

### Bước 1: Tạo Database
1. Mở SQL Server Management Studio
2. Kết nối đến SQL Server instance
3. Mở file `allies_database_schema.sql`
4. Chạy toàn bộ script để tạo database và các bảng

### Bước 2: Cấu hình Backend
Cập nhật file `application.properties`:

```properties
# Cấu hình SQL Server
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=allies_db;encrypt=false;trustServerCertificate=true
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# Cấu hình JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.database-platform=org.hibernate.dialect.SQLServerDialect
```

### Bước 3: Thêm Dependency SQL Server
Thêm vào file `pom.xml`:

```xml
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <scope>runtime</scope>
</dependency>
```

## 3. Cấu trúc Database

### Các bảng chính:

1. **Taikhoan** - Quản lý tài khoản đăng nhập
   - `MA_TK` (INT, PRIMARY KEY) - Mã tài khoản
   - `TEN_DN` (NVARCHAR(50)) - Tên đăng nhập
   - `MK` (NVARCHAR(255)) - Mật khẩu (đã mã hóa)
   - `AVARTA` (NVARCHAR(500)) - Đường dẫn avatar

2. **user** - Thông tin chi tiết người dùng
   - `ID` (INT, PRIMARY KEY) - Mã người dùng
   - `MA_TK` (INT, FOREIGN KEY) - Liên kết với Taikhoan
   - `TEN` (NVARCHAR(255)) - Tên đầy đủ
   - `DIA_CHI` (NVARCHAR(255)) - Địa chỉ
   - `SDT` (NVARCHAR(20)) - Số điện thoại
   - `MAIL` (NVARCHAR(255)) - Email

3. **chat** - Tin nhắn riêng
   - `MA_CHAT` (INT, PRIMARY KEY) - Mã tin nhắn
   - `MA_TK_A` (INT, FOREIGN KEY) - Người gửi
   - `MA_TK_B` (INT, FOREIGN KEY) - Người nhận
   - `NOI_DUNG` (NTEXT) - Nội dung tin nhắn
   - `MA_MEDIA` (INT, FOREIGN KEY) - File đính kèm
   - `ThoiGian` (DATETIME2) - Thời gian gửi
   - `TrangThai` (NVARCHAR(50)) - Trạng thái tin nhắn

4. **nhom** - Nhóm chat
   - `MA_NHOM` (INT, PRIMARY KEY) - Mã nhóm
   - `TEN_NHOM` (NVARCHAR(255)) - Tên nhóm
   - `NGUOI_TAO` (INT, FOREIGN KEY) - Người tạo nhóm
   - `NGAY_TAO` (DATETIME2) - Ngày tạo

5. **tinnhannhom** - Tin nhắn nhóm
   - `MA_TN_NHOM` (INT, PRIMARY KEY) - Mã tin nhắn nhóm
   - `MA_NHOM` (INT, FOREIGN KEY) - Mã nhóm
   - `MA_TK_GUI` (INT, FOREIGN KEY) - Người gửi
   - `NOI_DUNG` (NTEXT) - Nội dung
   - `THOI_GIAN` (DATETIME2) - Thời gian gửi

6. **cuocgoi** - Cuộc gọi
   - `MA_CALL` (INT, PRIMARY KEY) - Mã cuộc gọi
   - `MA_NHOM` (INT, FOREIGN KEY) - Nhóm (nếu là group call)
   - `LOAI_GOI` (NVARCHAR(50)) - Loại gọi (voice/video)
   - `THOI_GIAN_BAT_DAU` (DATETIME2) - Thời gian bắt đầu
   - `THOI_GIAN_KET_THUC` (DATETIME2) - Thời gian kết thúc
   - `NGUOI_TAO_CALL` (INT, FOREIGN KEY) - Người tạo cuộc gọi
   - `TRANG_THAI` (NVARCHAR(50)) - Trạng thái cuộc gọi

7. **quanhe** - Mối quan hệ bạn bè
   - `MA_QH` (INT, PRIMARY KEY) - Mã quan hệ
   - `MA_TK_1` (INT, FOREIGN KEY) - Tài khoản 1
   - `MA_TK_2` (INT, FOREIGN KEY) - Tài khoản 2
   - `TRANG_THAI` (NVARCHAR(50)) - Trạng thái (pending/accepted/blocked)

8. **media** - File đính kèm
   - `MA_MEDIA` (INT, PRIMARY KEY) - Mã media
   - `TEN_FILE` (NVARCHAR(255)) - Tên file
   - `DUONG_DAN_URL` (NVARCHAR(500)) - Đường dẫn file
   - `LOAI_MEDIA` (NVARCHAR(50)) - Loại media
   - `KICH_THUOC_KB` (INT) - Kích thước file

## 4. Stored Procedures

### sp_GetFriends
```sql
EXEC sp_GetFriends @MaTk = 1
```
Lấy danh sách bạn bè của một tài khoản

### sp_GetChatHistory
```sql
EXEC sp_GetChatHistory @MaTkA = 1, @MaTkB = 2
```
Lấy lịch sử chat giữa hai người dùng

### sp_SendMessage
```sql
EXEC sp_SendMessage 
    @MaTkA = 1, 
    @MaTkB = 2, 
    @NoiDung = 'Xin chào!', 
    @MaMedia = NULL, 
    @TrangThai = 'sent'
```
Gửi tin nhắn mới

## 5. Views hữu ích

### vw_UserInfo
View chứa thông tin đầy đủ của người dùng (tài khoản + thông tin cá nhân)

### vw_RecentMessages
View chứa tin nhắn gần nhất với thông tin người gửi/nhận

## 6. Tạo tài khoản admin đầu tiên

### Cách 1: Sử dụng script SQL
```sql
-- Chạy file create_admin_account.sql
-- Tài khoản: admin / admin123
```

### Cách 2: Sử dụng API
```bash
POST /api/auth/signup
{
  "username": "admin",
  "password": "admin123"
}
```

### Cách 3: Thêm trực tiếp vào database
```sql
INSERT INTO Taikhoan (TEN_DN, MK, AVARTA) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'admin-avatar.png');
```

## 7. Troubleshooting

### Lỗi kết nối
- Kiểm tra SQL Server đang chạy
- Kiểm tra port 1433 có mở không
- Kiểm tra username/password

### Lỗi authentication
- Đảm bảo user có quyền tạo database
- Kiểm tra SQL Server authentication mode

### Lỗi foreign key
- Đảm bảo thứ tự tạo bảng đúng (tạo bảng cha trước)
- Kiểm tra dữ liệu mẫu có vi phạm ràng buộc không

## 8. Backup và Restore

### Backup
```sql
BACKUP DATABASE allies_db TO DISK = 'C:\backup\allies_db.bak'
```

### Restore
```sql
RESTORE DATABASE allies_db FROM DISK = 'C:\backup\allies_db.bak'
```
