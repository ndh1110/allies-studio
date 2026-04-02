import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage, TypingIndicator } from '../models/chat.model';
import { User } from '../models/user.model';
import { Call, CallData, CallAnswer } from '../models/call.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: any;
  private isConnected = false;
  private currentUser: User | null = null;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage | null>(null);
  public messages$ = this.messagesSubject.asObservable();

  private callSubject = new BehaviorSubject<any>(null);
  public callEvents$ = this.callSubject.asObservable();

  private typingSubject = new BehaviorSubject<TypingIndicator | null>(null);
  public typing$ = this.typingSubject.asObservable();

  private userPresenceSubject = new BehaviorSubject<User[]>([]);
  public userPresence$ = this.userPresenceSubject.asObservable();

  constructor(private authService: AuthService) {}

  connect(user?: User): void {
    // Get current user from auth service if not provided
    this.currentUser = user || this.getCurrentUserFromAuth();
    console.log('Attempting to connect WebSocket to:', environment.wsUrl);
    console.log('Current user:', this.currentUser);
    
    if (!this.currentUser) {
      console.warn('No user provided for WebSocket connection');
      return;
    }

    // Prevent multiple connection attempts
    if (this.stompClient && this.stompClient.connected) {
      console.log('WebSocket already connected, updating user subscriptions...');
      this.isConnected = true;
      this.connectionStatusSubject.next(true);
      
      // Update user subscriptions if user changed
      if (this.currentUser) {
        this.subscribeToUserQueue(this.currentUser.tenDn);
        this.notifyUserConnection();
      }
      return;
    }

    // Only disconnect if not already disconnected
    if (this.stompClient && !this.stompClient.connected) {
      this.isConnected = false;
      this.connectionStatusSubject.next(false);
    }
    
    try {
      const socket = new SockJS(environment.wsUrl);
      this.stompClient = Stomp.over(socket);

      // Set connection timeout
      this.stompClient.heartbeat.outgoing = 20000; // 20 seconds
      this.stompClient.heartbeat.incoming = 20000; // 20 seconds

      // Enable debug logging in development
      if (!environment.production) {
        this.stompClient.debug = (str: string) => {
          console.log('STOMP Debug:', str);
        };
      }

      this.stompClient.connect({}, (frame: any) => {
        console.log('✅ WebSocket Connected successfully:', frame);
        this.isConnected = true;
        this.connectionStatusSubject.next(true);

        // Subscribe to user-specific messages first
        if (this.currentUser) {
          this.subscribeToUserQueue(this.currentUser.tenDn);
        }

        // Subscribe to user-specific messages ONLY (to avoid duplicates)
        if (this.currentUser) {
          const userTopic = '/topic/messages.' + this.currentUser.tenDn;
          console.log('Subscribing to user-specific topic:', userTopic);
          this.stompClient.subscribe(userTopic, (message: any) => {
            try {
              console.log('Raw user-specific message received:', message.body);
              const backendMessage = JSON.parse(message.body);
              const chatMessage = this.convertBackendToFrontend(backendMessage);
              console.log('Received user-specific message:', chatMessage);
              this.messagesSubject.next(chatMessage);
            } catch (error) {
              console.error('Error parsing user-specific message:', error);
            }
          });
        }

        // Subscribe to call events
        this.stompClient.subscribe('/topic/call/*', (message: any) => {
          try {
            const callEvent = JSON.parse(message.body);
            this.callSubject.next(callEvent);
          } catch (error) {
            console.error('Error parsing call event:', error);
          }
        });

        // Subscribe to typing indicators
        this.stompClient.subscribe('/topic/typing', (message: any) => {
          try {
            const typingIndicator: TypingIndicator = JSON.parse(message.body);
            this.typingSubject.next(typingIndicator);
          } catch (error) {
            console.error('Error parsing typing indicator:', error);
          }
        });

        // Subscribe to user presence
        this.stompClient.subscribe('/topic/presence', (message: any) => {
          try {
            const users: User[] = JSON.parse(message.body);
            this.userPresenceSubject.next(users);
          } catch (error) {
            console.error('Error parsing user presence:', error);
          }
        });

        // Notify server about user connection
        this.notifyUserConnection();
      }, (error: any) => {
        console.error('❌ WebSocket connection error:', error);
        this.isConnected = false;
        this.connectionStatusSubject.next(false);
        // Try to reconnect after 3 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            console.log('Attempting to reconnect...');
            this.connect(this.currentUser!);
          }
        }, 3000);
      });
    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      this.isConnected = false;
      this.connectionStatusSubject.next(false);
    }
  }

  disconnect(): void {
    // Stop monitoring first
    this.stopConnectionMonitoring();
    
    if (this.stompClient && this.isConnected) {
      this.stompClient.disconnect();
      this.isConnected = false;
      this.connectionStatusSubject.next(false);
    }
  }

  sendMessage(message: ChatMessage): void {
    if (this.stompClient && this.isConnected) {
      // Convert frontend format to backend format for WebSocket
      const backendMessage = {
        maTkA: {
          maTk: message.maTkA.id,
          tenDn: message.maTkA.tenDn,
          mk: '',
          avarta: message.maTkA.avatar || 'default-avatar.png'
        },
        maTkB: {
          maTk: message.maTkB.id,
          tenDn: message.maTkB.tenDn,
          mk: '',
          avarta: message.maTkB.avatar || 'default-avatar.png'
        },
        noiDung: message.noiDung,
        thoiGian: message.thoiGian,
        trangThai: message.trangThai
      };
      
      console.log('Sending WebSocket message:', backendMessage);
      this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(backendMessage));
    }
  }

  addUser(tenDn: string): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.send('/app/chat.addUser', {}, tenDn);
    }
  }

  initiateCall(callData: CallData): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.send('/app/call.initiate', {}, JSON.stringify(callData));
    }
  }

  answerCall(answer: CallAnswer): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.send('/app/call.answer', {}, JSON.stringify(answer));
    }
  }

  endCall(callId: number): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.send('/app/call.end', {}, JSON.stringify({ callId }));
    }
  }

  subscribeToUserQueue(tenDn: string): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.subscribe(`/user/${tenDn}/queue/messages`, (message: any) => {
        try {
          const backendMessage = JSON.parse(message.body);
          const chatMessage = this.convertBackendToFrontend(backendMessage);
          this.messagesSubject.next(chatMessage);
        } catch (error) {
          console.error('Error parsing user message:', error);
        }
      });

      this.stompClient.subscribe(`/user/${tenDn}/queue/call`, (message: any) => {
        const callEvent = JSON.parse(message.body);
        this.callSubject.next(callEvent);
      });

      this.stompClient.subscribe(`/user/${tenDn}/queue/typing`, (message: any) => {
        const typingIndicator: TypingIndicator = JSON.parse(message.body);
        this.typingSubject.next(typingIndicator);
      });
    }
  }

  sendTypingIndicator(userId: number, isTyping: boolean): void {
    if (this.stompClient && this.isConnected) {
      const typingIndicator: TypingIndicator = {
        userId: userId,
        isTyping: isTyping,
        timestamp: new Date()
      };
      this.stompClient.send('/app/chat.typing', {}, JSON.stringify(typingIndicator));
    }
  }

  markMessageAsRead(messageId: number): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.send('/app/chat.read', {}, JSON.stringify({ messageId }));
    }
  }

  private notifyUserConnection(): void {
    if (this.stompClient && this.isConnected && this.currentUser) {
      console.log('Notifying user connection:', this.currentUser.tenDn);
      this.stompClient.send('/app/user.connect', {}, JSON.stringify(this.currentUser));
    }
  }

  notifyUserDisconnection(): void {
    if (this.stompClient && this.isConnected && this.currentUser) {
      this.stompClient.send('/app/user.disconnect', {}, JSON.stringify(this.currentUser));
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  updateConnectionStatus(): void {
    // This method can be called to update connection status
    this.isConnected = this.stompClient && this.stompClient.connected;
  }

  reconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
    this.isConnected = false;
    this.connectionStatusSubject.next(false);
    this.connect(this.currentUser || undefined);
  }

  private getCurrentUserFromAuth(): User | null {
    return this.authService.getCurrentUser();
  }

  private convertBackendToFrontend(backendMessage: any): ChatMessage {
    console.log('Converting backend message:', backendMessage);
    
    const convertedMessage = {
      id: backendMessage.id,
      maTkA: {
        id: backendMessage.maTkA?.maTk || backendMessage.maTkA?.id,
        tenDn: backendMessage.maTkA?.tenDn || '',
        email: '',
        avatar: backendMessage.maTkA?.avarta || 'default-avatar.png'
      },
      maTkB: {
        id: backendMessage.maTkB?.maTk || backendMessage.maTkB?.id,
        tenDn: backendMessage.maTkB?.tenDn || '',
        email: '',
        avatar: backendMessage.maTkB?.avarta || 'default-avatar.png'
      },
      noiDung: backendMessage.noiDung,
      thoiGian: new Date(backendMessage.thoiGian),
      trangThai: backendMessage.trangThai,
      maMedia: backendMessage.maMedia
    };
    
    console.log('Converted message:', convertedMessage);
    return convertedMessage;
  }

  // Method to check and maintain connection
  checkAndMaintainConnection(): void {
    if (!this.isConnected && this.currentUser) {
      console.log('WebSocket not connected, attempting to reconnect...');
      this.connect(this.currentUser);
    }
  }

  // Method to update connection status periodically
  private monitoringInterval: any;
  
  startConnectionMonitoring(): void {
    // Clear existing interval if any
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(() => {
      this.updateConnectionStatus();
      if (!this.isConnected && this.currentUser) {
        console.log('Periodic check: WebSocket disconnected, reconnecting...');
        this.connect(this.currentUser);
      }
    }, 10000); // Check every 10 seconds (increased to reduce load)
  }

  stopConnectionMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}
