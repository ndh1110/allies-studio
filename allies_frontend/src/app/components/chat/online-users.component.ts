import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-online-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="online-users-container">
      <div class="online-users-header">
        <h4>Bạn bè</h4>
        <div class="user-count">{{ onlineUsers.length }} bạn</div>
      </div>

      <div class="users-list">
        <div *ngIf="onlineUsers.length === 0" class="no-users">
          <p>Chưa có bạn bè nào</p>
        </div>

        <div *ngFor="let user of onlineUsers" 
             class="user-item"
             (click)="startChat(user)">
          
          <div class="user-avatar">
            <div class="avatar-icon">
              {{ user.tenDn.charAt(0).toUpperCase() }}
            </div>
            <span class="online-indicator"></span>
          </div>

          <div class="user-info">
            <div class="user-name">{{ user.tenDn }}</div>
            <div class="user-status">Bạn bè</div>
          </div>

          <div class="user-actions">
            <button class="chat-button" (click)="startChat(user)">
              💬
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .online-users-container {
      width: 250px;
      height: 100vh;
      border-left: 1px solid #e9ecef;
      background: white;
      display: flex;
      flex-direction: column;
    }

    .online-users-header {
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .online-users-header h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .user-count {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .users-list {
      flex: 1;
      overflow-y: auto;
      padding: 10px 0;
    }

    .no-users {
      padding: 20px;
      text-align: center;
      color: #6c757d;
    }

    .user-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .user-item:hover {
      background: #f8f9fa;
    }

    .user-avatar {
      position: relative;
      margin-right: 12px;
    }

    .avatar-icon {
      width: 40px;
      height: 40px;
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
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #28a745;
      border: 2px solid white;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 2px;
    }

    .user-status {
      font-size: 0.8rem;
      color: #28a745;
    }

    .user-actions {
      display: flex;
      gap: 8px;
    }

    .chat-button {
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .chat-button:hover {
      background: #1976d2;
    }

    /* Scrollbar styling */
    .users-list::-webkit-scrollbar {
      width: 6px;
    }

    .users-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .users-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .users-list::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class OnlineUsersComponent implements OnInit, OnDestroy {
  @Output() userSelected = new EventEmitter<User>();
  
  onlineUsers: User[] = [];
  currentUser: User | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      console.error('No current user found');
      return;
    }

    // Subscribe to user presence updates
    this.subscriptions.push(
      this.webSocketService.userPresence$.subscribe(users => {
        // Filter out current user from online users
        this.onlineUsers = users.filter(user => user.id !== this.currentUser?.id);
        console.log('Online users updated:', this.onlineUsers);
      })
    );

    // Load initial online users
    this.loadOnlineUsers();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  startChat(user: User): void {
    console.log('Starting chat with:', user);
    this.userSelected.emit(user);
  }


  private loadOnlineUsers(): void {
    if (!this.currentUser) return;

    // First try to load friends
    this.subscriptions.push(
      this.chatService.getFriends(this.currentUser.tenDn).subscribe({
        next: (friends) => {
          this.onlineUsers = friends || [];
          console.log('Loaded friends:', this.onlineUsers);
          // If no friends found, try fallback
          if (this.onlineUsers.length === 0) {
            this.loadOnlineUsersFallback();
          }
        },
        error: (error) => {
          console.error('Error loading friends:', error);
          // Fallback to online users if friends API fails
          this.loadOnlineUsersFallback();
        }
      })
    );
  }

  private loadOnlineUsersFallback(): void {
    this.subscriptions.push(
      this.chatService.getOnlineUsers().subscribe({
        next: (users) => {
          // Filter out current user and convert backend format to frontend format
          this.onlineUsers = (users || [])
            .filter(user => user && user.id !== this.currentUser?.id)
            .map(user => ({
              id: user.id,
              tenDn: user.tenDn,
              email: user.email || user.tenDn + '@example.com',
              avatar: user.avatar || 'default-avatar.png'
            }));
          console.log('Loaded online users (fallback):', this.onlineUsers);
        },
        error: (error) => {
          console.error('Error loading online users:', error);
          // Set mock data on error
          this.onlineUsers = [
            { id: 1, tenDn: 'user1', email: 'user1@example.com', avatar: 'default-avatar.png' },
            { id: 2, tenDn: 'user2', email: 'user2@example.com', avatar: 'default-avatar.png' },
            { id: 3, tenDn: 'user3', email: 'user3@example.com', avatar: 'default-avatar.png' }
          ].filter(user => user.id !== this.currentUser?.id);
          console.log('Using mock online users:', this.onlineUsers);
        }
      })
    );
  }
}