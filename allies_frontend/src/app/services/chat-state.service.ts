import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ChatMessage } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatStateService {
  private selectedUserSubject = new BehaviorSubject<User | null>(null);
  public selectedUser$ = this.selectedUserSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private unreadCountsSubject = new BehaviorSubject<Map<number, number>>(new Map());
  public unreadCounts$ = this.unreadCountsSubject.asObservable();

  private chatHistorySubject = new BehaviorSubject<Map<number, ChatMessage[]>>(new Map());
  public chatHistory$ = this.chatHistorySubject.asObservable();

  setSelectedUser(user: User | null): void {
    console.log('ChatStateService: Setting selected user:', user);
    this.selectedUserSubject.next(user);
  }

  getSelectedUser(): User | null {
    return this.selectedUserSubject.value;
  }

  addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  setMessages(messages: ChatMessage[]): void {
    this.messagesSubject.next(messages);
  }

  getMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  updateUnreadCount(userId: number, count: number): void {
    const currentCounts = this.unreadCountsSubject.value;
    currentCounts.set(userId, count);
    this.unreadCountsSubject.next(new Map(currentCounts));
  }

  getUnreadCount(userId: number): number {
    return this.unreadCountsSubject.value.get(userId) || 0;
  }

  markMessagesAsRead(userId: number): void {
    this.updateUnreadCount(userId, 0);
  }

  incrementUnreadCount(userId: number): void {
    const currentCount = this.getUnreadCount(userId);
    this.updateUnreadCount(userId, currentCount + 1);
  }

  // Chat history management
  saveChatHistory(userId: number, messages: ChatMessage[]): void {
    const currentHistory = this.chatHistorySubject.value;
    currentHistory.set(userId, messages);
    this.chatHistorySubject.next(new Map(currentHistory));
  }

  getChatHistory(userId: number): ChatMessage[] {
    return this.chatHistorySubject.value.get(userId) || [];
  }

  addMessageToHistory(userId: number, message: ChatMessage): void {
    const currentHistory = this.getChatHistory(userId);
    const updatedHistory = [...currentHistory, message];
    this.saveChatHistory(userId, updatedHistory);
  }

  clearChatHistory(userId?: number): void {
    if (userId) {
      const currentHistory = this.chatHistorySubject.value;
      currentHistory.delete(userId);
      this.chatHistorySubject.next(new Map(currentHistory));
    } else {
      this.chatHistorySubject.next(new Map());
    }
  }
}
