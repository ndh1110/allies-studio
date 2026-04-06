import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardStateService } from '../../../services/dashboard-state.service';
import { AddFriendsService } from '../../../services/add-friends.service';
import { HttpClient } from '@angular/common/http';
import { ChatStateService } from '../../../services/chat-state.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- ── Friends List ──────────────────────────────────────────────────── -->
      <div class="card">
        <div class="card-header">
          <h2 class="section-title">My Contacts</h2>
          <button (click)="showCreateGroupModal.set(true)" class="btn-primary">
            <span class="material-icons" style="font-size:18px;">group_add</span>
            Create Group
          </button>
        </div>
        @if (state.friendsList().length === 0) {
          <div class="empty-state">
            <span class="material-icons">contacts</span>
            <p>No contacts yet. Go to Friends to add some!</p>
          </div>
        } @else {
          <ul class="list">
            @for (friend of state.friendsList(); track friend.id) {
              <li class="list-row">
                <div class="user-row">
                  <div class="avatar green">{{ state.getInitials(friend.username) }}</div>
                  <div>
                    <div class="name">{{ friend.username }}</div>
                    <div class="sub">Since {{ friend.ngayKetBan | date:'shortDate' }}</div>
                  </div>
                </div>
                @if (confirmingUnfriendId() === friend.id) {
                  <div class="actions">
                    <span class="sub">Unfriend?</span>
                    <button (click)="unfriend(friend.id)" class="btn-danger-sm">Yes</button>
                    <button (click)="confirmingUnfriendId.set(null)" class="btn-gray-sm">No</button>
                  </div>
                } @else {
                  <button (click)="confirmingUnfriendId.set(friend.id)" class="friend-chip">Friend</button>
                }
              </li>
            }
          </ul>
        }
      </div>

      <!-- ── My Groups ──────────────────────────────────────────────────────── -->
      @if (state.myGroups().length > 0) {
        <div class="card">
          <div class="card-header">
            <h2 class="section-title">My Groups</h2>
          </div>
          <ul class="list">
            @for (group of state.myGroups(); track group.id) {
              <li class="list-row">
                <div class="user-row" style="cursor:pointer" (click)="openGroupChat(group)">
                  <div class="avatar indigo">
                    <span class="material-icons" style="font-size:20px;">groups</span>
                  </div>
                  <div>
                    <div class="name hover-link">{{ group.tenNhom }}</div>
                    <div class="sub">{{ group.members?.length || 0 }} members · {{ group.myRole }}</div>
                  </div>
                </div>
                @if (group.myRole === 'ADMIN') {
                  @if (confirmingDeleteGroupId() === group.id) {
                    <div class="actions">
                      <span class="sub">Delete?</span>
                      <button (click)="deleteGroup(group.id)" class="btn-danger-sm">Yes</button>
                      <button (click)="confirmingDeleteGroupId.set(null)" class="btn-gray-sm">No</button>
                    </div>
                  } @else {
                    <button (click)="confirmingDeleteGroupId.set(group.id)" class="icon-btn" title="Delete Group">
                      <span class="material-icons">delete_outline</span>
                    </button>
                  }
                }
              </li>
            }
          </ul>
        </div>
      }

      <!-- ── Create Group Modal ─────────────────────────────────────────────── -->
      @if (showCreateGroupModal()) {
        <div class="modal-backdrop" (click)="showCreateGroupModal.set(false)"></div>
        <div class="modal">
          <div class="modal-header">
            <h3>Create New Group</h3>
            <button (click)="showCreateGroupModal.set(false)" class="icon-btn">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <label class="modal-label">Group Name</label>
            <input [(ngModel)]="newGroupName" placeholder="Enter group name..." class="modal-input" />

            <label class="modal-label" style="margin-top:16px;">Add Members</label>
            @if (state.friendsList().length === 0) {
              <p class="sub">No friends to add yet.</p>
            } @else {
              <div class="member-list">
                @for (friend of state.friendsList(); track friend.id) {
                  <div class="member-item" (click)="toggleMember(friend.id)">
                    <div class="user-row">
                      <div class="avatar green small">{{ state.getInitials(friend.username) }}</div>
                      <span class="name">{{ friend.username }}</span>
                    </div>
                    <div class="checkbox" [class.checked]="selectedMembers().has(friend.id)">
                      @if (selectedMembers().has(friend.id)) {
                        <span class="material-icons" style="font-size:14px;">check</span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
          <div class="modal-footer">
            <button (click)="showCreateGroupModal.set(false)" class="btn-gray">Cancel</button>
            <button (click)="createGroup()" [disabled]="!newGroupName.trim() || selectedMembers().size === 0" class="btn-primary">
              Create Group
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .card { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
    .card-header { padding: 1rem 1.5rem; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
    .section-title { font-size: 1rem; font-weight: 700; color: #111827; margin: 0; }
    .list { list-style: none; margin: 0; padding: 0; }
    .list-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-top: 1px solid #f3f4f6; }
    .user-row { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
    .avatar.green { background: #d1fae5; color: #059669; }
    .avatar.indigo { background: #e0e7ff; color: #4f46e5; }
    .avatar.small { width: 32px; height: 32px; font-size: 0.75rem; }
    .name { font-weight: 600; font-size: 0.875rem; color: #111827; }
    .hover-link:hover { text-decoration: underline; }
    .sub { font-size: 0.75rem; color: #6b7280; }
    .actions { display: flex; align-items: center; gap: 8px; }
    .empty-state { padding: 2.5rem; text-align: center; color: #9ca3af; }
    .empty-state .material-icons { font-size: 3rem; display: block; margin-bottom: 8px; }
    .friend-chip { background: none; border: none; color: #6b7280; font-size: 0.85rem; font-weight: 500; cursor: pointer; }
    .friend-chip:hover { color: #ef4444; }
    .icon-btn { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; }
    .icon-btn:hover { color: #ef4444; }
    .btn-primary { display: flex; align-items: center; gap: 6px; background: #4f46e5; color: white; border: none; border-radius: 8px; padding: 0.4rem 0.875rem; font-size: 0.8rem; font-weight: 500; cursor: pointer; }
    .btn-primary:hover { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.4; }
    .btn-gray { background: #f3f4f6; color: #374151; border: none; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
    .btn-danger-sm { background: #ef4444; color: white; border: none; border-radius: 6px; padding: 0.25rem 0.75rem; font-size: 0.75rem; cursor: pointer; }
    .btn-gray-sm { background: #e5e7eb; color: #374151; border: none; border-radius: 6px; padding: 0.25rem 0.75rem; font-size: 0.75rem; cursor: pointer; }
    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 40; }
    .modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: white; border-radius: 16px; width: 440px; max-width: 95vw; z-index: 50; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; }
    .modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #111827; }
    .modal-body { padding: 1.25rem 1.5rem; }
    .modal-label { display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .modal-input { width: 100%; border: 1px solid #d1d5db; border-radius: 8px; padding: 0.5rem 0.875rem; font-size: 0.875rem; outline: none; box-sizing: border-box; }
    .modal-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
    .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 10px; }
    .member-list { border: 1px solid #e5e7eb; border-radius: 8px; max-height: 200px; overflow-y: auto; }
    .member-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; cursor: pointer; transition: background 0.15s; }
    .member-item:hover { background: #f9fafb; }
    .checkbox { width: 20px; height: 20px; border: 2px solid #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .checkbox.checked { background: #4f46e5; border-color: #4f46e5; color: white; }
  `]
})
export class ContactsComponent implements OnInit {
  state = inject(DashboardStateService);
  private addFriendsService = inject(AddFriendsService);
  private http = inject(HttpClient);
  private chatState = inject(ChatStateService);
  private router = inject(Router);

  confirmingUnfriendId = signal<string | number | null>(null);
  confirmingDeleteGroupId = signal<string | number | null>(null);
  showCreateGroupModal = signal(false);
  selectedMembers = signal<Set<string | number>>(new Set());
  newGroupName = '';

  ngOnInit(): void {
    this.state.loadFriendsList();
    this.state.loadGroups();
  }

  async unfriend(friendId: string | number): Promise<void> {
    await this.addFriendsService.unfriend(friendId);
    this.confirmingUnfriendId.set(null);
    this.state.loadFriendsList();
  }

  openGroupChat(group: any): void {
    this.chatState.selectGroup(group);
    this.router.navigate(['/dashboard/messages']);
  }

  toggleMember(id: string | number): void {
    this.selectedMembers.update(set => {
      const s = new Set(set);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  async createGroup(): Promise<void> {
    const currentId = Number(localStorage.getItem('userId'));
    const token = localStorage.getItem('token');
    if (!currentId || !this.newGroupName.trim()) return;
    try {
      await this.http.post(`${environment.apiUrl}/groups`,
        { tenNhom: this.newGroupName.trim(), creatorId: currentId, memberIds: Array.from(this.selectedMembers()) },
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();
      this.showCreateGroupModal.set(false);
      this.newGroupName = '';
      this.selectedMembers.set(new Set());
      this.state.loadGroups();
    } catch (e) { console.error('Failed to create group', e); }
  }

  async deleteGroup(groupId: string | number): Promise<void> {
    const currentId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    try {
      await this.http.delete(`${environment.apiUrl}/groups/${groupId}?userId=${currentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();
      this.confirmingDeleteGroupId.set(null);
      this.state.loadGroups();
    } catch (e) { console.error('Failed to delete group', e); }
  }
}
