import { Component, OnInit, inject, signal } from '@angular/core';
import { ChatMainComponent } from '../../chat/chat-main.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [ChatMainComponent],
  template: `<app-chat-main></app-chat-main>`
})
export class MessagesComponent {}
