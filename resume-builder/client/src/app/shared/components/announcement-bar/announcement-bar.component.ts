import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, SiteSettings } from '../../../core/services/settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-bar.component.html',
  styleUrl: './announcement-bar.component.scss',
})
export class AnnouncementBarComponent implements OnInit, OnDestroy {
  settings: SiteSettings | null = null;
  dismissed = false;

  private sub?: Subscription;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.dismissed = sessionStorage.getItem('announcement_dismissed') === 'true';
    this.sub = this.settingsService.settings$.subscribe((s) => {
      this.settings = s;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  dismiss(): void {
    this.dismissed = true;
    sessionStorage.setItem('announcement_dismissed', 'true');
  }
}
