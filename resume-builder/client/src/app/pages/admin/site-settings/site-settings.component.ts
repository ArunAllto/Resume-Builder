import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

interface SiteSettings {
  general: {
    siteName: string;
    tagline: string;
    heroTitle: string;
    heroSubtitle: string;
    maintenanceMode: boolean;
  };
  branding: {
    primaryColor: string;
    logoUrl: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
  };
  announcement: {
    enabled: boolean;
    text: string;
    bgColor: string;
    linkUrl: string;
    dismissible: boolean;
  };
}

@Component({
  selector: 'app-site-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './site-settings.component.html',
  styleUrl: './site-settings.component.scss',
})
export class SiteSettingsComponent implements OnInit {
  activeTab: 'general' | 'branding' | 'contact' | 'social' | 'announcement' = 'general';
  isLoading = true;
  isSaving = false;
  errorMessage = '';

  settings: SiteSettings = this.getDefaults();

  private originalSettings: SiteSettings = this.getDefaults();

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  private getDefaults(): SiteSettings {
    return {
      general: {
        siteName: '',
        tagline: '',
        heroTitle: '',
        heroSubtitle: '',
        maintenanceMode: false,
      },
      branding: {
        primaryColor: '#4f46e5',
        logoUrl: '',
      },
      contact: {
        email: '',
        phone: '',
        address: '',
      },
      social: {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        youtube: '',
      },
      announcement: {
        enabled: false,
        text: '',
        bgColor: '#4f46e5',
        linkUrl: '',
        dismissible: true,
      },
    };
  }

  loadSettings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.get<SiteSettings>('/settings').subscribe({
      next: (data) => {
        this.settings = { ...this.getDefaults(), ...data };
        this.originalSettings = JSON.parse(JSON.stringify(this.settings));
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load settings.';
        this.isLoading = false;
        this.toast.error('Failed to load settings');
      },
    });
  }

  saveSettings(): void {
    this.isSaving = true;

    this.api.put<SiteSettings>('/settings', this.settings).subscribe({
      next: (data) => {
        this.settings = { ...this.getDefaults(), ...data };
        this.originalSettings = JSON.parse(JSON.stringify(this.settings));
        this.isSaving = false;
        this.toast.success('Settings saved successfully');
      },
      error: (err) => {
        this.isSaving = false;
        this.toast.error('Failed to save settings: ' + (err.error?.error || 'Unknown error'));
      },
    });
  }

  resetSettings(): void {
    this.settings = JSON.parse(JSON.stringify(this.originalSettings));
    this.toast.info('Settings reset to last saved state');
  }

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }
}
