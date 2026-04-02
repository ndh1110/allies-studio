import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ChatMessage, ChatRoom } from '../models/chat.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly API_URL = environment.apiUrl + '/chat';
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getMessages(userId: number): Observable<ChatMessage[]> {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    return this.http.get<any[]>(`${this.API_URL}/messages/${userId}`, { headers }).pipe(
      map(messages => messages.map(this.convertBackendToFrontend)),
      catchError(error => {
        console.error('Error getting messages:', error);
        return of([]);
      })
    );
  }

  getConversations(userId: number): Observable<any[]> {
    const token = this.authService.getToken();
    const headers: { [key: string]: string } = { 'ngrok-skip-browser-warning': 'true' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('Getting conversations for user:', userId);
    return this.http.get<any[]>(`${this.API_URL}/conversations/${userId}`, { headers }).pipe(
      map(conversations => {
        console.log('Conversations response:', conversations);
        return conversations || [];
      }),
      catchError(error => {
        console.error('Error getting conversations:', error);
        // Trả về empty array thay vì throw error
        return of([]);
      })
    );
  }

  getConversation(userId1: number, userId2: number): Observable<ChatMessage[]> {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    return this.http.get<any[]>(`${this.API_URL}/messages/${userId1}/${userId2}`, { headers }).pipe(
      map(messages => messages.map(this.convertBackendToFrontend)),
      catchError(error => {
        console.error('Error getting conversation:', error);
        return of([]);
      })
    );
  }

  private convertBackendToFrontend(backendMessage: any): ChatMessage {
    return {
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
  }

  sendMessage(message: ChatMessage): Observable<ChatMessage> {
    // Convert frontend format to backend format
    const backendMessage = {
      maTkA: {
        maTk: message.maTkA.id,
        tenDn: message.maTkA.tenDn,
        mk: '', // Not needed for sending
        avarta: message.maTkA.avatar || 'default-avatar.png'
      },
      maTkB: {
        maTk: message.maTkB.id,
        tenDn: message.maTkB.tenDn,
        mk: '', // Not needed for sending
        avarta: message.maTkB.avatar || 'default-avatar.png'
      },
      noiDung: message.noiDung,
      thoiGian: message.thoiGian,
      trangThai: message.trangThai
    };
    
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    console.log('Sending message to backend:', backendMessage);
    return this.http.post<any>(`${this.API_URL}/send`, backendMessage, { headers }).pipe(
      map(response => this.convertBackendToFrontend(response)),
      catchError(error => {
        console.error('Error sending message:', error);
        throw error;
      })
    );
  }

  markMessageAsRead(messageId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/read`, { messageId });
  }

  addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  getMessagesForDisplay(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  getOnlineUsers(): Observable<User[]> {
    const token = this.authService.getToken();
    const headers: { [key: string]: string } = { 'ngrok-skip-browser-warning': 'true' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return this.http.get<any[]>(`${this.API_URL}/online-users`, { headers }).pipe(
      map(users => users.map(user => ({
        id: user.id,
        tenDn: user.tenDn,
        email: user.email || user.tenDn + '@example.com',
        avatar: user.avarta || 'default-avatar.png'
      }))),
      catchError(error => {
        console.error('Error getting online users:', error);
        return of([]);
      })
    );
  }

  searchUsers(query: string): Observable<User[]> {
    const token = this.authService.getToken();
    const headers: { [key: string]: string } = { 'ngrok-skip-browser-warning': 'true' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return this.http.get<any[]>(`${environment.apiUrl}/users/search?q=${encodeURIComponent(query)}`, { headers }).pipe(
      map(users => users.map(user => ({
        id: user.id,
        tenDn: user.tenDn,
        email: user.email,
        avatar: user.avarta || 'default-avatar.png'
      }))),
      catchError(error => {
        console.error('Error searching users:', error);
        return of([]);
      })
    );
  }

  getFriends(username: string): Observable<User[]> {
    const token = this.authService.getToken();
    const headers: { [key: string]: string } = { 'ngrok-skip-browser-warning': 'true' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Sending friends request with token:', token.substring(0, 20) + '...');
    } else {
      console.log('No token found for friends request');
    }
    
    return this.http.get<any[]>(`${environment.apiUrl}/users/friends/${username}`, { headers }).pipe(
      map(friends => (friends || []).map(friend => ({
        id: friend.id,
        tenDn: friend.tenDn,
        email: friend.email,
        avatar: friend.avarta || 'default-avatar.png'
      }))),
      catchError(error => {
        console.error('Error getting friends:', error);
        return of([]);
      })
    );
  }
}
