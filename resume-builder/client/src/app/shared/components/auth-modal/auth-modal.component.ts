import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() templateId = '';
  @Output() authenticated = new EventEmitter<User>();
  @Output() closed = new EventEmitter<void>();

  activeTab: 'login' | 'register' = 'login';
  loading = false;
  error = '';

  // Login fields
  loginEmail = '';
  loginPassword = '';

  // Register fields
  regName = '';
  regEmail = '';
  regPassword = '';
  regConfirmPassword = '';

  private googleScriptLoaded = false;

  constructor(private userService: UserService, private toast: ToastService) {}

  ngOnChanges(): void {
    if (this.visible) {
      this.error = '';
      this.loadGoogleScript();
    }
  }

  close(): void {
    this.closed.emit();
  }

  onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.error = 'Please fill in all fields';
      return;
    }
    this.loading = true;
    this.error = '';
    this.userService.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success('Welcome back!');
        this.authenticated.emit(res.user);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || 'Login failed';
      }
    });
  }

  onRegister(): void {
    if (!this.regName || !this.regEmail || !this.regPassword) {
      this.error = 'Please fill in all fields';
      return;
    }
    if (this.regPassword !== this.regConfirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    if (this.regPassword.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }
    this.loading = true;
    this.error = '';
    this.userService.register({ fullName: this.regName, email: this.regEmail, password: this.regPassword }).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success('Account created successfully!');
        this.authenticated.emit(res.user);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || 'Registration failed';
      }
    });
  }

  onGoogleSignIn(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.prompt();
    } else {
      this.error = 'Google Sign-In not available. Please try email login.';
    }
  }

  private loadGoogleScript(): void {
    if (this.googleScriptLoaded) return;
    const existing = document.getElementById('google-gsi-script');
    if (existing) { this.googleScriptLoaded = true; this.initGoogle(); return; }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => { this.googleScriptLoaded = true; this.initGoogle(); };
    document.head.appendChild(script);
  }

  private initGoogle(): void {
    if (typeof google === 'undefined' || !google.accounts) return;
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        this.loading = true;
        this.userService.googleAuth(response.credential).subscribe({
          next: (res) => {
            this.loading = false;
            this.toast.success('Signed in with Google!');
            this.authenticated.emit(res.user);
          },
          error: (err) => {
            this.loading = false;
            this.error = err?.error?.error || 'Google sign-in failed';
          }
        });
      }
    });
  }
}
