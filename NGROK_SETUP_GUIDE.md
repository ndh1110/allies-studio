# 🚀 Hướng dẫn sử dụng Ngrok để tạo Public IP cho Backend

## 📋 Yêu cầu
- Backend đang chạy trên port 8080
- Frontend đang chạy trên port 4200
- Ngrok đã được cài đặt

## 🔧 Cài đặt Ngrok

### Cách 1: Tải trực tiếp
1. Truy cập: https://ngrok.com/download
2. Tải phiên bản Windows
3. Giải nén và đặt vào thư mục trong PATH

### Cách 2: Sử dụng Chocolatey
```powershell
choco install ngrok
```

### Cách 3: Sử dụng Scoop
```powershell
scoop install ngrok
```

## 🔑 Cấu hình Ngrok

1. **Đăng ký tài khoản ngrok**:
   - Truy cập: https://ngrok.com/
   - Đăng ký tài khoản miễn phí

2. **Lấy Authtoken**:
   - Đăng nhập vào dashboard
   - Vào phần "Your Authtoken"
   - Copy token

3. **Cấu hình token**:
   ```powershell
   ngrok authtoken YOUR_AUTHTOKEN
   ```

## 🚀 Cách sử dụng

### Phương pháp 1: Sử dụng script tự động
```powershell
# Chạy script tổng hợp
powershell -ExecutionPolicy Bypass -File start-with-ngrok.ps1
```

### Phương pháp 2: Chạy từng bước

#### Bước 1: Khởi động Backend
```powershell
cd allies_backend
mvn spring-boot:run
```

#### Bước 2: Khởi động Ngrok (terminal mới)
```powershell
ngrok http 8080
```

#### Bước 3: Cấu hình Frontend
```powershell
cd allies_frontend
powershell -ExecutionPolicy Bypass -File configure-ngrok.ps1
```

#### Bước 4: Khởi động Frontend
```powershell
ng serve
```

## 📱 Truy cập từ máy khác

1. **Lấy ngrok URL**:
   - Truy cập: http://localhost:4040
   - Copy URL có dạng: `https://abc123.ngrok.io`

2. **Cấu hình frontend**:
   - Script sẽ tự động cập nhật `environment.ts`
   - Hoặc cập nhật thủ công:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'https://abc123.ngrok.io'
   };
   ```

3. **Truy cập từ máy khác**:
   - Mở trình duyệt
   - Truy cập: `http://IP_MÁY_CHỦ:4200`
   - Ví dụ: `http://192.168.1.100:4200`

## 🔧 Cấu hình nâng cao

### Ngrok với authentication
```powershell
ngrok http -auth="username:password" 8080
```

### Ngrok với subdomain (tài khoản trả phí)
```powershell
ngrok http -subdomain=myapp 8080
```

### Ngrok với custom domain
```powershell
ngrok http -hostname=myapp.example.com 8080
```

## 🐛 Troubleshooting

### Lỗi "ngrok not found"
- Đảm bảo ngrok đã được cài đặt và có trong PATH
- Thử chạy: `ngrok version`

### Lỗi "authtoken not configured"
- Chạy: `ngrok authtoken YOUR_AUTHTOKEN`

### Lỗi "port 8080 already in use"
- Kiểm tra backend có đang chạy không
- Thay đổi port backend trong `application.properties`

### Lỗi "ngrok session limit"
- Tài khoản miễn phí có giới hạn session
- Đăng nhập vào dashboard để kiểm tra

## 📊 Monitoring

- **Ngrok Dashboard**: http://localhost:4040
- **Backend Health**: http://localhost:8080/api/test/health
- **Frontend**: http://localhost:4200

## 🔒 Bảo mật

1. **Chỉ sử dụng cho development**
2. **Không expose production data**
3. **Sử dụng authentication nếu cần**
4. **Tắt ngrok khi không sử dụng**

## 📝 Lưu ý

- URL ngrok miễn phí sẽ thay đổi mỗi lần khởi động
- Để có URL cố định, cần nâng cấp tài khoản
- Ngrok có giới hạn bandwidth cho tài khoản miễn phí
- Luôn kiểm tra ngrok dashboard để theo dõi traffic
