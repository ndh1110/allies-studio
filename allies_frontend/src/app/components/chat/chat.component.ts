import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { WebSocketService } from '../../services/websocket.service';
import { AuthService } from '../../services/auth.service';
import { ChatMessage, ChatRoom } from '../../models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-800">Chats</h2>
            <button class="btn btn-primary btn-sm">
              <span class="material-icons">add</span>
              New Chat
            </button>
          </div>
        </div>
        
        <!-- Search -->
        <div class="p-4">
          <input
            type="text"
            placeholder="Search conversations..."
            class="form-input"
            [(ngModel)]="searchTerm"
          />
        </div>
        
        <!-- Chat Rooms -->
        <div class="flex-1 overflow-y-auto">
          @for (room of chatRooms(); track room.id) {
            <div
              class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              [class.bg-primary]="selectedRoom()?.id === room.id"
              (click)="selectRoom(room)"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {{ getInitials(room.name) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ room.name }}</p>
                  @if (room.lastMessage) {
                    <p class="text-xs text-gray-500 truncate">{{ room.lastMessage.noiDung }}</p>
                  }
                </div>
                @if (room.unreadCount > 0) {
                  <span class="bg-primary text-white text-xs rounded-full px-2 py-1">
                    {{ room.unreadCount }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>
      
      <!-- Chat Area -->
      <div class="flex-1 flex flex-col">
        @if (selectedRoom()) {
          <!-- Chat Header -->
          <div class="p-4 border-b border-gray-200 bg-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {{ getInitials(selectedRoom()!.name) }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ selectedRoom()!.name }}</h3>
                  <p class="text-sm text-gray-500">Online</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button class="btn btn-secondary btn-sm">
                  <span class="material-icons">videocam</span>
                </button>
                <button class="btn btn-secondary btn-sm">
                  <span class="material-icons">phone</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4" #messagesContainer>
            @for (message of messages(); track message.id) {
              <div class="flex" [class.justify-end]="isCurrentUser(message)">
                <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                     [class.bg-primary]="isCurrentUser(message)"
                     [class.text-white]="isCurrentUser(message)"
                     [class.bg-gray-200]="!isCurrentUser(message)"
                     [class.text-gray-800]="!isCurrentUser(message)">
                  <p class="text-sm">{{ message.noiDung }}</p>
                  <p class="text-xs mt-1 opacity-70">
                    {{ formatTime(message.thoiGian) }}
                  </p>
                </div>
              </div>
            }
          </div>
          
          <!-- Message Input -->
          <div class="p-4 border-t border-gray-200 bg-white">
            <form (ngSubmit)="sendMessage()" class="flex space-x-2">
              <input
                type="text"
                [(ngModel)]="newMessage"
                name="message"
                placeholder="Type a message..."
                class="form-input flex-1"
              />
              <button type="submit" class="btn btn-primary">
                <span class="material-icons">send</span>
              </button>
            </form>
          </div>
        } @else {
          <!-- No Chat Selected -->
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-icons text-gray-400 text-2xl">chat</span>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p class="text-gray-500">Choose a chat to start messaging</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .h-screen {
      height: 100vh;
    }
    
    .flex-1 {
      flex: 1 1 0%;
    }
    
    .overflow-y-auto {
      overflow-y: auto;
    }
    
    .space-y-4 > * + * {
      margin-top: 1rem;
    }
    
    .space-x-3 > * + * {
      margin-left: 0.75rem;
    }
    
    .space-x-2 > * + * {
      margin-left: 0.5rem;
    }
    
    .min-w-0 {
      min-width: 0;
    }
    
    .truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .max-w-xs {
      max-width: 20rem;
    }
    
    .max-w-md {
      max-width: 28rem;
    }
    
    .justify-end {
      justify-content: flex-end;
    }
    
    .justify-center {
      justify-content: center;
    }
    
    .items-center {
      align-items: center;
    }
    
    .text-center {
      text-align: center;
    }
    
    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }
    
    .mb-2 {
      margin-bottom: 0.5rem;
    }
    
    .mb-4 {
      margin-bottom: 1rem;
    }
    
    .mt-1 {
      margin-top: 0.25rem;
    }
    
    .w-8 {
      width: 2rem;
    }
    
    .h-8 {
      height: 2rem;
    }
    
    .w-10 {
      width: 2.5rem;
    }
    
    .h-10 {
      height: 2.5rem;
    }
    
    .w-16 {
      width: 4rem;
    }
    
    .h-16 {
      height: 4rem;
    }
    
    .text-2xl {
      font-size: 1.5rem;
      line-height: 2rem;
    }
    
    .text-lg {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
    
    .text-xl {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }
    
    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    
    .text-xs {
      font-size: 0.75rem;
      line-height: 1rem;
    }
    
    .font-semibold {
      font-weight: 600;
    }
    
    .font-medium {
      font-weight: 500;
    }
    
    .rounded-lg {
      border-radius: 0.5rem;
    }
    
    .rounded-full {
      border-radius: 50%;
    }
    
    .bg-primary {
      background-color: var(--primary-color);
    }
    
    .bg-gray-50 {
      background-color: var(--gray-50);
    }
    
    .bg-gray-200 {
      background-color: var(--gray-200);
    }
    
    .bg-white {
      background-color: white;
    }
    
    .text-white {
      color: white;
    }
    
    .text-gray-800 {
      color: var(--gray-800);
    }
    
    .text-gray-900 {
      color: var(--gray-900);
    }
    
    .text-gray-500 {
      color: var(--gray-500);
    }
    
    .text-gray-400 {
      color: var(--gray-400);
    }
    
    .border-r {
      border-right-width: 1px;
    }
    
    .border-b {
      border-bottom-width: 1px;
    }
    
    .border-t {
      border-top-width: 1px;
    }
    
    .border-gray-100 {
      border-color: var(--gray-100);
    }
    
    .border-gray-200 {
      border-color: var(--gray-200);
    }
    
    .cursor-pointer {
      cursor: pointer;
    }
    
    .hover\\:bg-gray-50:hover {
      background-color: var(--gray-50);
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  messages = signal<ChatMessage[]>([]);
  chatRooms = signal<ChatRoom[]>([]);
  selectedRoom = signal<ChatRoom | null>(null);
  newMessage = '';
  searchTerm = '';

  constructor(
    private chatService: ChatService,
    private webSocketService: WebSocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.webSocketService.connect();
    this.loadChatRooms();
    this.subscribeToMessages();
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

  loadChatRooms(): void {
    // Mock data for now
    this.chatRooms.set([
      {
        id: '1',
        name: 'John Doe',
        participants: [1, 2],
        unreadCount: 2,
        lastMessage: {
          id: 1,
          maTkA: { id: 1 },
          maTkB: { id: 2 },
          noiDung: 'Hey, how are you?',
          thoiGian: new Date(),
          trangThai: 'sent'
        }
      },
      {
        id: '2',
        name: 'Jane Smith',
        participants: [1, 3],
        unreadCount: 0,
        lastMessage: {
          id: 2,
          maTkA: { id: 3 },
          maTkB: { id: 1 },
          noiDung: 'See you tomorrow!',
          thoiGian: new Date(Date.now() - 3600000),
          trangThai: 'sent'
        }
      }
    ]);
  }

  subscribeToMessages(): void {
    this.webSocketService.messages$.subscribe(message => {
      if (message) {
        this.messages.update(messages => [...messages, message]);
      }
    });
  }

  selectRoom(room: ChatRoom): void {
    this.selectedRoom.set(room);
    this.loadMessages(room.id);
  }

  loadMessages(roomId: string): void {
    // Mock messages for now
    this.messages.set([
      {
        id: 1,
        maTkA: { id: 1 },
        maTkB: { id: 2 },
        noiDung: 'Hello! How are you doing?',
        thoiGian: new Date(Date.now() - 3600000),
        trangThai: 'sent'
      },
      {
        id: 2,
        maTkA: { id: 2 },
        maTkB: { id: 1 },
        noiDung: 'I\'m doing great! Thanks for asking.',
        thoiGian: new Date(Date.now() - 1800000),
        trangThai: 'sent'
      },
      {
        id: 3,
        maTkA: { id: 1 },
        maTkB: { id: 2 },
        noiDung: 'That\'s wonderful to hear!',
        thoiGian: new Date(),
        trangThai: 'sent'
      }
    ]);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedRoom()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const message: ChatMessage = {
      maTkA: { id: currentUser.id },
      maTkB: { id: this.selectedRoom()!.participants.find(id => id !== currentUser.id) || 0 },
      noiDung: this.newMessage,
      thoiGian: new Date(),
      trangThai: 'sent'
    };

    this.webSocketService.sendMessage(message);
    this.newMessage = '';
  }

  isCurrentUser(message: ChatMessage): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? message.maTkA.id === currentUser.id : false;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
