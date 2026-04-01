# Test Backend APIs - Đơn giản

## 1. Health Check
```bash
curl -X GET http://localhost:8080/api/test/health
```

## 2. User Registration
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

## 3. User Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

## 4. Test với JWT Token
```bash
# Lấy token từ response của login, sau đó sử dụng:
curl -X GET http://localhost:8080/api/chat/messages/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 5. WebSocket Test
Mở browser console và chạy:
```javascript
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);
stompClient.connect({}, function(frame) {
    console.log('Connected: ' + frame);
});
```

## 6. Test Frontend
1. Chạy backend: `mvn spring-boot:run`
2. Chạy frontend: `cd allies_frontend && npm start`
3. Mở browser: `http://localhost:4200`
