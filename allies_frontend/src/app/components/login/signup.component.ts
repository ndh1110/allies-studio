import { Component, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  form = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  showContact: boolean = false;     // <-- thêm
  hideContact(): void { this.showContact = false; } // <-- thêm
  showSocials = false;
  toggleSocials(){ this.showSocials = !this.showSocials; }

  // đánh dấu đã tương tác để hiện hint hợp lý
  touch = { email: false, password: false, confirm: false };

  private _loading = signal(false);
  private _error = signal<string | null>(null);
  isLoading() { return this._loading(); }
  errorMessage() { return this._error(); }

  // ===== Validators =====
  // email chuẩn RFC đơn giản
  private emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // rules mật khẩu
  get hasMinLength() { return this.form.password.length >= 8; }
  get hasUpper()     { return /[A-Z]/.test(this.form.password); }
  get hasLower()     { return /[a-z]/.test(this.form.password); }
  get hasDigit()     { return /\d/.test(this.form.password); }

  get emailValid()        { return this.emailRegex.test(this.form.email.trim()); }
  get passwordValid()     { return this.hasMinLength && this.hasUpper && this.hasLower && this.hasDigit; }
  get passwordsMatch()    { return !!this.form.password && this.form.password === this.form.confirmPassword; }

  // form hợp lệ tổng thể
  get formValid() {
    return !!this.form.username.trim()
        && this.emailValid
        && this.passwordValid
        && this.passwordsMatch;
  }

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.isLoading() || !this.formValid) return;

    this._loading.set(true);
    this._error.set(null);

    const payload = {
      username: this.form.username.trim(),
      email: this.form.email.trim(),
      password: this.form.password
    };

    // Gọi API đăng ký (đổi tên hàm cho khớp service của bạn nếu cần)
    this.auth.signup(payload).subscribe({
      next: () => {
        this._loading.set(false);
        // sau khi tạo xong, chuyển sang login
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this._loading.set(false);
        const msg = err?.error?.message || 'Sign up failed. Please try again.';
        this._error.set(msg);
      }
    });
  }
}
