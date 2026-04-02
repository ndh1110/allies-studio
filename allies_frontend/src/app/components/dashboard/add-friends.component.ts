import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AddFriendsService, FriendRequest, UserLite } from '../../services/add-friends.service';

type SubTab = 'search' | 'requests' | 'suggestions';

@Component({
  selector: 'app-add-friends',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './add-friends.component.html',
})
export class AddFriendsComponent {
  // sub tabs
  subTab = signal<SubTab>('search');

  // search
  q = signal('');
  searching = signal(false);
  searchResults = signal<UserLite[]>([]);
  searchError = signal<string | null>(null);

  // requests
  loadingReq = signal(false);
  incoming = signal<FriendRequest[]>([]);
  outgoing = signal<FriendRequest[]>([]);

  // suggestions
  loadingSug = signal(false);
  suggestions = signal<UserLite[]>([]);

  constructor(private svc: AddFriendsService) {
    effect(() => {
      const tab = this.subTab();
      if (tab === 'requests' && this.incoming().length === 0) this.loadRequests();
      if (tab === 'suggestions' && this.suggestions().length === 0) this.loadSuggestions();
    });
  }

  setSubTab(tab: SubTab) { this.subTab.set(tab); }

  // ----- Search -----
  async onSearch() {
    const term = this.q().trim();
    if (!term) { this.searchResults.set([]); this.searchError.set(null); return; }

    this.searching.set(true);
    this.searchError.set(null);

    try {
      const users = await this.svc.searchUsers(term);
      // loại trùng theo id phòng backend trả cả bản thân mình
      const seen = new Set<string | number>();
      const unique = (users ?? []).filter(u => {
        const k = u.id ?? u.username;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      this.searchResults.set(unique);
    } catch (e: any) {
      this.searchError.set(e?.message ?? 'Search failed');
      this.searchResults.set([]);
    } finally {
      this.searching.set(false);
      this.setSubTab('search');
    }
  }

  async sendRequest(target: UserLite) {
    await this.svc.sendRequest(target.id);
    // cập nhật giao diện ngay
    this.outgoing.update((o) => [
      { id: 'temp-' + target.id, toUser: target, status: 'PENDING', createdAt: new Date().toISOString() } as any,
      ...o,
    ]);
  }

  // ----- Requests -----
  async loadRequests() {
    this.loadingReq.set(true);
    try {
      const [inc, out] = await Promise.all([this.svc.getIncoming(), this.svc.getOutgoing()]);
      this.incoming.set(inc ?? []);
      this.outgoing.set(out ?? []);
    } finally {
      this.loadingReq.set(false);
    }
  }
  async accept(req: FriendRequest) { await this.svc.accept(req.id); await this.loadRequests(); }
  async decline(req: FriendRequest) { await this.svc.decline(req.id); await this.loadRequests(); }
  async cancel(req: FriendRequest) { await this.svc.cancel(req.id);  await this.loadRequests(); }

  // ----- Suggestions -----
  async loadSuggestions() {
    this.loadingSug.set(true);
    try {
      const sugs = await this.svc.getSuggestions();
      this.suggestions.set(sugs ?? []);
    } finally {
      this.loadingSug.set(false);
    }
  }
  async addFromSuggestion(u: UserLite) { await this.svc.sendRequest(u.id); await this.loadRequests(); }
}
