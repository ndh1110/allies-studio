import { Injectable, signal, inject, NgZone } from '@angular/core';
import { AddFriendsService, UserLite } from './add-friends.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * DashboardStateService — Single source of truth for all shared state.
 *
 * The DashboardComponent (Shell) writes to this service via WebSocket events.
 * Child components (FriendsComponent, ContactsComponent, etc.) READ from it.
 * This prevents state from being destroyed when routes change.
 */
@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  private addFriendsService = inject(AddFriendsService);
  private http = inject(HttpClient);
  private ngZone = inject(NgZone);

  // ─── Auth / User ────────────────────────────────────────────────────────────
  currentUserId = signal<number>(0);
  currentUsername = signal<string>('');

  // ─── Notification Bell ───────────────────────────────────────────────────────
  notificationCount = signal<number>(0);
  showNotificationDropdown = signal<boolean>(false);

  // ─── Friend Requests ─────────────────────────────────────────────────────────
  incomingRequests = signal<any[]>([]);
  outgoingRequests = signal<any[]>([]);
  sentRequestUserIds = signal<Set<string | number>>(new Set());

  // ─── Contacts / Friends ───────────────────────────────────────────────────────
  friendsList = signal<any[]>([]);

  // ─── Groups ──────────────────────────────────────────────────────────────────
  myGroups = signal<any[]>([]);

  // ─── Initialise from localStorage (called once on DashboardComponent.ngOnInit) ─
  init(): void {
    this.currentUserId.set(Number(localStorage.getItem('userId')) || 0);
    this.currentUsername.set(localStorage.getItem('username') || '');
    this.loadInitialNotificationCount();
  }

  // ─── Data Loaders (called by Shell & child components) ───────────────────────

  async loadInitialNotificationCount(): Promise<void> {
    try {
      const results: any[] = await this.addFriendsService.getIncoming();
      const pending = (results || []).filter(r => (r.trangThai || r.status) === 'PENDING');
      this.notificationCount.set(pending.length);
      this.incomingRequests.set(pending);
    } catch (e) {
      console.error('Failed to load initial notification count', e);
    }
  }

  async loadFriendsList(): Promise<void> {
    try {
      const friends = await this.addFriendsService.getFriends();
      this.friendsList.set(friends || []);
    } catch (e) {
      console.error('Failed to load friends list', e);
    }
  }

  async loadIncomingRequests(): Promise<void> {
    try {
      const results: any[] = await this.addFriendsService.getIncoming();
      this.incomingRequests.set((results || []).filter(r => (r.trangThai || r.status) === 'PENDING'));
    } catch (e) {
      console.error('Failed to load incoming requests', e);
    }
  }

  async loadOutgoingRequests(): Promise<void> {
    try {
      const results: any[] = await this.addFriendsService.getOutgoing();
      this.outgoingRequests.set((results || []).filter(r => (r.trangThai || r.status) === 'PENDING'));
    } catch (e) {
      console.error('Failed to load outgoing requests', e);
    }
  }

  async loadGroups(): Promise<void> {
    const currentId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    try {
      const groups = await this.http.get<any[]>(
        `${environment.apiUrl}/groups?userId=${currentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();
      this.myGroups.set(groups || []);
    } catch (e) {
      console.error('Failed to load groups', e);
    }
  }

  // ─── Optimistic real-time updates (called by DashboardComponent WS handler) ──

  /** Called when a FRIEND_REQUEST notification arrives for the current user */
  onFriendRequestReceived(data: any): void {
    this.ngZone.run(() => {
      this.notificationCount.update(n => n + 1);
      if (data) {
        this.incomingRequests.update(list => [...list, data]);
      }
    });
  }

  /** Called when a FRIEND_REQUEST_ACCEPTED notification arrives */
  onFriendRequestAccepted(data: any): void {
    this.ngZone.run(() => {
      if (data?.toUser) {
        const newFriend = {
          id: data.toUser.id,
          username: data.toUser.username,
          ngayKetBan: data.thoiGianGui || new Date().toISOString()
        };
        // Add to contacts list
        this.friendsList.update(list => [...list, newFriend]);
        // Remove from sent requests
        this.outgoingRequests.update(list => list.filter(r => r.toUser?.id !== newFriend.id));
        this.sentRequestUserIds.update(set => {
          const newSet = new Set(set);
          newSet.delete(newFriend.id);
          return newSet;
        });
      }
    });
  }

  // ─── UI Helpers ───────────────────────────────────────────────────────────────

  toggleNotificationDropdown(): void {
    const isOpen = this.showNotificationDropdown();
    this.showNotificationDropdown.set(!isOpen);
    if (!isOpen) {
      this.loadIncomingRequests();
    }
  }

  clearNotificationCount(): void {
    this.notificationCount.set(0);
  }

  hasFriend(userId: string | number): boolean {
    return this.friendsList().some(f => String(f.id) === String(userId));
  }

  hasIncomingRequest(userId: string | number): boolean {
    return this.incomingRequests().some(r => String(r.fromUser?.id) === String(userId));
  }

  hasPendingRequest(userId: string | number): boolean {
    return this.outgoingRequests().some(r => String(r.toUser?.id) === String(userId)) ||
      this.sentRequestUserIds().has(userId);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
