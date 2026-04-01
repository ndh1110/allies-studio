# Allies Backend API Documentation

## Overview
This is a Spring Boot backend application for the Allies messaging and video calling platform. It provides authentication, real-time messaging via WebSocket, and video calling functionality.

## Features
- JWT-based authentication
- Real-time messaging with WebSocket
- Video calling functionality
- MySQL database integration
- RESTful API endpoints

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Chat/Messaging
- `GET /api/chat/messages/{userId}` - Get messages for a user
- `GET /api/chat/messages/{userId1}/{userId2}` - Get conversation between two users
- `POST /api/chat/send` - Send a message via REST API

### Video Calling
- `GET /api/call/history/{userId}` - Get call history for a user
- `POST /api/call/create` - Create a new call

### WebSocket Endpoints
- `/ws` - WebSocket connection endpoint
- `/app/chat.sendMessage` - Send message via WebSocket
- `/app/chat.addUser` - Add user to chat
- `/app/call.initiate` - Initiate a call
- `/app/call.answer` - Answer a call
- `/app/call.end` - End a call

### Test
- `GET /api/test/health` - Health check endpoint

## Database Models

### Taikhoan (Account)
- `maTk` - Account ID
- `tenDn` - Username
- `mk` - Password (encrypted)
- `avarta` - Avatar URL

### Chat
- `id` - Chat ID
- `maTkA` - Sender account
- `maTkB` - Receiver account
- `noiDung` - Message content
- `maMedia` - Media reference
- `thoiGian` - Timestamp
- `trangThai` - Status

### Cuocgoi (Call)
- `id` - Call ID
- `maNhom` - Group reference
- `loaiGoi` - Call type (voice/video)
- `thoiGianBatDau` - Start time
- `thoiGianKetThuc` - End time
- `nguoiTaoCall` - Call creator
- `trangThai` - Call status
- `tongThoiLuongGiay` - Total duration in seconds

## Configuration

### Database
- MySQL database: `allies_db`
- Connection: `localhost:3306`
- Username: `root`
- Password: (empty)

### JWT
- Secret: `mySecretKey123456789012345678901234567890123456789012345678901234567890`
- Expiration: 24 hours (86400000 ms)

## Running the Application

1. Make sure MySQL is running on localhost:3306
2. Create database `allies_db`
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## WebSocket Usage

### Connecting
```javascript
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);
```

### Sending Messages
```javascript
stompClient.send("/app/chat.sendMessage", {}, JSON.stringify({
    maTkA: senderAccount,
    maTkB: receiverAccount,
    noiDung: "Hello!",
    thoiGian: new Date(),
    trangThai: "sent"
}));
```

### Initiating Calls
```javascript
stompClient.send("/app/call.initiate", {}, JSON.stringify({
    callerId: "username1",
    receiverId: "username2",
    callType: "video"
}));
```

## Security

- All endpoints except `/api/auth/**` and `/ws/**` require JWT authentication
- Passwords are encrypted using BCrypt
- JWT tokens are included in the `Authorization` header as `Bearer <token>`
