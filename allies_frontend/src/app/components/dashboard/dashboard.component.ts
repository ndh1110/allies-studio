import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMainComponent } from '../chat/chat-main.component';
import { UserSearchComponent } from '../chat/user-search.component';
import { ChatHistoryComponent } from '../chat/chat-history.component';
import { ChatTestComponent } from '../chat/chat-test.component';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { ChatStateService } from '../../services/chat-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChatMainComponent, UserSearchComponent, ChatHistoryComponent, ChatTestComponent],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h2>💬 Dashboard</h2>
        <div class="header-controls">
          <div class="user-info">
            <span>👤 {{ currentUser?.tenDn || 'Chưa đăng nhập' }}</span>
            <div class="connection-status" [class.connected]="isConnected">
              {{ isConnected ? '🟢 Online' : '🔴 Offline' }}
            </div>
          </div>
          <div class="view-controls">
            <button 
              *ngFor="let view of views" 
              (click)="setActiveView(view.id)"
              [class.active]="activeView === view.id"
              class="view-button">
              {{ view.icon }} {{ view.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="dashboard-content">
        <!-- Chat Main View -->
        <div *ngIf="activeView === 'chat'" class="view-container">
          <app-chat-main></app-chat-main>
        </div>

        <!-- User Search View -->
        <div *ngIf="activeView === 'search'" class="view-container">
          <app-user-search (userSelected)="onUserSelectedFromSearch($event)"></app-user-search>
        </div>

        <!-- Chat History View -->
        <div *ngIf="activeView === 'history'" class="view-container">
          <app-chat-history [currentUser]="currentUser"></app-chat-history>
        </div>

        <!-- Test View -->
        <div *ngIf="activeView === 'test'" class="view-container">
          <app-chat-test></app-chat-test>
        </div>
      </div>

      <!-- Features Status -->
      <div class="features-status">
        <h4>📋 Trạng thái tính năng</h4>
        <div class="feature-grid">
          <div class="feature-item" [class.working]="isConnected">
            <span class="feature-icon">🔌</span>
            <span class="feature-name">WebSocket</span>
            <span class="feature-status">{{ isConnected ? 'Hoạt động' : 'Không kết nối' }}</span>
          </div>
          
          <div class="feature-item" [class.working]="true">
            <span class="feature-icon">💾</span>
            <span class="feature-name">Database</span>
            <span class="feature-status">Sẵn sàng</span>
          </div>
          
          <div class="feature-item" [class.working]="true">
            <span class="feature-icon">🔍</span>
            <span class="feature-name">Tìm kiếm</span>
            <span class="feature-status">Hoạt động</span>
          </div>
          
          <div class="feature-item" [class.working]="true">
            <span class="feature-icon">📱</span>
            <span class="feature-name">Responsive</span>
            <span class="feature-status">Hoạt động</span>
          </div>
          
          <div class="feature-item" [class.working]="true">
            <span class="feature-icon">⚡</span>
            <span class="feature-name">Real-time</span>
            <span class="feature-status">Hoạt động</span>
          </div>
          
          <div class="feature-item" [class.working]="true">
            <span class="feature-icon">📜</span>
            <span class="feature-name">Lịch sử</span>
            <span class="feature-status">Hoạt động</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h4>⚡ Thao tác nhanh</h4>
        <div class="action-buttons">
          <button (click)="connectWebSocket()" class="action-btn">
            🔌 Kết nối WebSocket
          </button>
          <button (click)="disconnectWebSocket()" class="action-btn">
            🔌 Ngắt kết nối
          </button>
          <button (click)="clearChatHistory()" class="action-btn">
            🗑️ Xóa lịch sử
          </button>
          <button (click)="exportAllData()" class="action-btn">
            📤 Xuất dữ liệu
          </button>
          <button (click)="testWebSocketConnection()" class="action-btn">
            🔧 Test WebSocket
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .dashboard-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dashboard-header h2 {
      margin: 0;
      color: #333;
      font-size: 2rem;
      font-weight: 700;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 30px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 5px;
    }

    .connection-status {
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      background: #dc3545;
      color: white;
    }

    .connection-status.connected {
      background: #28a745;
    }

    .view-controls {
      display: flex;
      gap: 10px;
    }

    .view-button {
      background: rgba(0, 123, 255, 0.1);
      color: #007bff;
      border: 2px solid #007bff;
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .view-button:hover {
      background: #007bff;
      color: white;
      transform: translateY(-2px);
    }

    .view-button.active {
      background: #007bff;
      color: white;
      box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
    }

    .dashboard-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 0;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .view-container {
      min-height: 600px;
    }

    .features-status {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .features-status h4 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 1.2rem;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 4px solid #dc3545;
      transition: all 0.3s;
    }

    .feature-item.working {
      border-left-color: #28a745;
      background: #d4edda;
    }

    .feature-icon {
      font-size: 1.2rem;
    }

    .feature-name {
      font-weight: 600;
      color: #333;
      flex: 1;
    }

    .feature-status {
      font-size: 0.9rem;
      color: #6c757d;
      font-weight: 500;
    }

    .quick-actions {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .quick-actions h4 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 1.2rem;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .action-btn {
      background: linear-gradient(45deg, #007bff, #0056b3);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .header-controls {
        flex-direction: column;
        gap: 15px;
      }

      .view-controls {
        flex-wrap: wrap;
        justify-content: center;
      }

      .action-buttons {
        justify-content: center;
      }

      .feature-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isConnected: boolean = false;
  activeView: string = 'chat';
  
  views = [
    { id: 'chat', name: 'Chat', icon: '💬' },
    { id: 'search', name: 'Tìm kiếm', icon: '🔍' },
    { id: 'history', name: 'Lịch sử', icon: '📜' },
    { id: 'test', name: 'Test', icon: '🧪' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private chatStateService: ChatStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Always ensure WebSocket connection is maintained
    this.ensureWebSocketConnection();
    
    this.isConnected = this.webSocketService.getConnectionStatus();
    
    // Subscribe to connection status changes
    this.subscriptions.push(
      this.webSocketService.connectionStatus$.subscribe(status => {
        if (this.isConnected !== status) {
          this.isConnected = status;
          this.cdr.detectChanges();
          
          // If disconnected, try to reconnect (but not too aggressively)
          if (!status && this.currentUser) {
            console.log('WebSocket disconnected, attempting to reconnect...');
            // Only reconnect once per disconnect to avoid loops
            setTimeout(() => {
              if (!this.webSocketService.getConnectionStatus()) {
                this.ensureWebSocketConnection();
              }
            }, 3000); // Increased delay to 3 seconds
          }
        }
      })
    );

    // Subscribe to user presence updates
    this.subscriptions.push(
      this.webSocketService.userPresence$.subscribe(users => {
        console.log('User presence updated:', users);
      })
    );

    // Subscribe to selected user changes from ChatStateService
    this.subscriptions.push(
      this.chatStateService.selectedUser$.subscribe(selectedUser => {
        if (selectedUser) {
          // Switch to chat view when a user is selected
          this.setActiveView('chat');
        }
      })
    );
  }

  private ensureWebSocketConnection(): void {
    if (this.currentUser) {
      if (!this.webSocketService.getConnectionStatus()) {
        console.log('Establishing WebSocket connection...');
        this.webSocketService.connect(this.currentUser);
      } else {
        console.log('WebSocket already connected');
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Stop WebSocket monitoring when component is destroyed
    this.webSocketService.stopConnectionMonitoring();
  }

  setActiveView(viewId: string): void {
    this.activeView = viewId;
    
    // Only ensure connection if not already connected
    if (!this.webSocketService.getConnectionStatus() && this.currentUser) {
      this.ensureWebSocketConnection();
    }
  }

  connectWebSocket(): void {
    this.webSocketService.connect(this.currentUser!);
    this.isConnected = this.webSocketService.getConnectionStatus();
  }

  disconnectWebSocket(): void {
    this.webSocketService.disconnect();
    this.isConnected = false;
  }

  clearChatHistory(): void {
    this.chatStateService.clearMessages();
    console.log('Đã xóa lịch sử chat');
  }

  exportAllData(): void {
    console.log('Xuất tất cả dữ liệu chat...');
    // Implement export functionality
  }

  onUserSelectedFromSearch(user: User): void {
    console.log('Dashboard: User selected from search:', user);
    // Switch to chat view when user is selected from search
    this.setActiveView('chat');
  }

  // Method to test WebSocket connection
  testWebSocketConnection(): void {
    console.log('Testing WebSocket connection...');
    this.webSocketService.checkAndMaintainConnection();
    this.isConnected = this.webSocketService.getConnectionStatus();
    console.log('Connection status:', this.isConnected);
  }
}