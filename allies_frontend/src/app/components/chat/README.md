# Chat Components

Bộ components hoàn chỉnh cho tính năng chat real-time với các tính năng:

## Components

### 1. ChatMainComponent
Component chính quản lý toàn bộ giao diện chat
- Responsive design (mobile/desktop)
- Quản lý state của chat
- Tích hợp WebSocket

### 2. ChatComponent
Component hiển thị cuộc trò chuyện
- Hiển thị tin nhắn real-time
- Typing indicator
- Gửi tin nhắn
- Scroll tự động
- Status của tin nhắn (sent, delivered, read)

### 3. ChatListComponent
Component danh sách người dùng để chat
- Hiển thị danh sách người dùng
- Tìm kiếm người dùng
- Hiển thị tin nhắn cuối cùng
- Đếm tin nhắn chưa đọc
- Status online/offline

### 4. OnlineUsersComponent
Component hiển thị người dùng online
- Danh sách người dùng đang online
- Real-time updates
- Chỉ hiển thị trên desktop

### 5. ChatHistoryComponent
Component lịch sử chat
- Xem lịch sử tin nhắn
- Tìm kiếm tin nhắn
- Lọc theo ngày
- Xuất file lịch sử
- Sao chép tin nhắn

## Services

### 1. WebSocketService
Quản lý kết nối WebSocket
- Kết nối/ngắt kết nối
- Gửi/nhận tin nhắn
- Typing indicator
- User presence
- Connection status

### 2. ChatService
Quản lý API chat
- Lấy tin nhắn
- Gửi tin nhắn
- Lấy cuộc trò chuyện
- REST API calls

### 3. ChatStateService
Quản lý state của chat
- Selected user
- Messages
- Unread counts
- State management

## Models

### ChatMessage
```typescript
interface ChatMessage {
  id?: number;
  maTkA: User;
  maTkB: User;
  noiDung: string;
  thoiGian: Date;
  trangThai: string;
  maMedia?: Media;
}
```

### User
```typescript
interface User {
  id: number;
  tenDn: string;
  email: string;
  avatar?: string;
  online?: boolean;
  lastSeen?: Date;
}
```

## Tính năng

### Real-time Chat
- Tin nhắn real-time qua WebSocket
- Typing indicator
- Status tin nhắn (sent, delivered, read)
- Connection status

### Lịch sử Chat
- Lưu trữ trong database
- Tìm kiếm tin nhắn
- Lọc theo ngày
- Xuất file
- Sao chép tin nhắn

### User Presence
- Hiển thị người dùng online
- Real-time updates
- Connection/disconnection events

### Responsive Design
- Mobile: Chat list hoặc chat
- Desktop: Chat list + chat + online users
- Adaptive layout

## Cách sử dụng

### 1. Import components
```typescript
import { ChatMainComponent } from './components/chat/chat-main.component';
```

### 2. Sử dụng trong template
```html
<app-chat-main></app-chat-main>
```

### 3. Cấu hình WebSocket
Đảm bảo WebSocket được cấu hình trong backend và frontend environment.

### 4. Authentication
Đảm bảo user đã đăng nhập trước khi sử dụng chat.

## Backend Requirements

### WebSocket Configuration
- STOMP protocol
- Endpoints: `/ws`
- Topics: `/topic/public`, `/topic/typing`, `/topic/presence`
- User queues: `/user/{username}/queue/messages`

### API Endpoints
- `GET /api/chat/messages/{userId}` - Lấy tin nhắn của user
- `GET /api/chat/messages/{userId1}/{userId2}` - Lấy cuộc trò chuyện
- `POST /api/chat/send` - Gửi tin nhắn
- `GET /api/chat/online-users` - Lấy danh sách user online

### Database
- Bảng `chat` với các trường: MA_CHAT, MA_TK_A, MA_TK_B, NOI_DUNG, ThoiGian, TrangThai
- Indexes cho performance
- Foreign keys cho relationships

## Styling

Components sử dụng CSS modules với:
- Responsive design
- Modern UI/UX
- Smooth animations
- Custom scrollbars
- Status indicators
- Loading states

## Performance

- Lazy loading cho messages
- Virtual scrolling cho large lists
- Debounced search
- Efficient WebSocket handling
- Memory management
