import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChatStateService } from '../../services/chat-state.service';
import { AddFriendsService } from '../../services/add-friends.service';
import { WebSocketService } from '../../services/websocket.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <h2>Messages</h2>
      </div>
      
      <div class="sidebar-search">
        <input
          type="text"
          placeholder="Search conversations..."
          [(ngModel)]="searchTerm"
          (ngModelChange)="updateSearch($event)"
        />
      </div>
      
      <div class="sidebar-list">
        @if (filteredItems().length === 0) {
          <div class="empty-state">No conversations found</div>
        } @else {
          <ul>
            @for (item of filteredItems(); track item._key) {
              <li 
                class="contact-item"
                [class.active]="isActive(item)"
                (click)="selectItem(item)"
              >
                @if (item._type === 'group') {
                  <div class="avatar group-avatar">
                    <span class="material-icons" style="font-size:20px;">groups</span>
                  </div>
                } @else {
                  <div class="avatar">{{ getInitials(item.username) }}</div>
                }
                <div class="contact-info">
                  <div class="username">
                    {{ item._type === 'group' ? item.tenNhom : item.username }}
                  </div>
                  <div class="meta">
                    @if (item._type === 'group') {
                      <span class="group-badge">Group</span> · {{ item.members?.length || 0 }} members
                    } @else {
                      Friend since {{ item.ngayKetBan | date:'MMM d' }}
                    }
                  </div>
                </div>
                <!-- Unread Badge -->
                @if (chatState.unreadCounts()[item._key] > 0) {
                  <div class="unread-badge">
                    {{ chatState.unreadCounts()[item._key] }}
                  </div>
                }
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
  styles: [`
    .chat-sidebar { display: flex; flex-direction: column; height: 100%; border-right: 1px solid #e5e7eb; background: white; width: 300px; }
    .sidebar-header { padding: 1rem; border-bottom: 1px solid #e5e7eb; }
    .sidebar-header h2 { margin: 0; font-size: 1.25rem; font-weight: bold; }
    .sidebar-search { padding: 1rem; }
    .sidebar-search input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 20px; box-sizing: border-box; outline: none; font-size: 0.9rem; }
    .sidebar-search input:focus { border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
    .sidebar-list { flex: 1; overflow-y: auto; }
    .sidebar-list ul { list-style: none; margin: 0; padding: 0; }
    .contact-item { display: flex; padding: 0.85rem 1rem; align-items: center; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background 0.1s; }
    .contact-item:hover { background: #f9fafb; }
    .contact-item.active { background: #eef2ff; }
    .avatar { width: 40px; height: 40px; background: #c7d2fe; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 0.85rem; flex-shrink: 0; font-size: 0.85rem; }
    .avatar.group-avatar { background: #e0e7ff; color: #4338ca; }
    .contact-info { flex: 1; overflow: hidden; }
    .username { font-weight: 500; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta { font-size: 0.72rem; color: #6b7280; margin-top: 2px; }
    .group-badge { background: #eef2ff; color: #4f46e5; padding: 1px 6px; border-radius: 4px; font-weight: 600; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.3px; }
    .empty-state { padding: 2rem; text-align: center; color: #9ca3af; }
    .unread-badge {
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 0.5rem;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
    }
  `]
})
export class ChatListComponent implements OnInit {
  chatState = inject(ChatStateService);
  friendsService = inject(AddFriendsService);
  http = inject(HttpClient);
  ws = inject(WebSocketService);

  searchTerm = '';

  // Unified list: friends + groups, with _type and _key for identification
  filteredItems = computed(() => {
    const term = this.chatState.searchTerm().toLowerCase();
    const contacts = this.chatState.contacts().map(c => ({
      ...c,
      _type: 'dm' as const,
      _key: 'dm-' + c.id
    }));
    const groups = this.chatState.groups().map(g => ({
      ...g,
      _type: 'group' as const,
      _key: 'group-' + g.id
    }));
    const all = [...contacts, ...groups];
    if (!term) return all;
    return all.filter(item => {
      const name = item._type === 'group' ? (item.tenNhom || '') : (item.username || '');
      return name.toLowerCase().includes(term);
    });
  });

  async ngOnInit() {
    // Clear selection on load — no chat selected by default so unread badges show
    this.chatState.selectedContact.set(null);
    this.chatState.selectedGroup.set(null);

    // Load friends (DM contacts)
    try {
      const list = await this.friendsService.getFriends();
      this.chatState.contacts.set(list || []);
    } catch (e) {
      console.error('Could not load contacts', e);
    }

    // Load groups, then hand the full list to WebSocketService.
    // ws.setUserGroups() is the single trigger for the race-condition-safe
    // orchestration: it queues subscriptions that fire as soon as the
    // STOMP connection is (or becomes) live.
    try {
      const currentId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const groups = await this.http.get<any[]>(`${environment.apiUrl}/groups?userId=${currentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).toPromise();
      const resolvedGroups = groups || [];
      this.chatState.groups.set(resolvedGroups);

      // Hand the group list to the WS service — this triggers subscriptions
      // once the connection is established (combineLatest in the service handles
      // the race between connection timing and group data availability).
      this.ws.setUserGroups(resolvedGroups);
    } catch (e) {
      console.error('Could not load groups', e);
    }
  }

  updateSearch(val: string) {
    this.chatState.searchTerm.set(val);
  }

  selectItem(item: any) {
    this.chatState.resetUnread(item._key);
    if (item._type === 'group') {
      this.chatState.selectGroup(item);
    } else {
      this.chatState.selectContact(item);
    }
    // Update tab title to reflect the remaining unread count
    const remaining = this.chatState.totalUnread();
    document.title = remaining > 0 ? `(${remaining}) Allies` : 'Allies';
  }

  isActive(item: any): boolean {
    if (item._type === 'group') {
      return this.chatState.selectedGroup()?.id === item.id;
    }
    return this.chatState.selectedContact()?.id === item.id;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  }
}
