import { Component, OnInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../services/websocket.service';
import { AuthService } from '../../services/auth.service';
import { Call, CallData, CallAnswer } from '../../models/call.model';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black z-50" *ngIf="isCallActive()">
      <div class="flex h-full">
        <!-- Video Area -->
        <div class="flex-1 relative">
          <!-- Remote Video -->
          <video
            #remoteVideo
            class="w-full h-full object-cover"
            autoplay
            playsinline
          ></video>
          
          <!-- Local Video -->
          <div class="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden">
            <video
              #localVideo
              class="w-full h-full object-cover"
              autoplay
              playsinline
              muted
            ></video>
          </div>
          
          <!-- Call Info -->
          <div class="absolute top-4 left-4 text-white">
            <h3 class="text-xl font-semibold">{{ callInfo()?.callerId || 'Calling...' }}</h3>
            <p class="text-sm opacity-75">{{ getCallDuration() }}</p>
          </div>
        </div>
        
        <!-- Controls -->
        <div class="absolute bottom-8 left-half transform translate-x-negative-half flex space-x-4">
          <!-- Mute Button -->
          <button
            (click)="toggleMute()"
            class="w-12 h-12 rounded-full flex items-center justify-center"
            [class.bg-gray-600]="!isMuted()"
            [class.bg-red-600]="isMuted()"
          >
            <span class="material-icons text-white">
              {{ isMuted() ? 'mic_off' : 'mic' }}
            </span>
          </button>
          
          <!-- Video Toggle -->
          <button
            (click)="toggleVideo()"
            class="w-12 h-12 rounded-full flex items-center justify-center"
            [class.bg-gray-600]="!isVideoOff()"
            [class.bg-red-600]="isVideoOff()"
          >
            <span class="material-icons text-white">
              {{ isVideoOff() ? 'videocam_off' : 'videocam' }}
            </span>
          </button>
          
          <!-- End Call -->
          <button
            (click)="endCall()"
            class="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center"
          >
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
            <span class="material-icons text-white text-3xl">person</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Incoming Call</h3>
          <p class="text-gray-600 mb-6">{{ incomingCall()?.callerId }}</p>
          
          <div class="flex space-x-4 justify-center">
            <button
              (click)="answerCall(false)"
              class="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center"
            >
              <span class="material-icons text-white">call_end</span>
            </button>
            <button
              (click)="answerCall(true)"
              class="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center"
            >
              <span class="material-icons text-white">call</span>
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
    
    .hover\\:bg-gray-50:hover {
      background-color: var(--gray-50);
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  isCallActive = signal(false);
  isMuted = signal(false);
  isVideoOff = signal(false);
  incomingCall = signal<any>(null);
  callInfo = signal<CallData | null>(null);
  callStartTime = signal<Date | null>(null);
  
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;

  constructor(
    private webSocketService: WebSocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscribeToCallEvents();
  }

  ngOnDestroy(): void {
    this.endCall();
  }

  subscribeToCallEvents(): void {
    this.webSocketService.callEvents$.subscribe(event => {
      if (event) {
        switch (event.type) {
          case 'incoming_call':
            this.incomingCall.set(event);
            break;
          case 'call_accepted':
            this.startCall();
            break;
          case 'call_rejected':
            this.endCall();
            break;
          case 'call_ended':
            this.endCall();
            break;
        }
      }
    });
  }

  startVideoCall(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const callData: CallData = {
      callerId: currentUser.username,
      receiverId: 'receiver', // This should come from the selected chat
      callType: 'video'
    };

    this.callInfo.set(callData);
    this.webSocketService.initiateCall(callData);
  }

  startVoiceCall(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const callData: CallData = {
      callerId: currentUser.username,
      receiverId: 'receiver', // This should come from the selected chat
      callType: 'voice'
    };

    this.callInfo.set(callData);
    this.webSocketService.initiateCall(callData);
  }

  async startCall(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (this.localVideo) {
        this.localVideo.nativeElement.srcObject = this.localStream;
      }
      
      this.isCallActive.set(true);
      this.callStartTime.set(new Date());
      this.incomingCall.set(null);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }

  answerCall(accept: boolean): void {
    if (!this.incomingCall()) return;

    const answer: CallAnswer = {
      callId: this.incomingCall().callId,
      answer: accept ? 'accept' : 'reject'
    };

    this.webSocketService.answerCall(answer);
    
    if (accept) {
      this.startCall();
    } else {
      this.incomingCall.set(null);
    }
  }

  endCall(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.isCallActive.set(false);
    this.incomingCall.set(null);
    this.callInfo.set(null);
    this.callStartTime.set(null);
  }

  toggleMute(): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isMuted.set(!audioTrack.enabled);
      }
    }
  }

  toggleVideo(): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoOff.set(!videoTrack.enabled);
      }
    }
  }

  getCallDuration(): string {
    if (!this.callStartTime()) return '00:00';
    
    const now = new Date();
    const duration = Math.floor((now.getTime() - this.callStartTime()!.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
