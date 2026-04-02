import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="connection-status" [class.connected]="isConnected">
      <div class="status-indicator">
        <span class="status-dot" [class.online]="isConnected"></span>
        <span class="status-text">{{ statusText }}</span>
      </div>
      <div class="connection-actions" *ngIf="!isConnected">
        <button (click)="reconnect()" class="reconnect-btn">
          🔄 Thử kết nối lại
        </button>
      </div>
    </div>
  `,
  styles: [`
    .connection-status {
      position: fixed;
      top: 10px;
      right: 10px;
      background: #dc3545;
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
    }

    .connection-status.connected {
      background: #28a745;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: white;
      opacity: 0.7;
    }

    .status-dot.online {
      background: #28a745;
      opacity: 1;
    }

    .status-text {
      font-weight: 500;
    }

    .connection-actions {
      margin-left: 10px;
    }

    .reconnect-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }

    .reconnect-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `]
})
export class ConnectionStatusComponent implements OnInit, OnDestroy {
  isConnected: boolean = false;
  statusText: string = 'Đang kết nối...';
  
  private subscriptions: Subscription[] = [];

  constructor(private webSocketService: WebSocketService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isConnected = this.webSocketService.getConnectionStatus();
    this.updateStatusText();

    // Subscribe to connection status changes
    this.subscriptions.push(
      this.webSocketService.connectionStatus$.subscribe(status => {
        if (this.isConnected !== status) {
          this.isConnected = status;
          this.updateStatusText();
          this.cdr.detectChanges();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private updateStatusText(): void {
    this.statusText = this.isConnected ? 'Đã kết nối' : 'Mất kết nối';
  }

  reconnect(): void {
    this.webSocketService.reconnect();
  }
}
