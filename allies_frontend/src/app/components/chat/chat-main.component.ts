import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatListComponent } from './chat-list.component';
import { ChatHistoryComponent } from './chat-history.component';
import { ChatStateService } from '../../services/chat-state.service';

@Component({
  selector: 'app-chat-main',
  standalone: true,
  imports: [CommonModule, ChatListComponent, ChatHistoryComponent],
  template: `
    <div class="chat-main-wrapper" [class.has-selection]="hasSelection()">
      <app-chat-list class="chat-list-pane"></app-chat-list>
      <app-chat-history class="chat-history-pane"></app-chat-history>
    </div>
  `,
  styles: [`
    .chat-main-wrapper {
      display: flex;
      height: calc(100vh - 120px);
      width: 100%;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    .chat-list-pane {
      display: block;
      width: 300px;
      flex-shrink: 0;
    }
    .chat-history-pane {
      display: block;
      flex: 1;
      min-width: 0;
    }
  `]
})
export class ChatMainComponent {
  chatState = inject(ChatStateService);

  hasSelection(): boolean {
    return !!this.chatState.selectedContact() || !!this.chatState.selectedGroup();
  }
}
