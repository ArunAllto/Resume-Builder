import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly TOKEN_KEY = 'user_token';
  private readonly PROFILE_KEY = 'user_profile';

  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private api: ApiService) {
    // Hydrate from localStorage
    const profile = localStorage.getItem(this.PROFILE_KEY);
    if (profile && this.getToken()) {
      try { this.currentUser$.next(JSON.parse(profile)); } catch {}
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/user/register', data).pipe(
      tap(res => this.saveAuth(res))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/user/login', data).pipe(
      tap(res => this.saveAuth(res))
    );
  }

  googleAuth(idToken: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/user/google-auth', { idToken }).pipe(
      tap(res => this.saveAuth(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.PROFILE_KEY);
    this.currentUser$.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    return this.currentUser$.value;
  }

  private saveAuth(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(res.user));
    this.currentUser$.next(res.user);
  }
}
