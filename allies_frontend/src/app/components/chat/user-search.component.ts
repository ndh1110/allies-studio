import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { ChatStateService } from '../../services/chat-state.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-search-container">
      <div class="search-header">
        <h4>Tìm người để chat</h4>
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="searchUsers()"
            placeholder="Nhập tên đăng nhập..."
            class="search-input">
        </div>
      </div>

      <div class="search-results">
        <div *ngIf="searchResults.length === 0 && !isSearching" class="no-results">
          <p>Nhập tên đăng nhập để tìm kiếm</p>
        </div>

        <div *ngIf="isSearching" class="searching">
          <p>Đang tìm kiếm...</p>
        </div>

        <div *ngFor="let user of searchResults" 
             class="user-result"
             (click)="startChat(user)">
          
          <div class="user-avatar">
            <div class="avatar-icon">
              {{ user.tenDn.charAt(0).toUpperCase() }}
            </div>
          </div>

          <div class="user-info">
            <div class="user-name">{{ user.tenDn }}</div>
            <div class="user-id">ID: {{ user.id }}</div>
          </div>

          <div class="chat-button">
            <button class="start-chat-btn">
              <i class="fas fa-comment"></i> Chat
            </button>
          </div>
        </div>
      </div>

      <div class="recent-chats">
        <h5>Cuộc trò chuyện gần đây</h5>
        <div *ngFor="let chat of recentChats" 
             class="recent-chat"
             (click)="openChat(chat.user)">
          
          <div class="user-avatar">
            <div class="avatar-icon">
              {{ chat.user.tenDn.charAt(0).toUpperCase() }}
            </div>
          </div>

          <div class="chat-info">
            <div class="user-name">{{ chat.user.tenDn }}</div>
            <div class="last-message">{{ chat.lastMessage }}</div>
          </div>

          <div class="chat-time">
            {{ formatTime(chat.lastTime) }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-search-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .search-header {
      margin-bottom: 20px;
    }

    .search-header h4 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .search-input {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 25px;
      outline: none;
      font-size: 14px;
    }

    .search-input:focus {
      border-color: #007bff;
    }

    .search-results {
      margin-bottom: 30px;
    }

    .no-results, .searching {
      text-align: center;
      color: #6c757d;
      padding: 20px;
    }

    .user-result {
      display: flex;
      align-items: center;
      padding: 15px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .user-result:hover {
      background: #f8f9fa;
      border-color: #007bff;
    }

    .user-avatar {
      margin-right: 15px;
    }

    .avatar-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }

    .user-id {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .chat-button {
      margin-left: 15px;
    }

    .start-chat-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .start-chat-btn:hover {
      background: #0056b3;
    }

    .recent-chats {
      border-top: 1px solid #e9ecef;
      padding-top: 20px;
    }

    .recent-chats h5 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .recent-chat {
      display: flex;
      align-items: center;
      padding: 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .recent-chat:hover {
      background: #f8f9fa;
    }

    .chat-info {
      flex: 1;
      margin-left: 15px;
    }

    .last-message {
      color: #6c757d;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chat-time {
      color: #6c757d;
      font-size: 0.8rem;
    }
  `]
})
export class UserSearchComponent implements OnInit {
  @Output() userSelected = new EventEmitter<User>();
  
  searchTerm: string = '';
  searchResults: User[] = [];
  isSearching: boolean = false;
  recentChats: any[] = [];

  constructor(
    private chatStateService: ChatStateService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadRecentChats();
  }

  searchUsers(): void {
    if (this.searchTerm.trim().length < 2) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    
    // Gọi API tìm kiếm user
    const token = localStorage.getItem('token');
    const headers: { [key: string]: string } = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    this.http.get<any[]>(`${environment.apiUrl}/users/search?q=${this.searchTerm}`, { headers })
      .subscribe({
        next: (users) => {
          // Convert backend user format to frontend format
          this.searchResults = users.map(user => ({
            id: user.id,
            tenDn: user.tenDn,
            email: user.email,
            avatar: user.avarta || 'default-avatar.png'
          }));
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Lỗi tìm kiếm:', error);
          this.isSearching = false;
        }
      });
  }

  startChat(user: User): void {
    // Bắt đầu chat với user được chọn
    this.chatStateService.setSelectedUser(user);
    this.userSelected.emit(user);
    console.log('Bắt đầu chat với:', user.tenDn);
  }

  openChat(user: User): void {
    this.chatStateService.setSelectedUser(user);
    this.userSelected.emit(user);
  }

  loadRecentChats(): void {
    // Load recent chats from local storage or API
    this.recentChats = [
      {
        user: { id: 1, tenDn: 'user1', email: 'user1@test.com' },
        lastMessage: 'Xin chào!',
        lastTime: new Date()
      },
      {
        user: { id: 2, tenDn: 'user2', email: 'user2@test.com' },
        lastMessage: 'Cảm ơn bạn!',
        lastTime: new Date(Date.now() - 3600000)
      }
    ];
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

}
