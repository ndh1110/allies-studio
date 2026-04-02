import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { WebSocketService } from '../../services/websocket.service';
import { AuthService } from '../../services/auth.service';
import { ChatStateService } from '../../services/chat-state.service';
import { ChatMessage, ChatRoom } from '../../models/chat.model';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <!-- Chat Header -->
      <div class="chat-header">
        <h3>Chat với {{ currentChatUser?.tenDn || 'Chọn người để chat' }}</h3>
        <div class="user-info" *ngIf="currentChatUser">
          <span class="status-indicator" [class.online]="isUserOnline"></span>
          {{ currentChatUser.tenDn }}
        </div>
      </div>

      <!-- Chat Messages -->
      <div class="chat-messages" #messagesContainer>
        <div *ngIf="messages.length === 0" class="no-messages">
          <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
        
        <div *ngFor="let message of messages" 
             class="message" 
             [class.sent]="message.maTkA.id === currentUser?.id"
             [class.received]="message.maTkB.id === currentUser?.id">
          
          <div class="message-content">
            <div class="message-text">{{ message.noiDung }}</div>
            <div class="message-time">
              {{ formatTime(message.thoiGian) }}
              <span *ngIf="message.maTkA?.id === currentUser?.id" class="message-status">
                {{ getStatusIcon(message.trangThai) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div *ngIf="isTyping" class="typing-indicator">
        <span>{{ currentChatUser?.tenDn }} đang nhập...</span>
      </div>

      <!-- Message Input -->
      <div class="message-input" *ngIf="currentChatUser">
        <div class="input-group">
          <input 
            type="text" 
            [(ngModel)]="newMessage" 
            (keydown.enter)="sendMessage()"
            (keydown)="onTyping()"
            placeholder="Nhập tin nhắn..."
            class="message-text-input"
            [disabled]="!isConnected">
          <button 
            (click)="sendMessage()" 
            [disabled]="!newMessage.trim() || !isConnected"
            class="send-button">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

      <!-- Connection Status -->
      <div class="connection-status" [class.connected]="isConnected">
        <span *ngIf="!isConnected">Đang kết nối...</span>
        <span *ngIf="isConnected">Đã kết nối</span>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
    }

    .chat-header {
      background: #007bff;
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-header h3 {
      margin: 0;
      font-size: 1.2rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #dc3545;
    }

    .status-indicator.online {
      background: #28a745;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f8f9fa;
    }

    .no-messages {
      text-align: center;
      color: #6c757d;
      margin-top: 50px;
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
      position: relative;
    }

    .message.sent .message-content {
      background: #007bff;
      color: white;
      border-bottom-right-radius: 5px;
    }

    .message.received .message-content {
      background: white;
      color: #333;
      border: 1px solid #e9ecef;
      border-bottom-left-radius: 5px;
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
      align-items: center;
      gap: 5px;
    }

    .message.sent .message-time {
      justify-content: flex-end;
    }

    .message-status {
      font-size: 0.7rem;
    }

    .typing-indicator {
      padding: 10px 20px;
      color: #6c757d;
      font-style: italic;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }

    .message-input {
      padding: 15px 20px;
      background: white;
      border-top: 1px solid #e9ecef;
    }

    .input-group {
      display: flex;
      gap: 10px;
    }

    .message-text-input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 25px;
      outline: none;
      font-size: 14px;
    }

    .message-text-input:focus {
      border-color: #007bff;
    }

    .message-text-input:disabled {
      background: #f8f9fa;
      cursor: not-allowed;
    }

    .send-button {
      background: #007bff;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .send-button:hover:not(:disabled) {
      background: #0056b3;
    }

    .send-button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .connection-status {
      padding: 5px 20px;
      font-size: 0.8rem;
      text-align: center;
      background: #dc3545;
      color: white;
    }

    .connection-status.connected {
      background: #28a745;
    }

    /* Scrollbar styling */
    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .chat-container {
        height: 100vh;
        border-radius: 0;
        border: none;
      }
      
      .message-content {
        max-width: 85%;
      }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked, OnChanges {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @Input() currentChatUser: User | null = null;

  messages: ChatMessage[] = [];
  newMessage: string = '';
  currentUser: User | null = null;
  isConnected: boolean = false;
  isTyping: boolean = false;
  typingTimeout: any;

  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private chatStateService: ChatStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to WebSocket messages (ONLY ONCE)
    this.subscriptions.push(
      this.webSocketService.messages$.subscribe(message => {
        console.log('ChatComponent received message:', message);
        if (message) {
          this.addMessage(message);
        }
      })
    );

    // Subscribe to typing indicators
    this.subscriptions.push(
      this.webSocketService.typing$.subscribe(typing => {
        if (typing && typing.userId === this.currentChatUser?.id) {
          this.isTyping = typing.isTyping;
        }
      })
    );

    // Subscribe to connection status changes
    this.subscriptions.push(
      this.webSocketService.connectionStatus$.subscribe(status => {
        if (this.isConnected !== status) {
          this.isConnected = status;
          this.cdr.detectChanges();
        }
      })
    );

    // Get current connection status
    this.isConnected = this.webSocketService.getConnectionStatus();

    // Subscribe to user-specific messages
    if (this.currentUser) {
      this.webSocketService.subscribeToUserQueue(this.currentUser.tenDn);
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ChatComponent: ngOnChanges called with:', changes);
    if (changes['currentChatUser'] && this.currentChatUser) {
      console.log('ChatComponent: currentChatUser changed to:', this.currentChatUser);
      this.loadChatHistory();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.webSocketService.disconnect();
  }


  private loadChatHistory(): void {
    if (!this.currentUser || !this.currentChatUser) return;

    console.log('Loading chat history between:', this.currentUser.id, 'and', this.currentChatUser.id);

    // Always load from server first to get latest messages
    this.chatService.getConversation(this.currentUser.id, this.currentChatUser.id)
      .subscribe({
        next: (messages) => {
          console.log('Loaded messages from server:', messages.length);
          this.messages = messages || [];
          
          // Save to chat state service for offline access
          this.chatStateService.saveChatHistory(this.currentChatUser!.id, this.messages);
          
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Lỗi khi tải lịch sử chat:', error);
          
          // Fallback to chat state service if server fails
          const savedMessages = this.chatStateService.getChatHistory(this.currentChatUser!.id);
          if (savedMessages.length > 0) {
            this.messages = savedMessages;
            this.scrollToBottom();
          }
        }
      });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.currentUser || !this.currentChatUser) return;

    const message: ChatMessage = {
      maTkA: this.currentUser,
      maTkB: this.currentChatUser,
      noiDung: this.newMessage.trim(),
      thoiGian: new Date(),
      trangThai: 'sending'
    };

    // Check and maintain WebSocket connection before sending
    this.webSocketService.checkAndMaintainConnection();

    // Send via WebSocket if connected
    if (this.isConnected) {
      this.webSocketService.sendMessage(message);
      console.log('Message sent via WebSocket');
    } else {
      console.warn('WebSocket not connected, sending via REST API');
      // Add message to UI immediately for sender when using REST API
      this.addMessage(message);
      // Fallback to REST API if WebSocket is not connected
      this.chatService.sendMessage(message).subscribe({
        next: (savedMessage) => {
          console.log('Message saved via REST API:', savedMessage);
          // Update message with server response
          const index = this.messages.findIndex(m => m === message);
          if (index !== -1) {
            this.messages[index] = savedMessage;
            // Save updated messages to chat state
            this.chatStateService.saveChatHistory(this.currentChatUser!.id, this.messages);
          }
        },
        error: (error) => {
          console.error('Lỗi khi gửi tin nhắn:', error);
          // Mark message as failed
          const index = this.messages.findIndex(m => m === message);
          if (index !== -1) {
            this.messages[index].trangThai = 'failed';
          }
        }
      });
    }

    this.newMessage = '';
  }

  private addMessage(message: ChatMessage): void {
    console.log('addMessage called with:', message);
    console.log('Current chat user:', this.currentChatUser);
    console.log('Current user:', this.currentUser);
    
    // Check if message is for current conversation
    if (this.currentChatUser && 
        ((message.maTkA?.id === this.currentUser?.id && message.maTkB?.id === this.currentChatUser.id) ||
         (message.maTkB?.id === this.currentUser?.id && message.maTkA?.id === this.currentChatUser.id))) {
      
      console.log('Message is for current conversation, adding...');
      
      // Check if message already exists
      const exists = this.messages.some(m => 
        m.id === message.id || 
        (m.noiDung === message.noiDung && new Date(m.thoiGian).getTime() === new Date(message.thoiGian).getTime())
      );
      
      if (!exists) {
        console.log('Adding new message to UI');
        this.messages.push(message);
        // Save to chat state service
        this.chatStateService.addMessageToHistory(this.currentChatUser.id, message);
        this.scrollToBottom();
      } else {
        console.log('Message already exists, skipping');
      }
    } else {
      console.log('Message is not for current conversation, ignoring');
    }
  }

  onTyping(): void {
    if (!this.currentChatUser) return;
    
    // Send typing indicator
    this.webSocketService.sendTypingIndicator(this.currentChatUser.id, true);
    
    // Clear previous timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    // Set timeout to stop typing indicator
    this.typingTimeout = setTimeout(() => {
      this.webSocketService.sendTypingIndicator(this.currentChatUser!.id, false);
    }, 1000);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageDate.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      case 'sending':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '';
    }
  }

  get isUserOnline(): boolean {
    if (!this.currentChatUser) return false;
    
    // Check if user is in online users list
    // This would need to be implemented with a proper online users service
    // For now, we'll assume all users are online if they have a valid ID
    return this.currentChatUser.id > 0;
  }
}
