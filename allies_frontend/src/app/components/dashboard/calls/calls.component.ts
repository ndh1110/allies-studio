import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-card">
      <span class="material-icons icon">phone_missed</span>
      <h2>No Calls Yet</h2>
      <p>Your call history will appear here.</p>
    </div>
  `,
  styles: [`
    .empty-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      padding: 4rem 2rem;
      text-align: center;
      color: #9ca3af;
    }
    .icon { font-size: 4rem; display: block; margin-bottom: 1rem; color: #d1d5db; }
    h2 { margin: 0 0 8px; font-size: 1.25rem; font-weight: 700; color: #374151; }
    p { margin: 0; font-size: 0.875rem; }
  `]
})
export class CallsComponent {}
