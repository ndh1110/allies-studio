import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, Subscription } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../environments/environment';

declare var SockJS: any;
declare var Stomp: any;

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: any;

  // --- Connection State ---
  private connectionState$ = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.connectionState$.asObservable();

  // --- Message Streams ---
  private messagesSubject = new BehaviorSubject<any | null>(null);
  public messages$ = this.messagesSubject.asObservable();

  private groupMessagesSubject = new BehaviorSubject<any | null>(null);
  public groupMessages$ = this.groupMessagesSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<any | null>(null);
  public notifications$ = this.notificationsSubject.asObservable();

  private callSubject = new BehaviorSubject<any>(null);
  public callEvents$ = this.callSubject.asObservable();

  // --- Dynamic Group Subscription Orchestration ---
  // This is the KEY: a BehaviorSubject holding the list of group IDs to subscribe to.
  private pendingGroupIds$ = new BehaviorSubject<number[]>([]);
  private groupSubscriptions = new Map<number, any>();
  private groupOrchestrationSub: Subscription | null = null;

  constructor(private ngZone: NgZone) { }

  /**
   * Call connect() ONCE from the root of your app (e.g., AppComponent or after login).
   * It is idempotent — safe to call multiple times.
   */
  connect(): void {
    if (this.connectionState$.value || this.stompClient?.connected) return;

    console.log('[WS] Connecting...');
    const socket = new SockJS(environment.wsUrl);
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = null; // Suppress STOMP frame noise

    // Pass JWT in CONNECT frame so the backend ChannelInterceptor can
    // identify this WebSocket session and route convertAndSendToUser() correctly.
    const token = localStorage.getItem('token');
    const connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    this.stompClient.connect(
      connectHeaders,

      (frame: any) => {
        console.log('[WS] Connected:', frame);
        this.ngZone.run(() => {
          this.connectionState$.next(true);
          this._setupStaticSubscriptions();
          this._startGroupOrchestration();
        });
      },
      (error: any) => {
        console.error('[WS] Connection Error:', error);
        this.ngZone.run(() => {
          this.connectionState$.next(false);
        });
        // Auto-reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      }
    );
  }

  disconnect(): void {
    if (this.groupOrchestrationSub) {
      this.groupOrchestrationSub.unsubscribe();
      this.groupOrchestrationSub = null;
    }
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('[WS] Disconnected.');
      });
      this.stompClient = null;
    }
    this.connectionState$.next(false);
    this.groupSubscriptions.clear();
  }

  /**
   * Call this after fetching the user's group list from the API.
   * This is the TRIGGER that solves the race condition:
   * The orchestration logic will subscribe to all new groups as soon as both
   * (A) the connection is live and (B) this list is updated.
   */
  setUserGroups(groups: any[]): void {
    const ids = groups.map((g) => Number(g.id));
    console.log('[WS] Group list received, queuing subscriptions for IDs:', ids);
    this.pendingGroupIds$.next(ids);
  }

  /**
   * Subscribe a single user to their private queues (DMs, notifications, calls).
   * Call after connect(), once you have the username.
   */
  subscribeToUserQueue(username: string): void {
    this._whenConnected(() => {
      console.log(`[WS] Subscribing to private queues for user: ${username}`);

      // CORRECT Spring user-destination pattern: subscribe WITHOUT the username.
      // Spring's UserDestinationMessageHandler resolves /user/queue/messages to
      // this session's authenticated Principal automatically.
      // Do NOT use /user/${username}/queue/messages — that registers a different path
      // that convertAndSendToUser() cannot find.
      this.stompClient.subscribe(`/user/queue/messages`, (message: any) => {
        this.ngZone.run(() => {
          const msg = JSON.parse(message.body);
          console.log('[WS] DM received:', msg);
          this.messagesSubject.next(msg);
        });
      });

      this.stompClient.subscribe(`/user/queue/notifications`, (message: any) => {
        this.ngZone.run(() => {
          const notification = JSON.parse(message.body);
          console.log('[WS] Notification received:', notification);
          this.notificationsSubject.next(notification);
        });
      });

      this.stompClient.subscribe(`/user/queue/call`, (message: any) => {
        this.ngZone.run(() => {
          const callEvent = JSON.parse(message.body);
          console.log('[WS] Call event received:', callEvent);
          this.callSubject.next(callEvent);
        });
      });
    });
  }

  sendMessage(message: any): void {
    this._whenConnected(() => {
      this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(message));
    });
  }

  addUser(username: string): void {
    this._whenConnected(() => {
      this.stompClient.send('/app/chat.addUser', {}, username);
    });
  }

  // --- Khôi phục các hàm Video Call bị thiếu ---
  initiateCall(callData: any): void {
    this._whenConnected(() => {
      this.stompClient.send('/app/call.initiate', {}, JSON.stringify(callData));
    });
  }

  answerCall(answer: any): void {
    this._whenConnected(() => {
      this.stompClient.send('/app/call.answer', {}, JSON.stringify(answer));
    });
  }

  /**
   * Send a WebRTC signaling message (offer, answer, ICE candidate, call_end…)
   * to the backend. The backend routes it to the target user's /user/queue/call.
   */
  sendSignal(signal: any): void {
    this._whenConnected(() => {
      console.log('[WS] Sending WebRTC signal:', signal.type, '→', signal.to);
      this.stompClient.send('/app/webrtc.signal', {}, JSON.stringify(signal));
    });
  }

  get isConnected(): boolean {
    return this.connectionState$.value;
  }

  // =====================================================================
  // PRIVATE HELPERS
  // =====================================================================

  /**
   * Execute a callback as soon as the STOMP connection is live.
   * If already connected, fires immediately (synchronously).
   * If not yet connected, waits for the next `true` emission.
   */
  private _whenConnected(callback: () => void): void {
    if (this.connectionState$.value) {
      callback();
    } else {
      const sub = this.connectionState$.pipe(
        filter((connected) => connected)
      ).subscribe(() => {
        sub.unsubscribe();
        callback();
      });
    }
  }

  /** Subscribe to topics that are always needed (public channel). */
  private _setupStaticSubscriptions(): void {
    this.stompClient.subscribe('/topic/public', (message: any) => {
      this.ngZone.run(() => {
        this.messagesSubject.next(JSON.parse(message.body));
      });
    });
  }

  /**
   * THE RACE-CONDITION FIX:
   * Uses combineLatest to merge the connection state and the pending group IDs.
   * Only when BOTH are ready (connected=true AND groups list is non-empty) does
   * it iterate and subscribe to each group topic. The `distinctUntilChanged`
   * on the group IDs prevents re-subscribing on unrelated emissions.
   */
  private _startGroupOrchestration(): void {
    if (this.groupOrchestrationSub) return; // Already running

    this.groupOrchestrationSub = combineLatest([
      this.connectionState$.pipe(filter((c) => c === true)),
      this.pendingGroupIds$.pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))),
    ]).subscribe(([_connected, groupIds]) => {
      console.log('[WS] Orchestrator: Processing group subscriptions for IDs:', groupIds);
      groupIds.forEach((id) => {
        if (!this.groupSubscriptions.has(id)) {
          console.log(`[WS] Subscribing to /topic/group/${id}`);
          const sub = this.stompClient.subscribe(`/topic/group/${id}`, (message: any) => {
            this.ngZone.run(() => {
              const groupMsg = JSON.parse(message.body);
              console.log('[WS] Group message received:', groupMsg);
              this.groupMessagesSubject.next(groupMsg);
            });
          });
          this.groupSubscriptions.set(id, sub);
          console.log(`[WS] ✅ Successfully subscribed to /topic/group/${id}`);
        }
      });
    });
  }
}
