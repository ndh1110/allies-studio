import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive], // cần RouterLink cho link "Sign up"
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // giữ đúng kiểu dữ liệu cũ
  loginForm = { username: '', password: '' };
  showContact: boolean = false;     // <-- thêm
  hideContact(): void { this.showContact = false; } // <-- thêm
  showSocials = false;
  toggleSocials(){ this.showSocials = !this.showSocials; }

  // giữ cách dùng signals cũ cho template: @if (errorMessage()) ...
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  isLoading() { return this._loading(); }
  errorMessage() { return this._error(); }

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this._loading()) return;

    const payload: LoginRequest = {
      username: this.loginForm.username?.trim(),
      password: this.loginForm.password
    };

    if (!payload.username || !payload.password) {
      this._error.set('Please enter username & password');
      return;
    }

    
    this._loading.set(true);
    this._error.set(null);

    // gọi API thật từ service cũ của bạn
    this.auth.login(payload).subscribe({
      next: (res: any) => {
        // lấy token theo response cũ của bạn
        const token =
          res?.token ??
          res?.data?.token ??
          res?.result?.accessToken;

        if (token) localStorage.setItem('access_token', token);
        this._loading.set(false);

        // điều hướng về trang chính (đổi '/home' nếu route của bạn khác)
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this._loading.set(false);
        const msg = err?.error?.message || 'Invalid username or password';
        this._error.set(msg);
      }
    });
  }
}
