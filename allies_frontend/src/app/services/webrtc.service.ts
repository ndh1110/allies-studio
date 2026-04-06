import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { WebSocketService } from './websocket.service';

// ──────────────────────────────────────────────────────────────────────────────
// Signaling message shapes (must match the Java DTOs sent by the backend)
// ──────────────────────────────────────────────────────────────────────────────
export interface SignalMessage {
  type: 'offer' | 'answer' | 'candidate' | 'call_end' | 'call_busy';
  from: string;         // sender's username
  to: string;           // recipient's username
  isVideo?: boolean;    // true = video+audio call, false = audio-only voice call
  sdp?: string;         // RTCSessionDescription.sdp  (offer / answer)
  sdpType?: RTCSdpType; // 'offer' | 'answer'
  candidate?: string;   // RTCIceCandidate.candidate
  sdpMid?: string;
  sdpMLineIndex?: number | null;
}

export type CallState =
  | 'idle'
  | 'calling'      // we placed a call, waiting for callee to accept
  | 'receiving'    // we received an incoming call ring
  | 'connecting'   // ICE / SDP negotiation in progress
  | 'connected'    // media is flowing
  | 'ended';

// ──────────────────────────────────────────────────────────────────────────────
// STUN server configuration
// Google's free, publicly available STUN server – works on every LAN + internet
// ──────────────────────────────────────────────────────────────────────────────
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

@Injectable({ providedIn: 'root' })
export class WebRtcService implements OnDestroy {

  // ── Public state ─────────────────────────────────────────────────────────
  public callState$ = new BehaviorSubject<CallState>('idle');
  public localStream$ = new BehaviorSubject<MediaStream | null>(null);
  public remoteStream$ = new BehaviorSubject<MediaStream | null>(null);

  /** Who we are calling / who is calling us */
  public remotePeer$ = new BehaviorSubject<string | null>(null);

  /**
   * Whether the current / incoming call is a VIDEO call (true) or VOICE-only (false).
   * The UI subscribes to this to show/hide the video elements.
   */
  public isVideoCall$ = new BehaviorSubject<boolean>(true);

  // ── Private fields ────────────────────────────────────────────────────────
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private myUsername: string = '';

  /** Track the call-events subscription so we can clean up */
  private callEventSub: Subscription | null = null;

  constructor(
    private wsService: WebSocketService,
    private ngZone: NgZone,
  ) {
    // Wire up the shared /user/queue/call stream from WebSocketService.
    // All signaling messages (offer, answer, candidate, call_end …) arrive here.
    this.callEventSub = this.wsService.callEvents$
      .pipe(filter((msg) => msg !== null))
      .subscribe((msg: SignalMessage) => {
        this.ngZone.run(() => this._handleSignalMessage(msg));
      });
  }

  ngOnDestroy(): void {
    this.callEventSub?.unsubscribe();
    this.hangUp();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PUBLIC API – called by your UI components
  // ════════════════════════════════════════════════════════════════════════════

  /** Must be called once after login so the service knows who "we" are. */
  setMyUsername(username: string): void {
    this.myUsername = username;
  }

  /**
   * CALLER side – start a call with `targetUsername`.
   *
   * @param targetUsername  Username of the person to call.
   * @param isVideo         true (default) = video+audio, false = audio-only voice call.
   *
   * Steps:
   *  1. Get camera + mic  (getUserMedia respects isVideo flag)
   *  2. Create RTCPeerConnection with STUN servers
   *  3. Attach local tracks
   *  4. Create SDP Offer with isVideo flag embedded → send to backend /app/webrtc.signal
   */
  async startCall(targetUsername: string, isVideo: boolean = true): Promise<void> {
    if (this.callState$.value !== 'idle') {
      console.warn('[WebRTC] Already in a call – ignoring startCall()');
      return;
    }

    console.log(`[WebRTC] Starting ${isVideo ? 'video' : 'voice'} call to ${targetUsername}`);
    this.isVideoCall$.next(isVideo);
    this.remotePeer$.next(targetUsername);
    this.callState$.next('calling');

    try {
      await this._acquireLocalMedia(isVideo);
      this._createPeerConnection();

      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      const signal: SignalMessage = {
        type: 'offer',
        from: this.myUsername,
        to: targetUsername,
        isVideo,          // ← callee reads this to know what type of call is incoming
        sdp: offer.sdp,
        sdpType: offer.type,
      };

      this.wsService.sendSignal(signal);
      this.callState$.next('connecting');
    } catch (err) {
      console.error('[WebRTC] Error starting call:', err);
      this._cleanup();
    }
  }

  /**
   * CALLEE side – accept an incoming offer.
   * Mirrors the caller's isVideo flag so both sides use the same media mode.
   */
  async acceptCall(offerSignal: SignalMessage): Promise<void> {
    if (this.callState$.value !== 'receiving') {
      console.warn('[WebRTC] Not in receiving state – ignoring acceptCall()');
      return;
    }

    const isVideo = offerSignal.isVideo ?? true; // default to video if flag missing
    console.log(`[WebRTC] Accepting ${isVideo ? 'video' : 'voice'} call from ${offerSignal.from}`);
    this.isVideoCall$.next(isVideo);
    this.remotePeer$.next(offerSignal.from);

    try {
      await this._acquireLocalMedia(isVideo);
      this._createPeerConnection();

      const remoteDesc = new RTCSessionDescription({
        type: offerSignal.sdpType!,
        sdp: offerSignal.sdp!,
      });
      await this.peerConnection!.setRemoteDescription(remoteDesc);

      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);

      const signal: SignalMessage = {
        type: 'answer',
        from: this.myUsername,
        to: offerSignal.from,
        isVideo,
        sdp: answer.sdp,
        sdpType: answer.type,
      };

      this.wsService.sendSignal(signal);
      this.callState$.next('connecting');
    } catch (err) {
      console.error('[WebRTC] Error accepting call:', err);
      this._cleanup();
    }
  }

  /**
   * CALLEE side – decline an incoming call by sending a busy / reject signal.
   */
  declineCall(callerUsername: string): void {
    const signal: SignalMessage = {
      type: 'call_busy',
      from: this.myUsername,
      to: callerUsername,
    };
    this.wsService.sendSignal(signal);
    this._cleanup();
  }

  /**
   * Either side – hang up / end the active call.
   */
  hangUp(): void {
    const peer = this.remotePeer$.value;
    if (peer) {
      const signal: SignalMessage = {
        type: 'call_end',
        from: this.myUsername,
        to: peer,
      };
      this.wsService.sendSignal(signal);
    }
    this._cleanup();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRIVATE – Signaling message handler (dispatch incoming messages)
  // ════════════════════════════════════════════════════════════════════════════

  private _handleSignalMessage(msg: SignalMessage): void {
    console.log('[WebRTC] Signal received:', msg.type, msg);

    switch (msg.type) {
      // ── A. Incoming call from someone else ──────────────────────────────
      case 'offer':
        if (this.callState$.value !== 'idle') {
          // We're busy – send back a busy signal automatically
          this.declineCall(msg.from);
          return;
        }
        // Store isVideo from the offer so the UI shows the right modal text
        this.isVideoCall$.next(msg.isVideo ?? true);
        this.remotePeer$.next(msg.from);
        this._pendingOffer = msg;
        this.callState$.next('receiving');
        break;

      // ── B. Callee accepted → set remote description ──────────────────
      case 'answer':
        this._handleAnswer(msg);
        break;

      // ── C. ICE candidate from remote peer ────────────────────────────
      case 'candidate':
        this._handleRemoteIceCandidate(msg);
        break;

      // ── D. Remote peer ended or declined the call ────────────────────
      case 'call_end':
      case 'call_busy':
        console.log('[WebRTC] Remote ended / declined the call.');
        this._cleanup();
        break;

      default:
        console.warn('[WebRTC] Unknown signal type:', (msg as any).type);
    }
  }

  /** Holds the incoming offer until the user taps "Accept". */
  private _pendingOffer: SignalMessage | null = null;

  /** Exposes the pending offer so a component's "Accept" button can access it. */
  getPendingOffer(): SignalMessage | null {
    return this._pendingOffer;
  }

  private async _handleAnswer(msg: SignalMessage): Promise<void> {
    if (!this.peerConnection) return;
    try {
      const remoteDesc = new RTCSessionDescription({
        type: msg.sdpType!,
        sdp: msg.sdp!,
      });
      await this.peerConnection.setRemoteDescription(remoteDesc);
      console.log('[WebRTC] Remote answer set – ICE negotiation running…');
    } catch (err) {
      console.error('[WebRTC] Error setting remote description:', err);
    }
  }

  private async _handleRemoteIceCandidate(msg: SignalMessage): Promise<void> {
    if (!this.peerConnection) return;
    try {
      const candidate = new RTCIceCandidate({
        candidate: msg.candidate,
        sdpMid: msg.sdpMid ?? undefined,
        sdpMLineIndex: msg.sdpMLineIndex ?? undefined,
      });
      await this.peerConnection.addIceCandidate(candidate);
    } catch (err) {
      console.error('[WebRTC] Error adding ICE candidate:', err);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRIVATE – Setup helpers
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Request camera + microphone access from the browser.
   * For voice-only calls, video is disabled so the browser doesn't ask for camera.
   */
  private async _acquireLocalMedia(isVideo: boolean = true): Promise<void> {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: isVideo,
      audio: true,
    });
    this.localStream$.next(this.localStream);
    console.log(`[WebRTC] Local media acquired (video=${isVideo}).`);
  }

  /** Create RTCPeerConnection and wire up all the event handlers. */
  private _createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

    // ── Attach local tracks so the remote peer receives our A/V ──────────
    this.localStream!.getTracks().forEach((track) => {
      this.peerConnection!.addTrack(track, this.localStream!);
    });

    // ── When a remote track arrives, expose it via remoteStream$ ──────────
    this.peerConnection.ontrack = (event) => {
      this.ngZone.run(() => {
        console.log('[WebRTC] Remote track received.');
        // event.streams[0] is the combined remote MediaStream
        this.remoteStream$.next(event.streams[0]);
        this.callState$.next('connected');
      });
    };

    // ── Send each ICE candidate to the remote peer via STOMP ─────────────
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const signal: SignalMessage = {
          type: 'candidate',
          from: this.myUsername,
          to: this.remotePeer$.value!,
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid ?? undefined,
          sdpMLineIndex: event.candidate.sdpMLineIndex ?? undefined,
        };
        this.wsService.sendSignal(signal);
      }
    };

    // ── Connection state monitoring ───────────────────────────────────────
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('[WebRTC] Connection state:', state);
      this.ngZone.run(() => {
        if (state === 'connected') this.callState$.next('connected');
        if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          this._cleanup();
        }
      });
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE state:', this.peerConnection?.iceConnectionState);
    };
  }

  /** Stop all media tracks, close the peer connection, reset state. */
  private _cleanup(): void {
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this.peerConnection?.close();
    this.peerConnection = null;
    this._pendingOffer = null;

    this.ngZone.run(() => {
      this.localStream$.next(null);
      this.remoteStream$.next(null);
      this.remotePeer$.next(null);
      this.callState$.next('ended');
      // Auto-reset to idle after a brief moment so the UI can show "call ended"
      setTimeout(() => {
        this.callState$.next('idle');
        this.isVideoCall$.next(true); // reset to default for next call
      }, 2000);
    });
  }
}
