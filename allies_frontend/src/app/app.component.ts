import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ConnectionStatusComponent } from './components/connection-status/connection-status.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ConnectionStatusComponent],
  template: `
    <div class="app-container">
      <!-- Connection Status -->
      <app-connection-status></app-connection-status>
      
      <!-- Navigation -->
      <nav class="main-nav">
        <div class="nav-brand">
          <h1>💬 Chat System</h1>
        </div>
        <div class="nav-links">
          <a 
            routerLink="/dashboard"
            routerLinkActive="active"
            class="nav-link">
            🏠 Dashboard
          </a>
          <a 
            routerLink="/features"
            routerLinkActive="active"
            class="nav-link">
            🚀 Tính năng
          </a>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <p>© 2024 Chat System - Real-time messaging with database storage</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-nav {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .nav-brand h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .nav-links {
      display: flex;
      gap: 20px;
    }

    .nav-link {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.2);
      padding: 12px 24px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-2px);
    }

    .nav-link.active {
      background: rgba(255, 255, 255, 0.9);
      color: #333;
      border-color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
    }

    .main-content {
      flex: 1;
      background: #f8f9fa;
    }

    .tab-content {
      width: 100%;
    }

    .app-footer {
      background: #333;
      color: white;
      text-align: center;
      padding: 20px;
      font-size: 0.9rem;
    }

    .app-footer p {
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .main-nav {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .nav-links {
        flex-direction: column;
        width: 100%;
        max-width: 300px;
      }

      .nav-link {
        justify-content: center;
      }
    }
  `]
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    // Component initialization
  }
}
