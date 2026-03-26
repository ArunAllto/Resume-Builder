import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  userDropdownOpen = false;
  currentUser: User | null = null;
  private sub?: Subscription;

  constructor(public userService: UserService) {}

  ngOnInit(): void {
    this.sub = this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleUserDropdown(): void {
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  logout(): void {
    this.userService.logout();
    this.userDropdownOpen = false;
  }

  getInitials(): string {
    if (!this.currentUser?.fullName) return '?';
    return this.currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
