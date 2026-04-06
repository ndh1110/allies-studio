import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  // Chat mode: 'dm' for 1-on-1, 'group' for group chat
  public chatMode = signal<'dm' | 'group'>('dm');

  // 1-on-1 Chat Signals
  public messages = signal<any[]>([]);
  public contacts = signal<any[]>([]);
  public selectedContact = signal<any | null>(null);
  public onlineUsers = signal<string[]>([]);
  public searchTerm = signal<string>('');

  // Group Chat Signals
  public groups = signal<any[]>([]);
  public selectedGroup = signal<any | null>(null);
  public groupMessages = signal<any[]>([]);

  // Unread Counters — key: 'dm-{userId}' or 'group-{groupId}'
  public unreadCounts = signal<Record<string, number>>({});

  /**
   * Total unread message count across ALL conversations.
   * Used for the navbar Messages badge and browser tab title.
   */
  public totalUnread = computed(() =>
    Object.values(this.unreadCounts()).reduce((sum, n) => sum + n, 0)
  );

  constructor() { }

  // === 1-on-1 Chat ===

  addMessage(msg: any) {
    this.messages.update(msgs => {
      if (msg.id && msgs.some(m => m.id === msg.id)) {
        return msgs; // Deduplicate by ID
      }
      return [...msgs, msg];
    });
  }

  setMessages(history: any[]) {
    this.messages.set(history);
  }

  selectContact(user: any) {
    this.chatMode.set('dm');
    this.selectedContact.set(user);
    this.selectedGroup.set(null);
    this.messages.set([]);
  }

  // === Group Chat ===

  selectGroup(group: any) {
    this.chatMode.set('group');
    this.selectedGroup.set(group);
    this.selectedContact.set(null);
    this.groupMessages.set([]);
  }

  addGroupMessage(msg: any) {
    this.groupMessages.update(msgs => {
      if (msg.id && msgs.some(m => m.id === msg.id)) {
        return msgs; // Deduplicate by ID
      }
      return [...msgs, msg];
    });
  }

  setGroupMessages(history: any[]) {
    this.groupMessages.set(history);
  }

  // === Unread Management ===

  incrementUnread(key: string) {
    this.unreadCounts.update(counts => ({
      ...counts,
      [key]: (counts[key] || 0) + 1
    }));
  }

  resetUnread(key: string) {
    this.unreadCounts.update(counts => ({
      ...counts,
      [key]: 0
    }));
  }

  /** Clears ALL unread counts at once (e.g. when entering the Messages tab). */
  resetAllUnread() {
    this.unreadCounts.set({});
  }
}
