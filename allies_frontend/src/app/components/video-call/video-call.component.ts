import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  signal,
  computed,
  effect,
  ElementRef,
  ViewChild,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { WebRtcService, CallState, SignalMessage } from '../../services/webrtc.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- ════════════════════════════════════════════════════════════════════
         ACTIVE CALL SCREEN
         Shown when callState is 'calling' | 'connecting' | 'connected'
    ═══════════════════════════════════════════════════════════════════════ -->
    <div class="fixed inset-0 bg-black z-50" *ngIf="isCallActive()">
      <div class="flex h-full">

        <!-- ── VIDEO CALL layout ──────────────────────────────────────────── -->
        <div [class.hidden]="!isVideoCall()" class="flex-1 relative w-full h-full">
          <!-- Remote Video -->
          <video #remoteVideo class="w-full h-full object-cover"
            autoplay playsinline></video>

          <!-- Local Video PIP -->
          <div class="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden">
            <video #localVideo class="w-full h-full object-cover"
              autoplay playsinline muted></video>
          </div>

          <!-- Peer name + duration overlay -->
          <div class="absolute top-4 left-4 text-white">
            <h3 class="text-xl font-semibold">{{ remotePeerName() || 'Calling...' }}</h3>
            <p class="text-sm opacity-75">{{ getCallDuration() }}</p>
          </div>
        </div>

        <!-- ── VOICE CALL layout ──────────────────────────────────────────── -->
        <div [class.hidden]="isVideoCall()" class="voice-call-screen">
          <div class="voice-avatar-ring">
            <div class="voice-avatar">
              {{ (remotePeerName() || '?').slice(0, 2).toUpperCase() }}
            </div>
          </div>
          <h2 class="voice-peer-name">{{ remotePeerName() || 'Calling...' }}</h2>
          <p class="voice-status">{{ getCallDuration() || 'Connecting...' }}</p>
        </div>

        <!-- ── Controls (shared by both layouts) ─────────────────────────── -->
        <div class="absolute bottom-8 left-half transform translate-x-negative-half flex space-x-4">
          <!-- Mute -->
          <button (click)="toggleMute()"
            class="w-12 h-12 rounded-full flex items-center justify-center"
            [class.bg-gray-600]="!isMuted()"
            [class.bg-red-600]="isMuted()">
            <span class="material-icons text-white">{{ isMuted() ? 'mic_off' : 'mic' }}</span>
          </button>

          <!-- Video toggle — only shown for video calls -->
          <button *ngIf="isVideoCall()" (click)="toggleVideo()"
            class="w-12 h-12 rounded-full flex items-center justify-center"
            [class.bg-gray-600]="!isVideoOff()"
            [class.bg-red-600]="isVideoOff()">
            <span class="material-icons text-white">{{ isVideoOff() ? 'videocam_off' : 'videocam' }}</span>
          </button>

          <!-- End Call -->
          <button (click)="endCall()"
            class="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
            <span class="material-icons text-white">call_end</span>
          </button>
        </div>

      </div>
    </div>
    
    <!-- Incoming Call Modal -->
    <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center" *ngIf="incomingCall()">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div class="text-center">
          <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <!-- Show camera icon for video, phone icon for voice -->
            <span class="material-icons text-white text-3xl">
              {{ isVideoCall() ? 'videocam' : 'phone' }}
            </span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            Incoming {{ isVideoCall() ? 'Video' : 'Voice' }} Call
          </h3>
          <p class="text-gray-600 mb-6">{{ incomingCall()?.from }}</p>

          <div class="flex space-x-4 justify-center">
            <button (click)="answerCall(false)"
              class="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
              <span class="material-icons text-white">call_end</span>
            </button>
            <button (click)="answerCall(true)"
              class="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
              <span class="material-icons text-white">{{ isVideoCall() ? 'videocam' : 'call' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Call Controls in Chat -->
    <div class="flex items-center space-x-2" *ngIf="!isCallActive() && !incomingCall()">
      <button
        (click)="startVideoCall()"
        class="btn btn-primary btn-sm"
        title="Start Video Call"
      >
        <span class="material-icons">videocam</span>
        Video Call
      </button>
      <button
        (click)="startVoiceCall()"
        class="btn btn-secondary btn-sm"
        title="Start Voice Call"
      >
        <span class="material-icons">phone</span>
        Voice Call
      </button>
    </div>
  `,
  styles: [`
    .hidden {
      display: none !important;
    }

    .fixed {
      position: fixed;
    }
    
    .inset-0 {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
    
    .z-50 {
      z-index: 50;
    }
    
    .z-40 {
      z-index: 40;
    }
    
    .flex {
      display: flex;
    }
    
    .flex-1 {
      flex: 1 1 0%;
    }
    
    .h-full {
      height: 100%;
    }
    
    .relative {
      position: relative;
    }
    
    .absolute {
      position: absolute;
    }
    
    .w-full {
      width: 100%;
    }
    
    .h-full {
      height: 100%;
    }
    
    .w-64 {
      width: 16rem;
    }
    
    .h-48 {
      height: 12rem;
    }
    
    .w-12 {
      width: 3rem;
    }
    
    .h-12 {
      height: 3rem;
    }
    
    .w-20 {
      width: 5rem;
    }
    
    .h-20 {
      height: 5rem;
    }
    
    .max-w-md {
      max-width: 28rem;
    }
    
    .mx-4 {
      margin-left: 1rem;
      margin-right: 1rem;
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
    
    .mb-6 {
      margin-bottom: 1.5rem;
    }
    
    .mt-4 {
      margin-top: 1rem;
    }
    
    .top-4 {
      top: 1rem;
    }
    
    .right-4 {
      right: 1rem;
    }
    
    .left-4 {
      left: 1rem;
    }
    
    .bottom-8 {
      bottom: 2rem;
    }
    
    .left-half {
      left: 50%;
    }
    
    .transform {
      transform: translateX(-50%);
    }
    
    .translate-x-negative-half {
      transform: translateX(-50%);
    }
    
    .space-x-4 > * + * {
      margin-left: 1rem;
    }
    
    .space-x-2 > * + * {
      margin-left: 0.5rem;
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
    
    .text-center {
      text-align: center;
    }
    
    .text-white {
      color: white;
    }
    
    .text-gray-900 {
      color: var(--gray-900);
    }
    
    .text-gray-600 {
      color: var(--gray-600);
    }
    
    .bg-black {
      background-color: black;
    }
    
    .bg-gray-800 {
      background-color: var(--gray-800);
    }
    
    .bg-gray-600 {
      background-color: var(--gray-600);
    }
    
    .bg-red-600 {
      background-color: #dc2626;
    }
    
    .bg-green-600 {
      background-color: #16a34a;
    }
    
    .bg-white {
      background-color: white;
    }
    
    .bg-primary {
      background-color: var(--primary-color);
    }
    
    .bg-opacity-50 {
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .rounded-lg {
      border-radius: 0.5rem;
    }
    
    .rounded-full {
      border-radius: 50%;
    }
    
    .overflow-hidden {
      overflow: hidden;
    }
    
    .object-cover {
      object-fit: cover;
    }
    
    .text-xl {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }
    
    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    
    .text-3xl {
      font-size: 1.875rem;
      line-height: 2.25rem;
    }
    
    .font-semibold {
      font-weight: 600;
    }
    
    .opacity-75 {
      opacity: 0.75;
    }
    
    .cursor-pointer {
      cursor: pointer;
    }
    
    /* ── Voice call screen ───────────────────────────────────────────────────── */
    .voice-call-screen {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
      gap: 1.5rem;
    }
    .voice-avatar-ring {
      width: 140px; height: 140px; border-radius: 50%;
      background: rgba(99, 88, 247, 0.2);
      display: flex; align-items: center; justify-content: center;
      animation: voice-pulse 2s ease-in-out infinite;
    }
    .voice-avatar {
      width: 100px; height: 100px; border-radius: 50%;
      background: #4f46e5; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; font-weight: 800;
      letter-spacing: 1px;
    }
    .voice-peer-name {
      color: white; font-size: 1.75rem; font-weight: 700;
      margin: 0; letter-spacing: 0.5px;
    }
    .voice-status {
      color: rgba(255,255,255,0.65); font-size: 0.95rem; margin: 0;
    }
    @keyframes voice-pulse {
      0%, 100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(99,88,247,0.5); }
      50%       { transform: scale(1.06); box-shadow: 0 0 0 20px rgba(99,88,247,0); }
    }

    .hover\\:bg-gray-50:hover {
      background-color: var(--gray-50);
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy {

  // ── Input: the username of the person we're chatting with (for outgoing calls).
  // Set this from the parent component that embeds <app-video-call>.
  @Input() targetUsername: string = '';

  @ViewChild('localVideo') localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;

  // ── UI state signals ────────────────────────────────────────────────────────
  isCallActive = signal(false);
  isMuted = signal(false);
  isVideoOff = signal(false);
  /** Whether this is a video or voice-only call (affects UI rendering) */
  isVideoCall = signal(true);
  /** Holds the pending SignalMessage when callState is 'receiving' */
  incomingCall = signal<SignalMessage | null>(null);
  /** Name shown in the top-left during an active call */
  remotePeerName = signal<string | null>(null);

  private callStartTime: Date | null = null;
  private durationInterval: ReturnType<typeof setInterval> | null = null;
  private subs: Subscription[] = [];

  constructor(
    private webRtcService: WebRtcService,
    private authService: AuthService,
    private ngZone: NgZone,
  ) { }

  // ════════════════════════════════════════════════════════════════════════════
  // Lifecycle
  // ════════════════════════════════════════════════════════════════════════════

  ngOnInit(): void {
    // Tell the service who we are so it can fill in SignalMessage.from correctly.
    const me = this.authService.getCurrentUser();
    if (me?.username) {
      this.webRtcService.setMyUsername(me.username);
    }

    // ── Subscribe to call state ──────────────────────────────────────────────
    this.subs.push(
      this.webRtcService.callState$.subscribe((state: CallState) => {
        this.ngZone.run(() => this._onCallStateChange(state));
      })
    );

    // ── Subscribe to local stream → wire to <video #localVideo> ────────────
    this.subs.push(
      this.webRtcService.localStream$.subscribe((stream) => {
        this.ngZone.run(() => {
          if (this.localVideoRef?.nativeElement) {
            this.localVideoRef.nativeElement.srcObject = stream;
            this.localVideoRef.nativeElement.muted = true;
          }
        });
      })
    );

    // ── Subscribe to remote stream → wire to <video #remoteVideo> ──────────
    this.subs.push(
      this.webRtcService.remoteStream$.subscribe((stream) => {
        this.ngZone.run(() => {
          if (this.remoteVideoRef?.nativeElement) {
            this.remoteVideoRef.nativeElement.srcObject = stream;
          }
        });
      })
    );

    // ── Track who the remote peer is ────────────────────────────────────────
    this.subs.push(
      this.webRtcService.remotePeer$.subscribe((peer) => {
        this.ngZone.run(() => this.remotePeerName.set(peer));
      })
    );

    // ── Track if this is a video or voice call ──────────────────────────────
    this.subs.push(
      this.webRtcService.isVideoCall$.subscribe((isVideo) => {
        this.ngZone.run(() => this.isVideoCall.set(isVideo));
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this._stopDurationClock();
    // Do NOT call hangUp() here automatically — the service manages its own
    // lifecycle and will keep the call alive if this component is destroyed
    // while a call is active (e.g. route change). Call hangUp() explicitly.
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Template-facing methods
  // ════════════════════════════════════════════════════════════════════════════

  /** Called by the "Video Call" button in the chat header. */
  startVideoCall(): void {
    if (!this.targetUsername) {
      console.warn('[VideoCall] targetUsername is not set — cannot start call.');
      return;
    }
    this.webRtcService.startCall(this.targetUsername);
  }

  /** Voice call: WebRTC flow with getUserMedia audio-only. */
  startVoiceCall(): void {
    if (!this.targetUsername) {
      console.warn('[VideoCall] targetUsername is not set — cannot start voice call.');
      return;
    }
    this.webRtcService.startCall(this.targetUsername, false);
  }

  /** Called by Accept (true) / Decline (false) buttons in the incoming modal. */
  answerCall(accept: boolean): void {
    const offer = this.webRtcService.getPendingOffer();
    if (!offer) return;

    if (accept) {
      this.webRtcService.acceptCall(offer);
    } else {
      this.webRtcService.declineCall(offer.from);
    }
    this.incomingCall.set(null);
  }

  /** End Call button. */
  endCall(): void {
    this.webRtcService.hangUp();
  }

  /** Mute / unmute the local audio track directly on the MediaStream. */
  toggleMute(): void {
    const stream = this.webRtcService.localStream$.value;
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.isMuted.set(!audioTrack.enabled);
    }
  }

  /** Enable / disable the local video track directly on the MediaStream. */
  toggleVideo(): void {
    const stream = this.webRtcService.localStream$.value;
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.isVideoOff.set(!videoTrack.enabled);
    }
  }

  /** Returns a "MM:SS" duration string while the call is connected. */
  getCallDuration(): string | null {
    if (!this.callStartTime) return null;
    const elapsed = Math.floor((Date.now() - this.callStartTime.getTime()) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Private helpers
  // ════════════════════════════════════════════════════════════════════════════

  private _onCallStateChange(state: CallState): void {
    switch (state) {

      case 'calling':
        // We placed a call — show the active call screen immediately so the
        // user gets feedback, even before ICE completes.
        this.isCallActive.set(true);
        this.incomingCall.set(null);
        break;

      case 'receiving':
        // Someone is calling us — show the incoming call modal.
        this.incomingCall.set(this.webRtcService.getPendingOffer());
        this.isCallActive.set(false);
        break;

      case 'connecting':
        // SDP negotiation in progress — keep the active screen visible.
        this.isCallActive.set(true);
        this.incomingCall.set(null);
        break;

      case 'connected':
        // Media is flowing — start the duration clock.
        this.isCallActive.set(true);
        this.incomingCall.set(null);
        this._startDurationClock();

        setTimeout(() => {
          if (this.localVideoRef?.nativeElement) {
            const stream = (this.webRtcService as any).localStream$?.value;
            if (stream) {
              this.localVideoRef.nativeElement.srcObject = stream;
              this.localVideoRef.nativeElement.muted = true;
            }
          }
          if (this.remoteVideoRef?.nativeElement) {
            const stream = (this.webRtcService as any).remoteStream$?.value;
            if (stream) {
              this.remoteVideoRef.nativeElement.srcObject = stream;
            }
          }
        }, 150);
        break;

      case 'ended':
      case 'idle':
        // Call finished — reset all UI state.
        this.isCallActive.set(false);
        this.incomingCall.set(null);
        this.isMuted.set(false);
        this.isVideoOff.set(false);
        this._stopDurationClock();
        // Clear video elements
        if (this.localVideoRef?.nativeElement) this.localVideoRef.nativeElement.srcObject = null;
        if (this.remoteVideoRef?.nativeElement) this.remoteVideoRef.nativeElement.srcObject = null;
        break;
    }
  }

  private _startDurationClock(): void {
    this._stopDurationClock();
    this.callStartTime = new Date();
    // Tick every second so getCallDuration() re-evaluates.
    // We use a simple interval + change detection via NgZone.
    this.durationInterval = setInterval(() => {
      this.ngZone.run(() => { /* trigger CD */ });
    }, 1000);
  }

  private _stopDurationClock(): void {
    if (this.durationInterval !== null) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
    this.callStartTime = null;
  }
}
