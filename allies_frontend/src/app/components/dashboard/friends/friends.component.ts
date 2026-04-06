import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardStateService } from '../../../services/dashboard-state.service';
import { AddFriendsService, UserLite } from '../../../services/add-friends.service';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- ── Incoming Requests ─────────────────────────────────────────── -->
      @if (state.incomingRequests().length > 0) {
        <div class="card">
          <button
            (click)="showIncoming.set(!showIncoming())"
            class="card-toggle"
            [class.bordered]="showIncoming()">
            <h2 class="section-title">
              Friend Requests Pending
              <span class="badge-red">{{ state.incomingRequests().length }}</span>
            </h2>
            <span class="material-icons chevron" [class.flipped]="showIncoming()">expand_more</span>
          </button>
          @if (showIncoming()) {
            <ul class="list">
              @for (req of state.incomingRequests(); track req.id) {
                <li class="list-row">
                  <div class="user-row">
                    <div class="avatar primary">{{ state.getInitials(req.fromUser?.username || 'U') }}</div>
                    <div>
                      <div class="name">{{ req.fromUser?.username }}</div>
                      <div class="sub">Sent you a friend request</div>
                    </div>
                  </div>
                  <div class="actions">
                    <button (click)="accept(req.id)" class="btn-primary">Accept</button>
                    <button (click)="decline(req.id)" class="btn-secondary">Decline</button>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      }

      <!-- ── Outgoing Requests ─────────────────────────────────────────── -->
      @if (state.outgoingRequests().length > 0) {
        <div class="card">
          <button
            (click)="showOutgoing.set(!showOutgoing())"
            class="card-toggle"
            [class.bordered]="showOutgoing()">
            <h2 class="section-title">
              Friend Requests Sent
              <span class="badge-gray">{{ state.outgoingRequests().length }}</span>
            </h2>
            <span class="material-icons chevron" [class.flipped]="showOutgoing()">expand_more</span>
          </button>
          @if (showOutgoing()) {
            <ul class="list">
              @for (req of state.outgoingRequests(); track req.id) {
                <li class="list-row">
                  <div class="user-row">
                    <div class="avatar gray">{{ state.getInitials(req.toUser?.username || 'U') }}</div>
                    <div>
                      <div class="name">{{ req.toUser?.username }}</div>
                      <div class="sub">Waiting for approval</div>
                    </div>
                  </div>
                  <button (click)="cancel(req.id)" class="link-danger">Cancel Request</button>
                </li>
              }
            </ul>
          }
        </div>
      }

      <!-- ── Find Friends ──────────────────────────────────────────────── -->
      <div class="card">
        <div class="card-header">
          <h2 class="section-title">Find Friends</h2>
        </div>
        <div class="card-body">
          <div class="search-row">
            <input
              #searchInput
              (input)="onSearchInput(searchInput.value)"
              (keyup.enter)="search(searchInput.value)"
              type="text"
              class="search-input"
              placeholder="Search username or email..."
            />
            <button (click)="search(searchInput.value)" [disabled]="isSearching()" class="btn-primary">
              {{ isSearching() ? 'Searching...' : 'Search' }}
            </button>
          </div>

          @if (searchResults().length === 0 && !isSearching()) {
            <div class="empty-msg">No results yet.</div>
          } @else {
            <ul class="results-list">
              @for (user of searchResults(); track user.id) {
                <li class="list-row">
                  <div class="user-row">
                    <div class="avatar blue">{{ state.getInitials(user.username) }}</div>
                    <div>
                      <div class="name">{{ user.username }}</div>
                      @if (user.email) { <div class="sub">{{ user.email }}</div> }
                    </div>
                  </div>

                  <!-- Action buttons based on relationship state -->
                  @if (confirmingUnfriendId() === user.id) {
                    <div class="actions">
                      <span class="sub">Unfriend?</span>
                      <button (click)="unfriend(user.id)" class="btn-danger-sm">Yes</button>
                      <button (click)="confirmingUnfriendId.set(null)" class="btn-gray-sm">No</button>
                    </div>
                  } @else if (state.hasFriend(user.id)) {
                    <button (click)="confirmingUnfriendId.set(user.id)" class="link-gray">Friend</button>
                  } @else if (confirmingCancelId() === user.id) {
                    <div class="actions">
                      <span class="sub">Cancel request?</span>
                      <button (click)="cancelByUserId(user.id)" class="btn-danger-sm">Yes</button>
                      <button (click)="confirmingCancelId.set(null)" class="btn-gray-sm">No</button>
                    </div>
                  } @else if (state.hasPendingRequest(user.id)) {
                    <button (click)="confirmingCancelId.set(user.id)" class="link-gray" title="Click to cancel">
                      Request Sent
                    </button>
                  } @else if (state.hasIncomingRequest(user.id)) {
                    @if (respondingUserId() === user.id) {
                      <div class="actions">
                        <button (click)="acceptByUserId(user.id)" class="btn-primary">Accept</button>
                        <button (click)="declineByUserId(user.id)" class="btn-secondary">Decline</button>
                        <button (click)="respondingUserId.set(null)" class="material-icons close-btn">close</button>
                      </div>
                    } @else {
                      <button (click)="respondingUserId.set(user.id)" class="link-green">Respond to request</button>
                    }
                  } @else {
                    <button (click)="sendRequest(user.id)" class="link-primary">Add Friend</button>
                  }

                </li>
              }
            </ul>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .card { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
    .card-header { padding: 1rem 1.5rem; border-bottom: 1px solid #f3f4f6; }
    .card-body { padding: 1.5rem; }
    .card-toggle {
      width: 100%; padding: 1rem 1.5rem;
      display: flex; justify-content: space-between; align-items: center;
      background: none; border: none; cursor: pointer;
      transition: background 0.15s;
    }
    .card-toggle:hover { background: #f9fafb; }
    .card-toggle.bordered { border-bottom: 1px solid #e5e7eb; }
    .section-title { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; color: #111827; margin: 0; }
    .badge-red { background: #fee2e2; color: #dc2626; font-size: 0.7rem; padding: 2px 8px; border-radius: 9999px; }
    .badge-gray { background: #f3f4f6; color: #6b7280; font-size: 0.7rem; padding: 2px 8px; border-radius: 9999px; }
    .chevron { color: #9ca3af; transition: transform 0.2s; }
    .chevron.flipped { transform: rotate(180deg); }
    .list { list-style: none; margin: 0; padding: 0; }
    .list-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-top: 1px solid #f3f4f6; }
    .user-row { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
    .avatar.primary { background: #e0e7ff; color: #4f46e5; }
    .avatar.gray { background: #f3f4f6; color: #6b7280; }
    .avatar.blue { background: #dbeafe; color: #2563eb; }
    .name { font-weight: 600; font-size: 0.875rem; color: #111827; }
    .sub { font-size: 0.75rem; color: #6b7280; margin-top: 1px; }
    .actions { display: flex; align-items: center; gap: 8px; }
    .search-row { display: flex; gap: 10px; margin-bottom: 1rem; }
    .search-input { flex: 1; border: 1px solid #d1d5db; border-radius: 8px; padding: 0.5rem 0.875rem; font-size: 0.875rem; outline: none; transition: border 0.15s; }
    .search-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
    .empty-msg { color: #9ca3af; font-style: italic; font-size: 0.875rem; margin-top: 8px; }
    .results-list { list-style: none; margin: 0; padding: 0; }
    .results-list .list-row { border: 1px solid #f3f4f6; border-radius: 8px; margin-bottom: 8px; padding: 0.75rem 1rem; }
    /* Buttons */
    .btn-primary { background: #4f46e5; color: white; border: none; border-radius: 8px; padding: 0.4rem 1rem; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: opacity 0.15s; }
    .btn-primary:hover { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.4; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: none; border-radius: 8px; padding: 0.4rem 1rem; font-size: 0.8rem; font-weight: 500; cursor: pointer; }
    .btn-secondary:hover { background: #e5e7eb; }
    .btn-danger-sm { background: #ef4444; color: white; border: none; border-radius: 6px; padding: 0.25rem 0.75rem; font-size: 0.75rem; cursor: pointer; }
    .btn-gray-sm { background: #e5e7eb; color: #374151; border: none; border-radius: 6px; padding: 0.25rem 0.75rem; font-size: 0.75rem; cursor: pointer; }
    .link-primary { background: none; border: none; color: #4f46e5; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .link-primary:hover { text-decoration: underline; }
    .link-gray { background: none; border: none; color: #6b7280; font-size: 0.85rem; font-weight: 500; cursor: pointer; }
    .link-gray:hover { color: #374151; }
    .link-green { background: none; border: none; color: #16a34a; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .link-danger { background: none; border: none; color: #6b7280; font-size: 0.85rem; font-weight: 500; cursor: pointer; }
    .link-danger:hover { color: #ef4444; text-decoration: underline; }
    .close-btn { background: none; border: none; color: #9ca3af; font-size: 1rem; cursor: pointer; padding: 4px; }
  `]
})
export class FriendsComponent implements OnInit {
  state = inject(DashboardStateService);
  private addFriendsService = inject(AddFriendsService);

  // Local UI state (ephemeral — OK to be here)
  showIncoming = signal(true);
  showOutgoing = signal(false);
  isSearching = signal(false);
  searchResults = signal<UserLite[]>([]);
  confirmingUnfriendId = signal<string | number | null>(null);
  confirmingCancelId = signal<string | number | null>(null);
  respondingUserId = signal<string | number | null>(null);
  private searchTimeout?: any;

  ngOnInit(): void {
    this.state.loadIncomingRequests();
    this.state.loadOutgoingRequests();
    this.state.loadFriendsList();
  }

  onSearchInput(query: string): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.search(query), 400);
  }

  async search(query: string): Promise<void> {
    const q = query.trim();
    if (!q) { this.searchResults.set([]); return; }
    this.isSearching.set(true);
    try {
      const results = await this.addFriendsService.searchUsers(q);
      this.searchResults.set(results || []);
    } catch (e) {
      console.error('Search failed', e);
      this.searchResults.set([]);
    } finally {
      this.isSearching.set(false);
    }
  }

  async sendRequest(userId: string | number): Promise<void> {
    try {
      await this.addFriendsService.sendRequest(userId);
      this.state.sentRequestUserIds.update(set => { const s = new Set(set); s.add(userId); return s; });
      this.state.loadOutgoingRequests();
    } catch (e: any) {
      alert(e?.error?.message || 'Failed to send request');
    }
  }

  async accept(reqId: string | number): Promise<void> {
    await this.addFriendsService.accept(reqId);
    this.state.loadIncomingRequests();
    this.state.loadFriendsList();
  }

  async decline(reqId: string | number): Promise<void> {
    await this.addFriendsService.decline(reqId);
    this.state.loadIncomingRequests();
  }

  async cancel(reqId: string | number): Promise<void> {
    await this.addFriendsService.cancel(reqId);
    this.state.loadOutgoingRequests();
  }

  async cancelByUserId(userId: string | number): Promise<void> {
    const req = this.state.outgoingRequests().find(r => String(r.toUser?.id) === String(userId));
    if (req) {
      this.confirmingCancelId.set(null);
      await this.cancel(req.id);
      this.state.sentRequestUserIds.update(set => { const s = new Set(set); s.delete(userId); return s; });
    }
  }

  async acceptByUserId(userId: string | number): Promise<void> {
    const req = this.state.incomingRequests().find(r => String(r.fromUser?.id) === String(userId));
    if (req) { this.respondingUserId.set(null); await this.accept(req.id); }
  }

  async declineByUserId(userId: string | number): Promise<void> {
    const req = this.state.incomingRequests().find(r => String(r.fromUser?.id) === String(userId));
    if (req) { this.respondingUserId.set(null); await this.decline(req.id); }
  }

  async unfriend(friendId: string | number): Promise<void> {
    await this.addFriendsService.unfriend(friendId);
    this.confirmingUnfriendId.set(null);
    this.state.loadFriendsList();
  }
}
