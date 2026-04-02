import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-900">
      <div class="max-w-xl w-full space-y-8 p-6 bg-gray-800 rounded-lg shadow-lg mx-auto">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-white mb-2">Chào mừng đến với Allies</h2>
          <p class="text-gray-200">{{ isSignupMode() ? 'Tạo tài khoản mới' : 'Đăng nhập vào tài khoản của bạn' }}</p>
        </div>

        <div class="card">
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="form-group">
              <label for="username" class="form-label text-white">Tên người dùng</label>
              <input
                id="username"
                name="username"
                type="text"
                [(ngModel)]="loginForm.username"
                required
                class="form-input w-full"
                placeholder="Nhập tên người dùng"
              />
            </div>

            <div class="form-group">
              <label for="password" class="form-label text-white">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                [(ngModel)]="loginForm.password"
                required
                class="form-input w-full"
                placeholder="Nhập mật khẩu"
              />
            </div>

            @if (errorMessage()) {
            <div class="text-error text-sm text-red-500">{{ errorMessage() }}</div>
            }

            <button type="submit" [disabled]="isLoading()" class="btn btn-primary w-full py-2">
              @if (isLoading()) {
              <span class="animate-pulse">{{ isSignupMode() ? 'Đang tạo tài khoản...' : 'Đang đăng nhập...' }}</span>
              } @else { 
                {{ isSignupMode() ? 'Đăng ký' : 'Đăng nhập' }}
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              {{ isSignupMode() ? 'Đã có tài khoản?' : 'Bạn chưa có tài khoản?' }}
              <button (click)="toggleMode()" class="text-blue-400 hover:underline cursor-pointer">
                {{ isSignupMode() ? 'Đăng nhập' : 'Đăng ký' }}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .min-h-screen {
        min-height: 100vh;
        width: 100%; /* Đảm bảo chiếm toàn bộ chiều rộng */
      }

      .w-full {
        width: 100%;
      }

      .max-w-xl {
        max-width: 36rem; /* Giữ nguyên kích thước "căng" */
      }

      .space-y-8 > * + * {
        margin-top: 2rem;
      }

      .space-y-6 > * + * {
        margin-top: 1.5rem;
      }

      .form-input {
        @apply w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500;
      }

      .form-label {
        @apply block text-sm font-medium mb-1;
      }

      .form-group {
        @apply space-y-2;
      }

      .card {
        @apply bg-gray-800 p-6 rounded-lg shadow-md;
      }

      .btn {
        @apply font-medium rounded-md text-white focus:outline-none;
      }

      .btn-primary {
        @apply bg-blue-600 hover:bg-blue-700;
      }

      .btn:disabled {
        @apply bg-gray-500 cursor-not-allowed;
      }

      /* Thêm class mx-auto để căn giữa */
      .mx-auto {
        margin-left: auto;
        margin-right: auto;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: LoginRequest = { username: '', password: '' };
  isLoading = signal(false);
  errorMessage = signal('');
  isSignupMode = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.isSignupMode()) {
      this.signup();
    } else {
      this.login();
    }
  }

  login(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.error);
        
        // Lấy thông báo lỗi từ server nếu có
        let errorMsg = 'Tên người dùng hoặc mật khẩu không hợp lệ';
        if (error.error && typeof error.error === 'string') {
          errorMsg = error.error;
        } else if (error.error && error.error.message) {
          errorMsg = error.error.message;
        }
        
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      },
    });
  }

  signup(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.signup(this.loginForm).subscribe({
      next: () => {
        this.errorMessage.set('');
        this.login();
      },
      error: (error) => {
        this.errorMessage.set('Tên người dùng đã tồn tại hoặc dữ liệu không hợp lệ');
        this.isLoading.set(false);
      },
    });
  }

  toggleMode(): void {
    this.isSignupMode.set(!this.isSignupMode());
    this.errorMessage.set('');
    this.loginForm = { username: '', password: '' };
  }
}
