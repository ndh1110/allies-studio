import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { ChatMessage } from '../../models/chat.model';
import { WebSocketService } from '../../services/websocket.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-test-container">
      <div class="test-header">
        <h3>Test Chat giữa 2 tài khoản</h3>
        <div class="user-selector">
          <label>Chọn tài khoản:</label>
          <select [(ngModel)]="selectedUser" (change)="switchUser()" class="user-select">
            <option value="1">User 1 (user1)</option>
            <option value="2">User 2 (user2)</option>
          </select>
        </div>
      </div>

      <div class="chat-interface">
        <div class="user-info">
          <h4>Đang đăng nhập với: {{ currentUser?.tenDn }}</h4>
          <div class="connection-status" [class.connected]="isConnected">
            {{ isConnected ? 'Đã kết nối' : 'Chưa kết nối' }}
          </div>
        </div>

        <div class="chat-messages" #messagesContainer>
          <div *ngFor="let message of messages" 
               class="message" 
                [class.sent]="message.maTkA.id === currentUser?.id"
                [class.received]="message.maTkB.id === currentUser?.id">
            
            <div class="message-content">
              <div class="message-text">{{ message.noiDung }}</div>
              <div class="message-time">
                {{ formatTime(message.thoiGian) }}
                <span class="message-status">{{ getStatusIcon(message.trangThai) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="message-input">
          <input 
            type="text" 
            [(ngModel)]="newMessage" 
            (keydown.enter)="sendMessage()"
            placeholder="Nhập tin nhắn..."
            class="message-text-input">
          <button (click)="sendMessage()" [disabled]="!newMessage.trim()" class="send-button">
            Gửi
          </button>
        </div>
      </div>

      <div class="test-instructions">
        <h4>Hướng dẫn test:</h4>
        <ol>
          <li>Mở 2 tab trình duyệt khác nhau</li>
          <li>Tab 1: Chọn "User 1" và kết nối</li>
          <li>Tab 2: Chọn "User 2" và kết nối</li>
          <li>Gửi tin nhắn từ tab này sẽ hiển thị ở tab kia</li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .chat-test-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e9ecef;
    }

    .user-selector {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-select {
      padding: 5px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .chat-interface {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }

    .user-info {
      background: #f8f9fa;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .connection-status {
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 0.9rem;
      background: #dc3545;
      color: white;
    }

    .connection-status.connected {
      background: #28a745;
    }

    .chat-messages {
      height: 400px;
      overflow-y: auto;
      padding: 20px;
      background: #f8f9fa;
    }

    .message {
      margin-bottom: 15px;
      display: flex;
    }

    .message.sent {
      justify-content: flex-end;
    }

    .message.received {
      justify-content: flex-start;
    }

    .message-content {
      max-width: 70%;
      padding: 10px 15px;
      border-radius: 18px;
    }

    .message.sent .message-content {
      background: #007bff;
      color: white;
    }

    .message.received .message-content {
      background: white;
      color: #333;
      border: 1px solid #e9ecef;
    }

    .message-text {
      word-wrap: break-word;
      line-height: 1.4;
    }

    .message-time {
      font-size: 0.75rem;
      opacity: 0.7;
      margin-top: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .message-status {
      font-size: 0.7rem;
    }

    .message-input {
      padding: 15px;
      background: white;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 10px;
    }

    .message-text-input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 25px;
      outline: none;
    }

    .message-text-input:focus {
      border-color: #007bff;
    }

    .send-button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
    }

    .send-button:hover:not(:disabled) {
      background: #0056b3;
    }

    .send-button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .test-instructions {
      margin-top: 20px;
      padding: 15px;
      background: #e3f2fd;
      border-radius: 8px;
    }

    .test-instructions h4 {
      margin: 0 0 10px 0;
      color: #1976d2;
    }

    .test-instructions ol {
      margin: 0;
      padding-left: 20px;
    }

    .test-instructions li {
      margin-bottom: 5px;
      color: #333;
    }
  `]
})
export class ChatTestComponent implements OnInit, OnDestroy {
  selectedUser: string = '1';
  currentUser: User | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isConnected: boolean = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private webSocketService: WebSocketService,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setupUser();
    this.connectWebSocket();
    this.subscribeToMessages();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.webSocketService.disconnect();
  }

  private setupUser(): void {
    // Tạo mock users cho test
    if (this.selectedUser === '1') {
      this.currentUser = { id: 1, tenDn: 'user1', email: 'user1@test.com' };
    } else {
      this.currentUser = { id: 2, tenDn: 'user2', email: 'user2@test.com' };
    }
  }

  private connectWebSocket(): void {
    this.webSocketService.connect(this.currentUser!);
    this.isConnected = this.webSocketService.getConnectionStatus();
    
    // Subscribe to user queue
    this.webSocketService.subscribeToUserQueue(this.currentUser!.tenDn);
  }

  private subscribeToMessages(): void {
    this.subscriptions.push(
      this.webSocketService.messages$.subscribe(message => {
        if (message) {
          this.messages.push(message);
        }
      })
    );
  }

  switchUser(): void {
    this.webSocketService.disconnect();
    this.setupUser();
    this.connectWebSocket();
    this.messages = [];
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.currentUser) return;

    const message: ChatMessage = {
      maTkA: this.currentUser,
      maTkB: this.currentUser.id === 1 ? { id: 2, tenDn: 'user2', email: 'user2@test.com' } : { id: 1, tenDn: 'user1', email: 'user1@test.com' },
      noiDung: this.newMessage.trim(),
      thoiGian: new Date(),
      trangThai: 'sending'
    };

    // Gửi qua WebSocket
    this.webSocketService.sendMessage(message);
    
    // Thêm vào danh sách tin nhắn
    this.messages.push(message);
    
    this.newMessage = '';
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      case 'sending': return '⏳';
      case 'failed': return '❌';
      default: return '';
    }
  }
}
