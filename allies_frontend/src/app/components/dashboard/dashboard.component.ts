import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { User } from '../../models/user.model';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <h1 class="text-2xl font-bold text-primary">Allies</h1>
              </div>
            </div>
            
            <!-- Navigation -->
            <nav class="hidden md:flex space-x-8">
              <button
                type="button"
                (click)="setActiveTab('add-friends')"
                class="flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-150"
                [class.bg-primary]="activeTab() === 'add-friends'"
                [class.text-white]="activeTab() === 'add-friends'"
                [class.text-gray-700]="activeTab() !== 'add-friends'"
                [class.hover-bg-gray-100]="activeTab() !== 'add-friends'"
              >
                <span class="material-icons mr-2 text-lg">group_add</span>
                Add friends
              </button>

              <button
                (click)="setActiveTab('chat')"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                [class.bg-primary]="activeTab() === 'chat'"
                [class.text-white]="activeTab() === 'chat'"
                [class.text-gray-700]="activeTab() !== 'chat'"
                [class.hover-bg-gray-100]="activeTab() !== 'chat'"
              >
                <span class="material-icons mr-2">chat</span>
                Messages
              </button>
              <button
                (click)="setActiveTab('calls')"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                [class.bg-primary]="activeTab() === 'calls'"
                [class.text-white]="activeTab() === 'calls'"
                [class.text-gray-700]="activeTab() !== 'calls'"
                [class.hover-bg-gray-100]="activeTab() !== 'calls'"
              >
                <span class="material-icons mr-2">phone</span>
                Calls
              </button>
              <button
                (click)="setActiveTab('contacts')"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                [class.bg-primary]="activeTab() === 'contacts'"
                [class.text-white]="activeTab() === 'contacts'"
                [class.text-gray-700]="activeTab() !== 'contacts'"
                [class.hover-bg-gray-100]="activeTab() !== 'contacts'"
              >
                <span class="material-icons mr-2">contacts</span>
                Contacts
              </button>
            </nav>
            
            <!-- User Menu -->
            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <button class="relative p-2 text-gray-400 hover:text-gray-500">
                <span class="material-icons">notifications</span>
                @if (notificationCount() > 0) {
                  <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{ notificationCount() }}
                  </span>
                }
              </button>
              
              <!-- User Profile -->
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {{ getInitials(currentUser()?.username || '') }}
                </div>
                <div class="hidden md:block">
                  <p class="text-sm font-medium text-gray-900">{{ currentUser()?.username }}</p>
                  <p class="text-xs text-gray-500">Online</p>
                </div>
                <button
                  (click)="logout()"
                  class="text-gray-400 hover:text-gray-500"
                  title="Logout"
                >
                  <span class="material-icons">logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
  @if (activeTab() === 'chat') {
    <app-chat></app-chat>
  } @else if (activeTab() === 'calls') {
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Call History</h2>
      </div>
      <div class="p-6">
        <div class="text-center text-gray-500">
          <span class="material-icons text-4xl mb-4 block">phone</span>
          <p>No calls yet</p>
        </div>
      </div>
    </div>
  } @else if (activeTab() === 'contacts') {
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Contacts</h2>
      </div>
      <div class="p-6">
        <div class="text-center text-gray-500">
          <span class="material-icons text-4xl mb-4 block">contacts</span>
          <p>No contacts yet</p>
        </div>
      </div>
    </div>
  } @else if (activeTab() === 'add-friends') {
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Add Friends</h2>
      </div>

      <div class="p-6 space-y-4">
        <div class="flex gap-3">
          <input
            type="text"
            class="border border-gray-300 rounded-md px-4 py-2 w-full"
            placeholder="Search username or email..."
          />
          <button class="px-4 py-2 rounded-md bg-primary text-white" type="button">
            Search
          </button>
        </div>

        <!-- danh sách kết quả mẫu -->
        <div class="text-gray-600 italic">No results yet.</div>
      </div>
    </div>
  }
</main>
    </div>
  `,
  styles: [`
    .min-h-screen {
      min-height: 100vh;
    }
    
    .max-w-7xl {
      max-width: 80rem;
    }
    
    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }
    
    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    
    .px-6 {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
    
    .py-4 {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
    
    .py-6 {
      padding-top: 1.5rem;
      padding-bottom: 1.5rem;
    }
    
    .py-2 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    
    .p-2 {
      padding: 0.5rem;
    }
    
    .p-6 {
      padding: 1.5rem;
    }
    
    .px-3 {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
    
    .h-16 {
      height: 4rem;
    }
    
    .w-8 {
      width: 2rem;
    }
    
    .h-8 {
      height: 2rem;
    }
    
    .h-5 {
      height: 1.25rem;
    }
    
    .w-5 {
      width: 1.25rem;
    }
    
    .flex {
      display: flex;
    }
    
    .hidden {
      display: none;
    }
    
    .block {
      display: block;
    }
    
    .md\\:flex {
      display: flex;
    }
    
    .md\\:block {
      display: block;
    }
    
    .items-center {
      align-items: center;
    }
    
    .justify-center {
      justify-content: center;
    }
    
    .justify-between {
      justify-content: space-between;
    }
    
    .space-x-3 > * + * {
      margin-left: 0.75rem;
    }
    
    .space-x-4 > * + * {
      margin-left: 1rem;
    }
    
    .space-x-8 > * + * {
      margin-left: 2rem;
    }
    
    .mr-2 {
      margin-right: 0.5rem;
    }
    
    .mb-4 {
      margin-bottom: 1rem;
    }
    
    .-top-1 {
      top: -0.25rem;
    }
    
    .-right-1 {
      right: -0.25rem;
    }
    
    .relative {
      position: relative;
    }
    
    .absolute {
      position: absolute;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-2xl {
      font-size: 1.5rem;
      line-height: 2rem;
    }
    
    .text-lg {
      font-size: 1.125rem;
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
    
    .text-4xl {
      font-size: 2.25rem;
      line-height: 2.5rem;
    }
    
    .font-bold {
      font-weight: 700;
    }
    
    .font-semibold {
      font-weight: 600;
    }
    
    .font-medium {
      font-weight: 500;
    }
    
    .rounded-md {
      border-radius: 0.375rem;
    }
    
    .rounded-lg {
      border-radius: 0.5rem;
    }
    
    .rounded-full {
      border-radius: 50%;
    }
    
    .shadow {
      box-shadow: var(--shadow-md);
    }
    
    .shadow-sm {
      box-shadow: var(--shadow-sm);
    }
    
    .bg-white {
      background-color: white;
    }
    
    .bg-primary {
      background-color: var(--primary-color);
    }
    
    .bg-red-500 {
      background-color: #ef4444;
    }
    
    .text-white {
      color: white;
    }
    
    .text-gray-900 {
      color: var(--gray-900);
    }
    
    .text-gray-700 {
      color: var(--gray-700);
    }
    
    .text-gray-500 {
      color: var(--gray-500);
    }
    
    .text-gray-400 {
      color: var(--gray-400);
    }
    
    .text-primary {
      color: var(--primary-color);
    }
    
    .border-b {
      border-bottom-width: 1px;
    }
    
    .border-gray-200 {
      border-color: var(--gray-200);
    }
    
    .cursor-pointer {
      cursor: pointer;
    }
    
    .transition-colors {
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
    
    .hover-text-gray-500:hover {
      color: var(--gray-500);
    }
    
    .hover-bg-gray-100:hover {
      background-color: var(--gray-100);
    }
    
    .flex-shrink-0 {
      flex-shrink: 0;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTab = signal<'chat' | 'calls' | 'contacts' | 'add-friends'>('chat');
  currentUser = signal<User | null>(null);
  notificationCount = signal(0);

  constructor(
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private router: Router,
    private ws: WebSocketService
  ) {}

  ngOnInit(): void {
    try { this.ws.connect(); } catch (e) { console.warn('WS disabled:', e); }
  }

  ngOnDestroy(): void {
    this.ws.disconnect();
  }

  setActiveTab(tab: 'chat' | 'calls' | 'contacts' | 'add-friends'): void {
    this.activeTab.set(tab);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
