import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../models/chat.model';
import { User } from '../../models/user.model';
import { ChatService } from '../../services/chat.service';
import { ChatStateService } from '../../services/chat-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-history-container">
      <div class="history-header">
        <h4>Lịch sử chat</h4>
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="filterMessages()"
            placeholder="Tìm kiếm tin nhắn..."
            class="search-input">
        </div>
      </div>

      <div class="date-filter">
        <label>Lọc theo ngày:</label>
        <input 
          type="date" 
          [(ngModel)]="selectedDate" 
          (change)="filterByDate()"
          class="date-input">
        <button (click)="clearDateFilter()" class="clear-button">Xóa</button>
      </div>

      <div class="messages-list" #messagesList>
        <div *ngIf="filteredMessages.length === 0" class="no-messages">
          <p>Không có tin nhắn nào</p>
        </div>

        <div *ngFor="let message of filteredMessages; let i = index" 
             class="message-item"
             [class.sent]="message.maTkA.id === currentUser?.id"
             [class.received]="message.maTkB.id === currentUser?.id">
          
          <div class="message-header">
            <span class="sender-name">
              {{ message.maTkA.id === currentUser?.id ? 'Bạn' : message.maTkA.tenDn }}
            </span>
            <span class="message-time">{{ formatDateTime(message.thoiGian) }}</span>
          </div>

          <div class="message-content">
            <div class="message-text">{{ message.noiDung }}</div>
            <div class="message-status">
              {{ getStatusIcon(message.trangThai) }}
            </div>
          </div>

          <div class="message-actions">
            <button (click)="copyMessage(message.noiDung)" class="action-button">
              <i class="fas fa-copy"></i>
            </button>
            <button (click)="deleteMessage(message)" class="action-button delete" *ngIf="message.maTkA?.id === currentUser?.id">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="history-footer">
        <div class="message-count">
          Tổng: {{ messages.length }} tin nhắn
        </div>
        <div class="export-actions">
          <button (click)="exportToText()" class="export-button">
            <i class="fas fa-download"></i> Xuất file
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-history-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: white;
    }

    .history-header {
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .history-header h4 {
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

    .date-filter {
      padding: 15px 20px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .date-filter label {
      font-weight: 600;
      color: #333;
    }

    .date-input {
      padding: 5px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      outline: none;
    }

    .clear-button {
      background: #dc3545;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .clear-button:hover {
      background: #c82333;
    }

    .messages-list {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .no-messages {
      text-align: center;
      color: #6c757d;
      margin-top: 50px;
    }

    .message-item {
      margin-bottom: 20px;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      transition: background 0.2s;
    }

    .message-item:hover {
      background: #f8f9fa;
    }

    .message-item.sent {
      background: #e3f2fd;
      border-left: 4px solid #007bff;
    }

    .message-item.received {
      background: #f8f9fa;
      border-left: 4px solid #28a745;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .sender-name {
      font-weight: 600;
      color: #333;
    }

    .message-time {
      color: #6c757d;
      font-size: 0.8rem;
    }

    .message-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
    }

    .message-text {
      flex: 1;
      word-wrap: break-word;
      line-height: 1.4;
    }

    .message-status {
      color: #6c757d;
      font-size: 0.8rem;
    }

    .message-actions {
      display: flex;
      gap: 5px;
      margin-top: 10px;
    }

    .action-button {
      background: none;
      border: 1px solid #ddd;
      padding: 5px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }

    .action-button:hover {
      background: #f8f9fa;
    }

    .action-button.delete:hover {
      background: #f8d7da;
      border-color: #dc3545;
      color: #dc3545;
    }

    .history-footer {
      padding: 15px 20px;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .message-count {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .export-button {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .export-button:hover {
      background: #0056b3;
    }

    /* Scrollbar styling */
    .messages-list::-webkit-scrollbar {
      width: 6px;
    }

    .messages-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .messages-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .messages-list::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class ChatHistoryComponent implements OnInit, OnDestroy {
  @Input() currentUser: User | null = null;
  
  messages: ChatMessage[] = [];
  filteredMessages: ChatMessage[] = [];
  searchTerm: string = '';
  selectedDate: string = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private chatStateService: ChatStateService
  ) {}

  ngOnInit(): void {
    this.subscribeToMessages();
    this.loadChatHistory();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToMessages(): void {
    this.subscriptions.push(
      this.chatStateService.messages$.subscribe(messages => {
        this.messages = messages;
        this.filterMessages();
      })
    );
  }

  private loadChatHistory(): void {
    if (!this.currentUser) return;

    this.chatService.getMessages(this.currentUser.id).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.filterMessages();
      },
      error: (error) => {
        console.error('Lỗi khi tải lịch sử chat:', error);
      }
    });
  }

  filterMessages(): void {
    let filtered = [...this.messages];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(message => 
        message.noiDung.toLowerCase().includes(term)
      );
    }

    // Filter by date
    if (this.selectedDate) {
      const selectedDateObj = new Date(this.selectedDate);
      filtered = filtered.filter(message => {
        const messageDate = new Date(message.thoiGian);
        return messageDate.toDateString() === selectedDateObj.toDateString();
      });
    }

    this.filteredMessages = filtered;
  }

  filterByDate(): void {
    this.filterMessages();
  }

  clearDateFilter(): void {
    this.selectedDate = '';
    this.filterMessages();
  }

  copyMessage(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Show success message
      console.log('Đã sao chép tin nhắn');
    }).catch(err => {
      console.error('Lỗi khi sao chép:', err);
    });
  }

  deleteMessage(message: ChatMessage): void {
    if (confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) {
      // Implement delete logic here
      console.log('Xóa tin nhắn:', message);
    }
  }

  exportToText(): void {
    const content = this.filteredMessages.map(message => {
      const sender = message.maTkA?.id === this.currentUser?.id ? 'Bạn' : message.maTkA?.tenDn;
      const time = this.formatDateTime(message.thoiGian);
      return `[${time}] ${sender}: ${message.noiDung}`;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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
}
