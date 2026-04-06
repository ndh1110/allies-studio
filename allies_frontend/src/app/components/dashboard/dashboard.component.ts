import { Component, OnInit, OnDestroy, ViewChild, signal, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { WebRtcService } from '../../services/webrtc.service';
import { ChatStateService } from '../../services/chat-state.service';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { VideoCallComponent } from '../video-call/video-call.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, VideoCallComponent],
  template: `
    <div class="shell">
      <header class="navbar">
        <div class="navbar-inner">

          <h1 class="brand">Allies</h1>

          <nav class="nav-links">
            <a routerLink="/dashboard/friends" routerLinkActive="nav-active" class="nav-btn">
              <span class="material-icons">group_add</span>
              <span class="nav-text">Friends</span>
              @if (state.notificationCount() > 0) {
                <span class="nav-badge">{{ state.notificationCount() > 99 ? '99+' : state.notificationCount() }}</span>
              }
            </a>

            <a routerLink="/dashboard/messages" routerLinkActive="nav-active" class="nav-btn">
              <span class="material-icons">chat</span>
              <span class="nav-text">Messages</span>
              @if (chatState.totalUnread() > 0) {
                <span class="nav-badge">{{ chatState.totalUnread() > 99 ? '99+' : chatState.totalUnread() }}</span>
              }
            </a>

            <a routerLink="/dashboard/contacts" routerLinkActive="nav-active" class="nav-btn">
              <span class="material-icons">contacts</span>
              <span class="nav-text">Contacts</span>
            </a>

            <a routerLink="/dashboard/calls" routerLinkActive="nav-active" class="nav-btn">
              <span class="material-icons">phone</span>
              <span class="nav-text">Calls</span>
            </a>
          </nav>

          <div class="navbar-right">

            <div class="notif-wrapper">
              <button class="bell-btn" (click)="state.toggleNotificationDropdown()">
                <span class="material-icons">notifications</span>
                @if (state.notificationCount() > 0) {
                  <span class="bell-badge">{{ state.notificationCount() }}</span>
                }
              </button>

              @if (state.showNotificationDropdown()) {
                <div class="notif-backdrop" (click)="state.showNotificationDropdown.set(false)"></div>
                <div class="notif-dropdown">
                  <div class="notif-header"><h4>Notifications</h4></div>
                  <div class="notif-body">
                    @if (state.incomingRequests().length === 0) {
                      <div class="notif-empty">
                        <span class="material-icons">check_circle</span>
                        <p>No new notifications</p>
                      </div>
                    } @else {
                      @for (req of state.incomingRequests(); track req.id) {
                        <div class="notif-item unread" (click)="onNotificationClick()">
                          <div class="notif-avatar">{{ state.getInitials(req.fromUser?.username || '?') }}</div>
                          <div class="notif-content">
                            <p><strong>{{ req.fromUser?.username }}</strong> sent you a friend request</p>
                            <span class="notif-time">Pending</span>
                          </div>
                          <div class="notif-dot"></div>
                        </div>
                      }
                    }
                  </div>
                </div>
              }
            </div>

            <div class="user-chip">
              <div class="avatar">{{ state.getInitials(state.currentUsername()) }}</div>
              <span class="username-label">{{ state.currentUsername() }}</span>
              <button (click)="logout()" class="logout-btn" title="Logout">
                <span class="material-icons">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- ── Video Call Overlay ────────────────────────────────────────────
           Lives at the shell level so it floats above all routes/panels.
           targetUsername is kept in sync with the selected DM contact.
      ─────────────────────────────────────────────────────────────────── -->
      <app-video-call
        #videoCallOverlay
        [targetUsername]="selectedContactUsername()"
      ></app-video-call>
    </div>
  `,
  styles: [`
    /* ── Shell Layout ─────────────────────────────────────────────────────── */
    .shell { display: flex; flex-direction: column; min-height: 100vh; background: #f3f4f6; }

    /* ── Navbar ───────────────────────────────────────────────────────────── */
    .navbar {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      position: sticky; top: 0; z-index: 30;
    }
    .navbar-inner {
      max-width: 80rem; margin: 0 auto;
      padding: 0 1.5rem;
      height: 4rem;
      display: flex; align-items: center; gap: 2rem;
    }

    /* Brand */
    .brand { font-size: 1.5rem; font-weight: 800; color: var(--primary-color, #4f46e5); flex-shrink: 0; }

    /* Nav links */
    .nav-links { display: flex; gap: 0.25rem; flex: 1; }
    .nav-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 0.5rem 0.875rem;
      border-radius: 8px;
      font-size: 0.875rem; font-weight: 500;
      color: #6b7280;
      text-decoration: none;
      position: relative;
      transition: background 0.15s, color 0.15s;
    }
    .nav-btn:hover { background: #f3f4f6; color: #111827; }
    .nav-btn.nav-active { background: #4f46e5; color: white; }
    .nav-btn .material-icons { font-size: 1.1rem; }

    /* Unread badge on nav buttons */
    .nav-badge {
      position: absolute; top: 2px; right: 2px;
      background: #ef4444; color: white;
      font-size: 0.6rem; font-weight: 700;
      min-width: 16px; height: 16px; padding: 0 4px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      animation: badge-pop 0.2s ease-out;
    }
    @keyframes badge-pop {
      0%   { transform: scale(0.5); opacity: 0; }
      70%  { transform: scale(1.15); }
      100% { transform: scale(1); opacity: 1; }
    }

    /* ── Navbar Right ─────────────────────────────────────────────────────── */
    .navbar-right { display: flex; align-items: center; gap: 1rem; margin-left: auto; }

    /* Bell */
    .notif-wrapper { position: relative; }
    .bell-btn {
      position: relative; padding: 0.5rem;
      background: none; border: none; cursor: pointer;
      color: #9ca3af; border-radius: 8px;
      transition: color 0.15s;
    }
    .bell-btn:hover { color: #374151; }
    .bell-badge {
      position: absolute; top: -2px; right: -2px;
      background: #ef4444; color: white;
      font-size: 0.6rem; font-weight: 700;
      min-width: 16px; height: 16px; padding: 0 4px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .notif-backdrop { position: fixed; inset: 0; z-index: 40; }
    .notif-dropdown {
      position: absolute; top: calc(100% + 8px); right: -50px; /* Chỉnh lại một chút cho điện thoại */
      width: 300px; background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      border: 1px solid #e5e7eb;
      z-index: 50; overflow: hidden;
    }
    .notif-header { padding: 14px 18px; border-bottom: 1px solid #f3f4f6; }
    .notif-header h4 { margin: 0; font-size: 1rem; font-weight: 700; color: #111827; }
    .notif-body { max-height: 300px; overflow-y: auto; }
    .notif-empty { padding: 28px 18px; text-align: center; color: #9ca3af; }
    .notif-empty .material-icons { font-size: 2rem; margin-bottom: 6px; display: block; }
    .notif-empty p { margin: 0; font-size: 0.85rem; }
    .notif-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 18px; cursor: pointer;
      transition: background 0.15s;
    }
    .notif-item.unread { background: #eff6ff; }
    .notif-item.unread:hover { background: #dbeafe; }
    .notif-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: #c7d2fe; color: #4f46e5;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
    }
    .notif-content { flex: 1; min-width: 0; }
    .notif-content p { margin: 0; font-size: 0.8rem; color: #374151; line-height: 1.4; }
    .notif-content strong { color: #111827; }
    .notif-time { font-size: 0.7rem; color: #4f46e5; font-weight: 600; }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #4f46e5; flex-shrink: 0; }

    /* User chip */
    .user-chip { display: flex; align-items: center; gap: 8px; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: #4f46e5; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 700;
      flex-shrink: 0;
    }
    .username-label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    .logout-btn {
      background: none; border: none; cursor: pointer;
      color: #9ca3af; padding: 4px; border-radius: 6px;
      display: flex; align-items: center;
    }
    .logout-btn:hover { color: #ef4444; }

    /* ── Main Content ─────────────────────────────────────────────────────── */
    .main-content {
      flex: 1;
      max-width: 80rem; width: 100%;
      margin: 0 auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }

    /* =======================================================================
       🔥 MA THUẬT MOBILE RESPONSIVE (Dành cho điện thoại) 🔥
       ======================================================================= */
    @media (max-width: 768px) {
      /* 1. Navbar (Mobile) - Đỡ chật chỗ */
      .navbar-inner {
        padding: 0 0.5rem;
        gap: 0.5rem;
        justify-content: space-between;
      }
      .brand { display: none; } /* Ẩn logo để nhường chỗ */
      
      .nav-links { gap: 0.25rem; justify-content: flex-start; }
      .nav-btn { 
        padding: 0.5rem; 
      }
      .nav-text { display: none; } /* CHỈ HIỆN ICON, ẨN LABEL NHƯ YÊU CẦU */
      
      .username-label { display: none; }

      .navbar-right { gap: 0.25rem; }
      
      /* Sửa popup notification gọn hơn */
      .notif-dropdown { right: -10px; width: 280px; }

      /* 2. Main Content Area */
      .main-content {
        padding: 0.5rem;
        height: calc(100vh - 4rem); 
        overflow: hidden; /* Prevent scrolling on body, let child scroll */
      }

      /* 3. Child component force-stacking & hiding detail panel (CRITICAL) */
      ::ng-deep .chat-main-wrapper {
        flex-direction: column !important;
      }

      /* Ép sidebar/list thành full width */
      ::ng-deep .chat-list-pane,
      ::ng-deep .sidebar,
      ::ng-deep .left-panel {
        width: 100% !important;
        max-width: 100% !important;
        flex: 1 1 100% !important;
        border-right: none !important;
        border-radius: 12px !important;
      }

      /* HIDE Unnecessary Right Detail Panels by default (when no chat is selected) */
      ::ng-deep .chat-history-pane,
      ::ng-deep .right-panel,
      ::ng-deep .detail-panel {
        display: none !important;
      }

      /* =========================================
         MOBILE VIEW TOGGLE (Master-Detail)
         ========================================= */
      /* When a chat IS selected: Hide the list */
      ::ng-deep .chat-main-wrapper.has-selection .chat-list-pane {
        display: none !important;
      }
      
      /* When a chat IS selected: Show the Chat panel taking up 100% width */
      ::ng-deep .chat-main-wrapper.has-selection .chat-history-pane {
        display: flex !important;
        width: 100% !important;
        max-width: 100% !important;
        flex: 1 1 100% !important;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Injected services
  state = inject(DashboardStateService);
  chatState = inject(ChatStateService);
  private ws = inject(WebSocketService);
  private webRtcService = inject(WebRtcService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  /** Reference to the floating video call overlay component */
  @ViewChild('videoCallOverlay') videoCallOverlay!: VideoCallComponent;

  /**
   * Computed: username of the currently selected DM contact.
   * Passed into [targetUsername] on <app-video-call> so outgoing calls
   * are always targeted at whoever you're chatting with.
   */
  selectedContactUsername(): string {
    return this.chatState.selectedContact()?.username ?? '';
  }

  private notificationSub: any;
  private dmMsgSub: any;
  private groupMsgSub: any;

  ngOnInit(): void {
    // ── ① Bootstrap state ─────────────────────────────────────────────────
    this.state.init();

    // ── ② Connect WebSocket (idempotent — safe to call multiple times) ────
    try { this.ws.connect(); } catch (e) { console.warn('WS disabled:', e); }

    // ── ③ Subscribe to private user queues ─────────────────────────────────
    const username = this.state.currentUsername();
    if (username) {
      this.ws.subscribeToUserQueue(username);
      // Tell WebRtcService who WE are so it can fill in SignalMessage.from
      this.webRtcService.setMyUsername(username);
      this.state.loadGroups().then(groups => {
        this.ws.setUserGroups(this.state.myGroups());
      });
    }

    // ── ④ Handle incoming friend-request notifications ─────────────────────
    this.notificationSub = this.ws.notifications$.subscribe(notification => {
      if (!notification) return;
      this.ngZone.run(() => {
        const currentUserId = this.state.currentUserId();
        switch (notification.type) {
          case 'FRIEND_REQUEST':
            if (Number(notification.targetUserId) === currentUserId) {
              this.state.onFriendRequestReceived(notification.data);
            }
            break;
          case 'FRIEND_REQUEST_ACCEPTED':
            if (Number(notification.targetUserId) === currentUserId) {
              this.state.onFriendRequestAccepted(notification.data);
            }
            break;
        }
      });
    });

    // ── ⑤ DM unread counting ──────────────────────────────────────────────
    this.dmMsgSub = this.ws.messages$.subscribe(msg => {
      if (!msg) return;
      this.ngZone.run(() => {
        const currentUserId = this.state.currentUserId();
        const activeContactId = this.chatState.selectedContact()?.id;
        const senderId = msg.maTkA?.id ?? msg.maTkA?.maTk;
        if (Number(senderId) === currentUserId) return;
        if (Number(senderId) !== Number(activeContactId)) {
          this.chatState.incrementUnread('dm-' + senderId);
          this._updateTabTitle();
        }
      });
    });

    // ── ⑥ Group unread counting ───────────────────────────────────────────
    this.groupMsgSub = this.ws.groupMessages$.subscribe(msg => {
      if (!msg) return;
      this.ngZone.run(() => {
        const currentUserId = this.state.currentUserId();
        const activeGroupId = this.chatState.selectedGroup()?.id;
        const groupId = msg.groupId;
        const senderId = msg.sender?.id;
        if (Number(senderId) === currentUserId) return;
        if (Number(groupId) !== Number(activeGroupId)) {
          this.chatState.incrementUnread('group-' + groupId);
          this._updateTabTitle();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
    this.dmMsgSub?.unsubscribe();
    this.groupMsgSub?.unsubscribe();
    this.ws.disconnect();
  }

  onNotificationClick(): void {
    this.state.showNotificationDropdown.set(false);
    this.state.clearNotificationCount();
    this.router.navigate(['/dashboard/friends']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private _updateTabTitle(): void {
    const total = this.chatState.totalUnread();
    document.title = total > 0 ? `(${total}) Allies` : 'Allies';
  }
}