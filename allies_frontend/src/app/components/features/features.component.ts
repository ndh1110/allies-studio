import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="features-showcase">
      <div class="showcase-header">
        <h2>🚀 Tính năng Chat đã triển khai</h2>
        <p>Hệ thống chat real-time hoàn chỉnh với đầy đủ tính năng</p>
      </div>

      <div class="features-grid">
        <!-- Real-time Chat -->
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Real-time Chat</h3>
          <ul>
            <li>✅ Tin nhắn real-time qua WebSocket</li>
            <li>✅ Typing indicator</li>
            <li>✅ Status tin nhắn (sent, delivered, read)</li>
            <li>✅ Auto-scroll khi có tin nhắn mới</li>
          </ul>
        </div>

        <!-- Database Storage -->
        <div class="feature-card">
          <div class="feature-icon">💾</div>
          <h3>Lưu trữ Database</h3>
          <ul>
            <li>✅ Lưu tất cả tin nhắn vào database</li>
            <li>✅ Lịch sử chat có thể xem lại</li>
            <li>✅ Tìm kiếm tin nhắn</li>
            <li>✅ Xuất lịch sử ra file</li>
          </ul>
        </div>

        <!-- User Management -->
        <div class="feature-card">
          <div class="feature-icon">👥</div>
          <h3>Quản lý User</h3>
          <ul>
            <li>✅ Tìm kiếm người dùng</li>
            <li>✅ Chat với bất kỳ ai (không cần kết bạn)</li>
            <li>✅ Hiển thị user online/offline</li>
            <li>✅ User presence real-time</li>
          </ul>
        </div>

        <!-- Responsive Design -->
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>Responsive Design</h3>
          <ul>
            <li>✅ Giao diện mobile-friendly</li>
            <li>✅ Desktop layout tối ưu</li>
            <li>✅ Touch-friendly controls</li>
            <li>✅ Adaptive navigation</li>
          </ul>
        </div>

        <!-- Advanced Features -->
        <div class="feature-card">
          <div class="feature-icon">🔧</div>
          <h3>Tính năng nâng cao</h3>
          <ul>
            <li>✅ Message timestamps</li>
            <li>✅ Unread message count</li>
            <li>✅ Message status tracking</li>
            <li>✅ Connection status indicator</li>
          </ul>
        </div>

        <!-- Security & Performance -->
        <div class="feature-card">
          <div class="feature-icon">🛡️</div>
          <h3>Bảo mật & Hiệu suất</h3>
          <ul>
            <li>✅ WebSocket secure connection</li>
            <li>✅ Message validation</li>
            <li>✅ Error handling</li>
            <li>✅ Memory management</li>
          </ul>
        </div>
      </div>

      <!-- Usage Instructions -->
      <div class="usage-section">
        <h3>📖 Hướng dẫn sử dụng</h3>
        <div class="usage-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Kết nối WebSocket</h4>
              <p>Hệ thống tự động kết nối WebSocket khi load trang</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Tìm người để chat</h4>
              <p>Sử dụng tính năng tìm kiếm để tìm người dùng khác</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Bắt đầu cuộc trò chuyện</h4>
              <p>Click vào người dùng để bắt đầu chat real-time</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Xem lịch sử chat</h4>
              <p>Truy cập tab "Lịch sử" để xem lại các cuộc trò chuyện</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Details -->
      <div class="technical-section">
        <h3>🔧 Chi tiết kỹ thuật</h3>
        <div class="tech-grid">
          <div class="tech-item">
            <h4>Frontend</h4>
            <ul>
              <li>Angular 17+</li>
              <li>TypeScript</li>
              <li>WebSocket (STOMP)</li>
              <li>Responsive CSS</li>
            </ul>
          </div>
          
          <div class="tech-item">
            <h4>Backend</h4>
            <ul>
              <li>Spring Boot</li>
              <li>WebSocket Support</li>
              <li>JPA/Hibernate</li>
              <li>REST API</li>
            </ul>
          </div>
          
          <div class="tech-item">
            <h4>Database</h4>
            <ul>
              <li>MySQL/PostgreSQL</li>
              <li>Chat table</li>
              <li>User table</li>
              <li>Message indexing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .features-showcase {
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .showcase-header {
      text-align: center;
      margin-bottom: 40px;
      color: white;
    }

    .showcase-header h2 {
      font-size: 3rem;
      margin: 0 0 10px 0;
      font-weight: 700;
    }

    .showcase-header p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin: 0;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
      margin-bottom: 50px;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }

    .feature-icon {
      font-size: 3rem;
      text-align: center;
      margin-bottom: 20px;
    }

    .feature-card h3 {
      text-align: center;
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .feature-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .feature-card li {
      padding: 8px 0;
      color: #555;
      font-size: 0.95rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .feature-card li:last-child {
      border-bottom: none;
    }

    .usage-section, .technical-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .usage-section h3, .technical-section h3 {
      margin: 0 0 30px 0;
      color: #333;
      font-size: 2rem;
      text-align: center;
    }

    .usage-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }

    .step-number {
      background: linear-gradient(45deg, #007bff, #0056b3);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .step-content h4 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.2rem;
    }

    .step-content p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }

    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
    }

    .tech-item {
      background: #f8f9fa;
      border-radius: 15px;
      padding: 25px;
      border-left: 4px solid #007bff;
    }

    .tech-item h4 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 1.3rem;
    }

    .tech-item ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .tech-item li {
      padding: 5px 0;
      color: #555;
      font-size: 0.9rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .showcase-header h2 {
        font-size: 2rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .usage-steps {
        grid-template-columns: 1fr;
      }

      .tech-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FeaturesComponent implements OnInit {

  ngOnInit(): void {
    // Component initialization
  }
}

