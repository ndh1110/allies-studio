import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from '../models/chat.model';
import { Call, CallData, CallAnswer } from '../models/call.model';
import { environment } from '../../environments/environment';

declare var SockJS: any;
declare var Stomp: any;

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: any;
  private isConnected = false;

  private messagesSubject = new BehaviorSubject<ChatMessage | null>(null);
  public messages$ = this.messagesSubject.asObservable();

  private callSubject = new BehaviorSubject<any>(null);
  public callEvents$ = this.callSubject.asObservable();

  connect(): void {
    if (this.isConnected) return;

    const socket = new SockJS(environment.apiUrl + '/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, (frame: any) => {
      console.log('Connected: ' + frame);
      this.isConnected = true;

      // Subscribe to public messages
      this.stompClient.subscribe('/topic/public', (message: any) => {
        const chatMessage: ChatMessage = JSON.parse(message.body);
        this.messagesSubject.next(chatMessage);
      });

      // Subscribe to call events
      this.stompClient.subscribe('/topic/call/*', (message: any) => {
        const callEvent = JSON.parse(message.body);
        this.callSubject.next(callEvent);
      });
    });
  }

  disconnect(): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.disconnect();
      this.isConnected = false;
    }
  }

  sendMessage(message: ChatMessage): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(message));
    }
  }

  addUser(username: string): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.send('/app/chat.addUser', {}, username);
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

  subscribeToUserQueue(username: string): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.subscribe(`/user/${username}/queue/messages`, (message: any) => {
        const chatMessage: ChatMessage = JSON.parse(message.body);
        this.messagesSubject.next(chatMessage);
      });

      this.stompClient.subscribe(`/user/${username}/queue/call`, (message: any) => {
        const callEvent = JSON.parse(message.body);
        this.callSubject.next(callEvent);
      });
    }
  }
}
