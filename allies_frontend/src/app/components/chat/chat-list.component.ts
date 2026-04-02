import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { ChatMessage } from '../../models/chat.model';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-list-container">
      <div class="chat-list-header">
        <h3>Danh sách chat</h3>
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="filterUsers()"
            placeholder="Tìm kiếm người dùng..."
            class="search-input">
        </div>
      </div>

      <div class="chat-list">
        <div *ngIf="filteredUsers.length === 0" class="no-users">
          <p>Không tìm thấy người dùng nào</p>
        </div>

        <div *ngFor="let user of filteredUsers" 
             class="chat-item"
             [class.active]="selectedUser?.id === user.id"
             (click)="selectUser(user)">
          
          <div class="user-avatar">
            <div class="avatar-icon">
              {{ user.tenDn.charAt(0).toUpperCase() }}
            </div>
            <span class="online-indicator" *ngIf="isUserOnline(user.id)"></span>
          </div>

          <div class="user-info">
            <div class="user-name">{{ user.tenDn }}</div>
            <div class="last-message" *ngIf="getLastMessage(user.id)">
              {{ getLastMessage(user.id)?.noiDung }}
            </div>
            <div class="last-message-time" *ngIf="getLastMessage(user.id)">
              {{ formatTime(getLastMessage(user.id)!.thoiGian) }}
            </div>
          </div>

          <div class="chat-meta">
            <span class="unread-count" *ngIf="getUnreadCount(user.id) > 0">
              {{ getUnreadCount(user.id) }}
            </span>
            <div class="message-status" *ngIf="getLastMessage(user.id)">
              {{ getStatusIcon(getLastMessage(user.id)!.trangThai) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-list-container {
      width: 300px;
      height: 100vh;
      border-right: 1px solid #e9ecef;
      background: white;
      display: flex;
      flex-direction: column;
    }

    .chat-list-header {
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .chat-list-header h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 1.2rem;
    }

    .search-box {
      position: relative;
    }

    .search-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    }

    .search-input:focus {
      border-color: #007bff;
    }

    .chat-list {
      flex: 1;
      overflow-y: auto;
    }

    .no-users {
      padding: 20px;
      text-align: center;
      color: #6c757d;
    }

    .chat-item {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background 0.2s;
    }

    .chat-item:hover {
      background: #f8f9fa;
    }

    .chat-item.active {
      background: #e3f2fd;
      border-left: 3px solid #007bff;
    }

    .user-avatar {
      position: relative;
      margin-right: 12px;
    }

    .avatar-icon {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
    }

    .online-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background: #28a745;
      border: 2px solid white;
      border-radius: 50%;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .last-message {
      color: #6c757d;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
    }

    .last-message-time {
      color: #999;
      font-size: 0.8rem;
    }

    .chat-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .unread-count {
      background: #007bff;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .message-status {
      font-size: 0.8rem;
      color: #6c757d;
    }

    /* Scrollbar styling */
    .chat-list::-webkit-scrollbar {
      width: 4px;
    }

    .chat-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .chat-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 2px;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .chat-list-container {
        width: 100%;
        height: 100vh;
      }
    }
  `]
})
export class ChatListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  searchTerm: string = '';
  lastMessages: Map<number, ChatMessage> = new Map();
  unreadCounts: Map<number, number> = new Map();
  conversations: any[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.subscribeToMessages();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadUsers(): void {
    // Load conversations from API
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.chatService.getConversations(currentUser.id).subscribe({
        next: (conversations) => {
          console.log('Loaded conversations:', conversations);
          this.conversations = conversations || [];
          // Convert conversations to users format
          this.users = this.conversations.map(conv => ({
            id: conv.partnerId,
            tenDn: conv.partnerName,
            email: '',
            avatar: conv.partnerAvatar
          }));
          this.filteredUsers = [...this.users];
          
          // If no conversations found, try fallback
          if (this.users.length === 0) {
            this.loadOnlineUsers();
          }
        },
        error: (error) => {
          console.error('Error loading conversations:', error);
          // Fallback to online users
          this.loadOnlineUsers();
        }
      });
    } else {
      this.loadOnlineUsers();
    }
  }

  private loadOnlineUsers(): void {
    // Fallback: Load online users
    this.chatService.getOnlineUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...this.users];
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách user:', error);
        // Fallback to mock data
        this.users = [
          { id: 1, tenDn: 'user1', email: 'user1@example.com' },
          { id: 2, tenDn: 'user2', email: 'user2@example.com' },
          { id: 3, tenDn: 'user3', email: 'user3@example.com' }
        ];
        this.filteredUsers = [...this.users];
      }
    });
  }

  private subscribeToMessages(): void {
    this.subscriptions.push(
      this.chatService.messages$.subscribe(messages => {
        // Update last messages and unread counts
        if (Array.isArray(messages)) {
          this.updateChatData(messages);
        }
      })
    );
  }

  private updateChatData(messages: ChatMessage[]): void {
    // Process messages to update last messages and unread counts
    messages.forEach(message => {
      const otherUserId = this.getOtherUserId(message);
      if (otherUserId) {
        this.lastMessages.set(otherUserId, message);
        // Update unread count logic here
      }
    });
  }

  private getOtherUserId(message: ChatMessage): number | null {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return null;

    if (message.maTkA?.id === currentUser.id) {
      return message.maTkB?.id || null;
    } else if (message.maTkB?.id === currentUser.id) {
      return message.maTkA?.id || null;
    }
    return null;
  }

  filterUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.tenDn.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    // Emit event to parent component or use a service
    this.onUserSelected(user);
  }

  private onUserSelected(user: User): void {
    // Emit event to parent component
    this.userSelected.emit(user);
  }

  @Output() userSelected = new EventEmitter<User>();

  getLastMessage(userId: number): any {
    const conversation = this.conversations.find(conv => conv.partnerId === userId);
    return conversation ? {
      noiDung: conversation.lastMessage,
      thoiGian: conversation.lastMessageTime,
      trangThai: 'sent'
    } : undefined;
  }

  getUnreadCount(userId: number): number {
    const conversation = this.conversations.find(conv => conv.partnerId === userId);
    return conversation ? conversation.unreadCount : 0;
  }

  isUserOnline(userId: number): boolean {
    const conversation = this.conversations.find(conv => conv.partnerId === userId);
    return conversation ? conversation.isOnline : false;
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
        month: '2-digit'
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
      default:
        return '';
    }
  }
}
