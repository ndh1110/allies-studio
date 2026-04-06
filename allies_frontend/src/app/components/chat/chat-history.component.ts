import {
  Component, ElementRef, ViewChild, inject, effect,
  OnInit, OnDestroy, AfterViewChecked, NgZone, signal
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChatStateService } from '../../services/chat-state.service';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { WebRtcService } from '../../services/webrtc.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chat-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      @if (chatState.chatMode() === 'dm' && chatState.selectedContact()) {

        <!-- DM Chat Header -->
        <div class="chat-header">
          <div class="header-info">
            <button class="mobile-back-btn" (click)="clearSelection()" title="Back to list">
              <span class="material-icons">arrow_back</span>
            </button>
            <div class="avatar">{{ getInitials(chatState.selectedContact()?.username || '') }}</div>
            <div>
              <h3>{{ chatState.selectedContact()?.username }}</h3>
              <p class="status">Online</p>
            </div>
          </div>

          <!-- ── Voice & Video Call Buttons ──────────────────────────────────────
               Calls WebRtcService directly.
               The overlay UI is rendered by <app-video-call> in DashboardComponent.
          ─────────────────────────────────────────────────────────────────── -->
          <div class="header-actions">
            <button
              class="call-btn"
              title="Start voice call with {{ chatState.selectedContact()?.username }}"
              (click)="startVoiceCall()"
            >
              <span class="material-icons">phone</span>
            </button>
            <button
              class="call-btn"
              title="Start video call with {{ chatState.selectedContact()?.username }}"
              (click)="startVideoCall()"
            >
              <span class="material-icons">videocam</span>
            </button>
          </div>
        </div>

        <!-- DM Messages Area -->
        <div class="messages-area" #messagesContainer (scroll)="onScroll($event)">

          <!-- Loading spinner — shown while fetching older messages -->
          @if (isLoadingMore()) {
            <div class="load-more-spinner">
              <div class="spinner"></div>
              <span>Loading older messages…</span>
            </div>
          }

          <!-- "No more messages" banner -->
          @if (!hasMore() && chatState.messages().length > 0) {
            <div class="no-more-banner">Beginning of conversation</div>
          }

          @for (message of chatState.messages(); track message.id) {
            <div class="message-row" [class.is-mine]="isCurrentUser(message.maTkA?.id)">
              <div class="message-bubble">
                <p>{{ message.noiDung }}</p>
                <div class="message-meta">
                  <span class="timestamp">{{ message.thoiGian | date:'shortTime' }}</span>
                  @if (isCurrentUser(message.maTkA?.id)) {
                    <span class="msg-status" [class.seen]="message.trangThai === 'seen'">
                      @if (message.trangThai === 'seen') { ✓✓ } @else { ✓ }
                    </span>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Invisible anchor — always at the very bottom -->
          <div #scrollAnchor></div>
        </div>

        <!-- DM Input Area -->
        <div class="input-area">
          <form (ngSubmit)="sendMessage()">
            <input
              type="text"
              [(ngModel)]="newMessage"
              name="message"
              placeholder="Type a message..."
              autocomplete="off"
            />
            <button type="submit" [disabled]="!newMessage.trim()">
              <span class="material-icons" style="font-size:20px;">send</span>
            </button>
          </form>
        </div>

      } @else if (chatState.chatMode() === 'group' && chatState.selectedGroup()) {

        <!-- Group Chat Header -->
        <div class="chat-header group-header">
          <div class="header-info">
            <button class="mobile-back-btn" (click)="clearSelection()" title="Back to list">
              <span class="material-icons">arrow_back</span>
            </button>
            <div class="avatar group-avatar">
              <span class="material-icons" style="font-size:22px;">groups</span>
            </div>
            <div>
              <h3>{{ chatState.selectedGroup()?.tenNhom }}</h3>
              <p class="status member-count">{{ chatState.selectedGroup()?.members?.length || 0 }} members</p>
            </div>
          </div>
        </div>

        <!-- Group Messages Area -->
        <div class="messages-area" #messagesContainer>
          @for (message of chatState.groupMessages(); track message.id) {
            <div class="message-row" [class.is-mine]="isCurrentUser(message.sender?.id)">
              <div class="message-bubble">
                @if (!isCurrentUser(message.sender?.id)) {
                  <span class="sender-name">{{ message.sender?.username }}</span>
                }
                <p>{{ message.noiDung }}</p>
                <div class="message-meta">
                  <span class="timestamp">{{ message.thoiGian | date:'shortTime' }}</span>
                </div>
              </div>
            </div>
          }
          <div #scrollAnchor></div>
        </div>

        <!-- Group Input Area -->
        <div class="input-area">
          <form (ngSubmit)="sendGroupMessage()">
            <input
              type="text"
              [(ngModel)]="newGroupMessage"
              name="groupMessage"
              placeholder="Type a message..."
              autocomplete="off"
            />
            <button type="submit" [disabled]="!newGroupMessage.trim()">
              <span class="material-icons" style="font-size:20px;">send</span>
            </button>
          </form>
        </div>

      } @else {
        <div class="empty-state">
          <span class="material-icons" style="font-size:4rem; color:#d1d5db; margin-bottom:1rem;">chat_bubble_outline</span>
          <h3>Your Messages</h3>
          <p>Select a friend or group to start chatting.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .chat-container { display: flex; flex-direction: column; height: 100%; background: #f9fafb; width: 100%; min-width: 0; }
    .chat-header { height: 64px; padding: 0 1.5rem; border-bottom: 1px solid #e5e7eb; background: white; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .header-info { display: flex; align-items: center; }
    .header-info h3 { margin: 0; font-size: 1rem; color: #111827; }
    .status { margin: 0; font-size: 0.75rem; color: #10b981; }
    .member-count { color: #6b7280; }
    .avatar { width: 40px; height: 40px; background: #c7d2fe; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 1rem; }
    .group-avatar { background: #e0e7ff; color: #4338ca; }

    /* ── Video call button in header ───────────────────────────────────────── */
    .header-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .call-btn {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%; border: none; cursor: pointer;
      background: #eef2ff; color: #4f46e5;
      transition: background 0.15s, color 0.15s;
    }
    .call-btn:hover { background: #4f46e5; color: white; }
    .call-btn .material-icons { font-size: 1.15rem; }

    .mobile-back-btn {
      display: none;
      background: none; border: none; cursor: pointer; padding: 4px; margin-right: 8px;
      color: #6b7280; align-items: center; justify-content: center;
    }
    .mobile-back-btn:hover { color: #4f46e5; }
    
    @media (max-width: 768px) {
      .mobile-back-btn { display: flex; }
      .avatar { margin-right: 0.5rem; }
    }

    /* ── Messages Area ─────────────────────────────────────────────────────── */
    .messages-area {
      flex: 1; overflow-y: auto; padding: 1.5rem;
      display: flex; flex-direction: column; gap: 0.75rem;
      /* smooth scroll only on new-message auto-scroll, not on infinite scroll load */
      scroll-behavior: auto;
    }

    /* ── Infinite scroll feedback ─────────────────────────────────────────── */
    .load-more-spinner {
      display: flex; align-items: center; justify-content: center;
      gap: 8px; padding: 8px 0;
      font-size: 0.75rem; color: #9ca3af;
    }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid #e5e7eb;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .no-more-banner {
      text-align: center; font-size: 0.75rem; color: #9ca3af;
      padding: 4px 0 8px;
    }

    /* ── Message Bubbles ─────────────────────────────────────────────────── */
    .message-row { display: flex; width: 100%; }
    .message-row.is-mine { justify-content: flex-end; }
    .message-bubble { max-width: 70%; padding: 0.75rem 1rem; border-radius: 16px; background: white; border: 1px solid #e5e7eb; color: #1f2937; }
    .message-row.is-mine .message-bubble { background: #4f46e5; color: white; border-color: #4f46e5; border-bottom-right-radius: 4px; }
    .message-row:not(.is-mine) .message-bubble { border-bottom-left-radius: 4px; }
    .message-bubble p { margin: 0; font-size: 0.95rem; line-height: 1.4; }
    .sender-name { display: block; font-size: 0.7rem; font-weight: 700; color: #4f46e5; margin-bottom: 2px; }
    .message-meta { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 0.25rem; }
    .timestamp { font-size: 0.7rem; opacity: 0.7; }
    .msg-status { font-size: 0.7rem; opacity: 0.6; font-weight: bold; }
    .msg-status.seen { color: #60a5fa; opacity: 1; }
    .message-row.is-mine .msg-status { color: rgba(255,255,255,0.6); }
    .message-row.is-mine .msg-status.seen { color: #93c5fd; opacity: 1; }

    /* ── Input Area ──────────────────────────────────────────────────────── */
    .input-area { padding: 1rem; background: white; border-top: 1px solid #e5e7eb; flex-shrink: 0; }
    .input-area form { display: flex; gap: 0.5rem; }
    .input-area input { flex: 1; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 24px; outline: none; font-size: 0.9rem; }
    .input-area input:focus { border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
    .input-area button { width: 42px; height: 42px; background: #4f46e5; color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
    .input-area button:hover:not(:disabled) { background: #4338ca; }

    /* ── Empty State ─────────────────────────────────────────────────────── */
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; color: #6b7280; }
    .empty-state h3 { margin: 0 0 0.25rem 0; font-size: 1.25rem; color: #374151; }
    .empty-state p { margin: 0; font-size: 0.9rem; }
  `]
})
export class ChatHistoryComponent implements OnInit, OnDestroy {
  // The single container that holds all messages — used for scroll manipulation
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLElement>;
  // Invisible sentinel at the bottom — scrollIntoView() auto-scrolls here
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef<HTMLElement>;

  chatState = inject(ChatStateService);
  authService = inject(AuthService);
  http = inject(HttpClient);
  webSocketService = inject(WebSocketService);
  webRtcService = inject(WebRtcService);
  ngZone = inject(NgZone);

  newMessage = '';
  newGroupMessage = '';

  // ── Pagination state ─────────────────────────────────────────────────────
  isLoadingMore = signal(false);  // shown as a spinner at the top
  hasMore = signal(true);         // false → no older messages exist
  private currentPage = 0;        // next page to request
  private activeContactId: any = null;

  // ── Scroll control flags ──────────────────────────────────────────────────
  /** When true, ngAfterViewInit/ngAfterContentChecked should scroll to bottom */
  private scrollToBottomPending = false;
  /** Prevent triggering infinite scroll while we are already fetching */
  private isFetchingPage = false;

  private readonly PAGE_SIZE = 20;
  private readonly base = environment.apiUrl + '/chat';
  private readonly groupBase = environment.apiUrl + '/groups';
  private messageSub: Subscription | null = null;
  private groupMsgSub: Subscription | null = null;

  constructor() {
    // React to contact selection — reset pagination and load first page
    effect(() => {
      const contact = this.chatState.selectedContact();
      if (contact) {
        this.resetPaginationState();
        this.activeContactId = contact.id;
        this.loadPage(0, /* scrollToBottom */ true);
      }
    }, { allowSignalWrites: true });

    // React to group selection — full load (groups don't paginate yet)
    effect(() => {
      const group = this.chatState.selectedGroup();
      if (group) {
        this.loadGroupHistory(group.id);
      }
    }, { allowSignalWrites: true });

    // Auto-scroll when new WS messages arrive — plain flag write, no signal write
    effect(() => {
      const dmMsgs = this.chatState.messages();
      const grpMsgs = this.chatState.groupMessages();
      this.scrollToBottomPending = true;
    });
  }

  ngOnInit(): void {
    // Listen for DM messages — display only for the active conversation
    this.messageSub = this.webSocketService.messages$.subscribe(msg => {
      this.ngZone.run(() => {
        if (!msg) return;
        const activeContactId = this.chatState.selectedContact()?.id;
        const currentUserId = Number(localStorage.getItem('userId'));
        const participantA = msg.maTkA?.id ?? msg.maTkA?.maTk;
        const participantB = msg.maTkB?.id ?? msg.maTkB?.maTk;
        if (
          (participantA === currentUserId && participantB === activeContactId) ||
          (participantA === activeContactId && participantB === currentUserId)
        ) {
          this.chatState.addMessage(msg);
          // New real-time message → scroll to bottom
          this.scheduleScrollToBottom();
        }
      });
    });

    // Listen for group messages — display only for the active group
    this.groupMsgSub = this.webSocketService.groupMessages$.subscribe(msg => {
      this.ngZone.run(() => {
        if (!msg) return;
        const activeGroup = this.chatState.selectedGroup();
        if (activeGroup && Number(msg.groupId) === Number(activeGroup.id)) {
          this.chatState.addGroupMessage(msg);
          this.scheduleScrollToBottom();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.messageSub?.unsubscribe();
    this.groupMsgSub?.unsubscribe();
  }

  clearSelection(): void {
    this.chatState.selectedContact.set(null);
    this.chatState.selectedGroup.set(null);
  }

  /**
   * Triggered by the 📹 button in the DM chat header.
   */
  startVideoCall(): void {
    const target = this.chatState.selectedContact()?.username;
    if (!target) return;
    this.webRtcService.startCall(target, true); // true = video
  }

  /**
   * Triggered by the 📞 button in the DM chat header.
   */
  startVoiceCall(): void {
    const target = this.chatState.selectedContact()?.username;
    if (!target) return;
    this.webRtcService.startCall(target, false); // false = voice only
  }

  // ── Scroll to bottom ───────────────────────────────────────────────────────

  private scheduleScrollToBottom(): void {
    // Use requestAnimationFrame so the DOM has been updated before we scroll
    requestAnimationFrame(() => {
      this.scrollToBottom();
    });
  }

  private scrollToBottom(smooth = false): void {
    try {
      const anchor = this.scrollAnchor?.nativeElement;
      if (anchor) {
        anchor.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      }
    } catch (_) {}
  }

  // ── Infinite scroll (scroll-up listener) ──────────────────────────────────

  onScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const isAtTop = container.scrollTop < 80; // trigger zone: 80px from top

    if (isAtTop && this.hasMore() && !this.isFetchingPage) {
      const nextPage = this.currentPage + 1;
      this.loadPage(nextPage, /* scrollToBottom */ false);
    }
  }

  // ── Data loading ───────────────────────────────────────────────────────────

  private resetPaginationState(): void {
    this.currentPage = 0;
    this.hasMore.set(true);
    this.isFetchingPage = false;
    this.chatState.setMessages([]);
  }

  /**
   * Load one page of messages.
   * page=0  → most recent 20 (scrolls to bottom when done)
   * page>0  → older 20 (preserves scroll position)
   */
  async loadPage(page: number, scrollToBottom: boolean): Promise<void> {
    if (this.isFetchingPage) return;
    this.isFetchingPage = true;

    const currentId = localStorage.getItem('userId');
    const contactId = this.activeContactId ?? this.chatState.selectedContact()?.id;
    const token = localStorage.getItem('token');

    if (!contactId) { this.isFetchingPage = false; return; }

    if (page > 0) {
      this.isLoadingMore.set(true);
    }

    try {
      const res = await this.http.get<any>(
        `${this.base}/messages/${currentId}/${contactId}/paged`,
        {
          params: { page: String(page), size: String(this.PAGE_SIZE) },
          headers: { Authorization: `Bearer ${token}` }
        }
      ).toPromise();

      const newMessages: any[] = res?.messages ?? [];
      const moreAvailable: boolean = res?.hasMore ?? false;

      this.hasMore.set(moreAvailable);
      this.currentPage = page;

      if (page === 0) {
        // First load — replace the list and scroll to bottom
        this.chatState.setMessages(newMessages);
        await this.chatState.resetUnread('dm-' + contactId);
        await this.markAsSeen(Number(contactId), Number(currentId));
        // Scroll to bottom after DOM update
        requestAnimationFrame(() => this.scrollToBottom());
      } else {
        // Infinite scroll — PREPEND older messages while preserving scroll pos
        const container = this.messagesContainer?.nativeElement;
        const scrollHeightBefore = container?.scrollHeight ?? 0;
        const scrollTopBefore = container?.scrollTop ?? 0;

        // Immutable prepend
        this.chatState.messages.update(existing => [...newMessages, ...existing]);

        // Restore scroll position after Angular re-renders the new items
        requestAnimationFrame(() => {
          if (container) {
            const scrollHeightAfter = container.scrollHeight;
            container.scrollTop = scrollTopBefore + (scrollHeightAfter - scrollHeightBefore);
          }
        });
      }
    } catch (e) {
      console.error('Failed to load message page', e);
    } finally {
      this.isFetchingPage = false;
      this.isLoadingMore.set(false);
    }
  }

  async markAsSeen(senderId: number, receiverId: number): Promise<void> {
    const token = localStorage.getItem('token');
    try {
      await this.http.put(`${this.base}/seen/${senderId}/${receiverId}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      this.chatState.messages.update(msgs =>
        msgs.map(m => {
          if (m.maTkA?.id === senderId && m.maTkB?.id === receiverId && m.trangThai !== 'seen') {
            return { ...m, trangThai: 'seen' };
          }
          return m;
        })
      );
    } catch (e) {
      console.error('Failed to mark as seen', e);
    }
  }

  // ── Group methods ─────────────────────────────────────────────────────────

  async loadGroupHistory(groupId: number): Promise<void> {
    const token = localStorage.getItem('token');
    try {
      const msgs = await this.http.get<any[]>(
        `${this.groupBase}/${groupId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();
      this.chatState.setGroupMessages(msgs || []);
      this.chatState.resetUnread('group-' + groupId);
      requestAnimationFrame(() => this.scrollToBottom());
    } catch (e) {
      console.error('Failed to load group history', e);
    }
  }

  async sendGroupMessage(): Promise<void> {
    if (!this.newGroupMessage.trim()) return;
    const group = this.chatState.selectedGroup();
    const currentId = Number(localStorage.getItem('userId'));
    if (!group || !currentId) return;

    const token = localStorage.getItem('token');
    try {
      const saved = await this.http.post<any>(
        `${this.groupBase}/${group.id}/messages`,
        { senderId: currentId, noiDung: this.newGroupMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      this.chatState.addGroupMessage(saved);
      this.newGroupMessage = '';
      this.scheduleScrollToBottom();
    } catch (e) {
      console.error('Failed to send group message', e);
    }
  }

  // ── DM send ───────────────────────────────────────────────────────────────

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    const contact = this.chatState.selectedContact();
    const currentId = Number(localStorage.getItem('userId'));
    if (!contact || !currentId) return;

    const payload = {
      maTkA: { maTk: currentId },
      maTkB: { maTk: contact.id },
      noiDung: this.newMessage.trim()
    };

    this.webSocketService.sendMessage(payload);
    this.newMessage = '';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  isCurrentUser(senderId: any): boolean {
    if (!senderId) return false;
    return Number(localStorage.getItem('userId')) === Number(senderId);
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.slice(0, 2).toUpperCase();
  }
}
