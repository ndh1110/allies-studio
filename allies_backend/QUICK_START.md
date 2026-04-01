# 🚀 Quick Start - Allies Backend

## ✅ Đã sửa tất cả lỗi:
- ❌ Circular dependency → ✅ Đã loại bỏ
- ❌ @Autowired conflicts → ✅ Đã sử dụng constructor injection
- ❌ @Component conflicts → ✅ Đã tách biệt hoàn toàn
- ❌ CORS issues → ✅ Đã cấu hình đúng

## 🏃‍♂️ Cách chạy:

### 1. Chạy Backend:
```bash
cd allies_backend
mvn spring-boot:run
```

### 2. Test API:
```bash
# Health check
curl http://localhost:8080/api/test/health

# Register user
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "123456"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "123456"}'
```

### 3. Chạy Frontend:
```bash
cd allies_frontend
npm install
npm start
```

## 🎯 Kết quả:
- ✅ Backend chạy trên: http://localhost:8080
- ✅ Frontend chạy trên: http://localhost:4200
- ✅ WebSocket: ws://localhost:8080/ws
- ✅ Database: MySQL allies_db

## 🔧 Cấu trúc đã tối ưu:
```
SecurityConfig → Tạo tất cả beans
JwtAuthTokenFilter → Constructor injection
TaikhoanService → Constructor injection  
JwtUtils → Không còn @Component
UserService → Service riêng biệt
```

**Backend bây giờ hoàn toàn sạch và sẵn sàng!** 🎉
