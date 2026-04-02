import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { ChatListComponent } from './chat-list.component';
import { OnlineUsersComponent } from './online-users.component';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { ChatStateService } from '../../services/chat-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-main',
  standalone: true,
  imports: [CommonModule, ChatListComponent, ChatComponent, OnlineUsersComponent],
  template: `
    <div class="chat-main-container">
      <!-- Mobile: Show chat list or chat based on current view -->
      <div class="mobile-view" *ngIf="isMobile">
        <div *ngIf="!selectedUser" class="chat-list-mobile">
          <app-chat-list (userSelected)="onUserSelected($event)"></app-chat-list>
        </div>
        <div *ngIf="selectedUser" class="chat-mobile">
          <div class="mobile-header">
            <button (click)="goBackToList()" class="back-button">
              <i class="fas fa-arrow-left"></i>
            </button>
            <span class="user-name">{{ selectedUser.tenDn }}</span>
          </div>
          <app-chat [currentChatUser]="selectedUser"></app-chat>
        </div>
      </div>

      <!-- Desktop: Show both chat list and chat side by side -->
      <div class="desktop-view" *ngIf="!isMobile">
        <div class="chat-list-sidebar">
          <app-chat-list (userSelected)="onUserSelected($event)"></app-chat-list>
        </div>
        <div class="chat-main-area">
          <app-chat [currentChatUser]="selectedUser"></app-chat>
        </div>
        <div class="online-users-sidebar">
          <app-online-users></app-online-users>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-main-container {
      height: 100vh;
      display: flex;
      background: #f8f9fa;
    }

    .mobile-view {
      width: 100%;
      height: 100%;
    }

    .chat-list-mobile {
      width: 100%;
      height: 100%;
    }

    .chat-mobile {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .mobile-header {
      background: #007bff;
      color: white;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .back-button {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .user-name {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .desktop-view {
      width: 100%;
      height: 100%;
      display: flex;
    }

    .chat-list-sidebar {
      width: 300px;
      height: 100%;
      border-right: 1px solid #e9ecef;
      background: white;
    }

    .chat-main-area {
      flex: 1;
      height: 100%;

    }

    .online-users-sidebar {
      width: 250px;
      height: 100%;
      border-left: 1px solid #e9ecef;
    }

    /* Responsive breakpoints */
    @media (max-width: 768px) {
      .desktop-view {
        display: none;
      }
    }

    @media (min-width: 769px) {
      .mobile-view {
        display: none;
      }
    }
  `]
})
export class ChatMainComponent implements OnInit, OnDestroy {
  selectedUser: User | null = null;
  isMobile: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private chatStateService: ChatStateService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.setupWebSocketConnection();
    this.subscribeToSelectedUser();
    
    // Listen for window resize events
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  private setupWebSocketConnection(): void {
    // Don't create new connection, just subscribe to existing one
    // The connection should be handled by DashboardComponent
    
    // Subscribe to connection status
    this.subscriptions.push(
      this.webSocketService.messages$.subscribe(message => {
        // Handle incoming messages
        console.log('Received message:', message);
      })
    );

    // Subscribe to user presence updates
    this.subscriptions.push(
      this.webSocketService.userPresence$.subscribe(users => {
        console.log('User presence updated in chat main:', users);
      })
    );
  }

  private subscribeToSelectedUser(): void {
    this.subscriptions.push(
      this.chatStateService.selectedUser$.subscribe(user => {
        console.log('ChatMainComponent: Selected user changed:', user);
        this.selectedUser = user;
      })
    );
  }

  onUserSelected(user: User): void {
    this.chatStateService.setSelectedUser(user);
  }

  goBackToList(): void {
    this.chatStateService.setSelectedUser(null);
  }
}

