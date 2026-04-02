import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, LoginRequest, SignupRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl + '/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public isAuthenticated = signal(false);

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('Sending login request:', credentials);
    console.log('API URL:', `${this.API_URL}/login`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials, { headers }).pipe(
      tap((response) => {
        console.log('Login response:', response);
        this.setCurrentUser({
          id: response.id,
          tenDn: response.username, // Map username from backend to tenDn in frontend
          email: '', // Default empty email
          avatar: 'default-avatar.png',
        });
        localStorage.setItem('token', response.token);
        this.isAuthenticated.set(true);
      })
    );
  }

  signup(userData: SignupRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/signup`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    // Store user in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private loadStoredUser(): void {
    const token = this.getToken();
    if (token) {
      // Try to get user from localStorage first
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
          this.isAuthenticated.set(true);
          return;
        } catch (error) {
          console.error('Error parsing stored user:', error);
          // Clear invalid data
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
        }
      }
      
      // If no valid stored user, clear everything
      this.logout();
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
