import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent implements OnInit {
  sidebarCollapsed = false;
  unreadContactCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.api.get<{ count: number }>('/contact/unread-count').subscribe({
      next: (data) => (this.unreadContactCount = data?.count ?? 0),
      error: () => {},
    });
  }

  get adminEmail(): string {
    return this.authService.getEmail() || 'admin@example.com';
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
