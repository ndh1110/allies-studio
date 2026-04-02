import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMainComponent } from './chat-main.component';
import { ChatHistoryComponent } from './chat-history.component';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-demo',
  standalone: true,
  imports: [CommonModule, ChatMainComponent, ChatHistoryComponent],
  template: `
    <div class="chat-demo-container">
      <div class="demo-header">
        <h2>Chat Demo</h2>
        <div class="demo-controls">
          <button (click)="toggleView()" class="toggle-button">
            {{ showHistory ? 'Chat' : 'Lịch sử' }}
          </button>
          <button (click)="simulateUsers()" class="simulate-button">
            Tạo dữ liệu mẫu
          </button>
          <div class="connection-status" [class.connected]="isConnected">
            {{ isConnected ? 'Đã kết nối' : 'Chưa kết nối' }}
          </div>
        </div>
      </div>

      <div class="demo-content">
        <div *ngIf="!showHistory" class="chat-view">
          <app-chat-main></app-chat-main>
        </div>
        
        <div *ngIf="showHistory" class="history-view">
          <app-chat-history [currentUser]="currentUser"></app-chat-history>
        </div>
      </div>

      <div class="demo-info">
        <h4>Tính năng đã triển khai:</h4>
        <ul>
          <li>✅ Chat real-time với WebSocket</li>
          <li>✅ Lưu trữ lịch sử chat trong database</li>
          <li>✅ Typing indicator</li>
          <li>✅ User presence (online/offline)</li>
          <li>✅ Responsive design</li>
          <li>✅ Tìm kiếm tin nhắn</li>
          <li>✅ Xuất lịch sử chat</li>
          <li>✅ Status tin nhắn (sent, delivered, read)</li>
          <li>✅ Unread message count</li>
          <li>✅ Message timestamps</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .chat-demo-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8f9fa;
    }

    .demo-header {
      background: #007bff;
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .demo-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .demo-controls {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .toggle-button, .simulate-button {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .toggle-button:hover, .simulate-button:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .connection-status {
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 0.9rem;
      background: #dc3545;
    }

    .connection-status.connected {
      background: #28a745;
    }

    .demo-content {
      flex: 1;
      overflow: hidden;
    }

    .chat-view, .history-view {
      height: 100%;
    }

    .demo-info {
      background: white;
      padding: 20px;
      border-top: 1px solid #e9ecef;
      max-height: 200px;
      overflow-y: auto;
    }

    .demo-info h4 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .demo-info ul {
      margin: 0;
      padding-left: 20px;
      color: #666;
    }

    .demo-info li {
      margin-bottom: 5px;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .demo-controls {
        flex-direction: column;
        gap: 10px;
      }
      
      .demo-info {
        max-height: 150px;
      }
    }
  `]
})
export class ChatDemoComponent implements OnInit, OnDestroy {
  showHistory: boolean = false;
  isConnected: boolean = false;
  currentUser: User | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Check connection status
    this.isConnected = this.webSocketService.getConnectionStatus();
    
    // Subscribe to connection changes
    this.subscriptions.push(
      this.webSocketService.messages$.subscribe(() => {
        this.isConnected = this.webSocketService.getConnectionStatus();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleView(): void {
    this.showHistory = !this.showHistory;
  }

  simulateUsers(): void {
    // This would typically create mock users for testing
    console.log('Tạo dữ liệu mẫu cho demo...');
    
    // You can implement mock data creation here
    // For example, create some test users and messages
  }
}
