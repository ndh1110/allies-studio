import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, LoginRequest, SignupRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = environment.apiUrl + '/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public isAuthenticated = signal(false);

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  // --- LOGIN: gọi API và chuẩn hoá lưu session ---
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((res) => this.setSessionFromLoginResponse(res))
    );
  }

  // --- LOGOUT ---
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }

  // --- Helpers chung ---
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /** Dùng ở mọi nơi (ví dụ tab Kết bạn) */
  getCurrentUserId(): number {
    return Number(localStorage.getItem('userId') ?? 0);
  }

  /** Chuẩn hoá cách lưu token + user sau login (API của bạn đã trả id, username) */
  private setSessionFromLoginResponse(res: AuthResponse) {
    // Lưu token + thông tin user tối thiểu
    localStorage.setItem('token', res.token);
    localStorage.setItem('userId', String(res.id));
    localStorage.setItem('username', res.username ?? '');

    // Cập nhật state đang dùng trong app
    this.setCurrentUser({
      id: res.id,
      username: res.username,
      avatar: 'default-avatar.png',
    });
    this.isAuthenticated.set(true);
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  /** Khởi động app/refresh trang: đọc lại từ localStorage */
  private loadStoredUser(): void {
    const token = this.getToken();
    const uid = Number(localStorage.getItem('userId') ?? 0);
    const uname = localStorage.getItem('username') ?? '';

    if (token && uid > 0 && uname) {
      this.setCurrentUser({
        id: uid,
        username: uname,
        avatar: 'default-avatar.png',
      });
      this.isAuthenticated.set(true);
    } else {
      this.currentUserSubject.next(null);
      this.isAuthenticated.set(false);
    }
  }

  // --- SIGNUP (giữ nguyên cách bạn đang dùng) ---
  signup(userData: SignupRequest) {
    return this.http.post(`${this.API_URL}/signup`, userData, {
      responseType: 'text' as 'json'
    });
  }
}
