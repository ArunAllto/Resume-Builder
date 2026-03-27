import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface SiteSettings {
  siteName?: string;
  tagline?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  maintenanceMode?: boolean;
  primaryColor?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  announcementEnabled?: boolean;
  announcementText?: string;
  announcementColor?: string;
  announcementLink?: string;
  announcementDismissible?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<SiteSettings | null>(null);
  settings$ = this.settingsSubject.asObservable();

  constructor(private api: ApiService) {
    this.fetchSettings();
  }

  getSettings(): SiteSettings | null {
    return this.settingsSubject.value;
  }

  refreshSettings(): void {
    this.fetchSettings();
  }

  private fetchSettings(): void {
    this.api.get<SiteSettings>('/settings').subscribe({
      next: (data) => this.settingsSubject.next(data),
      error: () => this.settingsSubject.next(null),
    });
  }
}
