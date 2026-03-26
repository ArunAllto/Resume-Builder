import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DraftService } from '../../core/services/draft.service';
import { ToastService } from '../../shared/services/toast.service';
import { DraftItem } from '../../core/models/draft.model';

@Component({
  selector: 'app-my-drafts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-drafts.component.html',
  styleUrls: ['./my-drafts.component.scss']
})
export class MyDraftsComponent implements OnInit {
  drafts: DraftItem[] = [];
  maxDrafts = 5;
  loading = true;
  error = '';

  constructor(
    private draftService: DraftService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDrafts();
  }

  loadDrafts(): void {
    this.loading = true;
    this.draftService.getMyDrafts().subscribe({
      next: (data: any) => {
        // Handle both wrapped and direct responses
        if (Array.isArray(data)) {
          this.drafts = data;
        } else if (data?.data) {
          this.drafts = data.data;
          if (data.maxDrafts) this.maxDrafts = data.maxDrafts;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load drafts';
        this.toast.error('Failed to load drafts');
      }
    });
  }

  editDraft(draft: DraftItem): void {
    this.router.navigate(['/builder', draft.templateId], { queryParams: { resumeId: draft.id } });
  }

  deleteDraft(draft: DraftItem): void {
    if (!confirm(`Delete "${draft.title}"? This cannot be undone.`)) return;
    this.draftService.deleteDraft(draft.id).subscribe({
      next: () => {
        this.drafts = this.drafts.filter(d => d.id !== draft.id);
        this.toast.success('Draft deleted');
      },
      error: () => this.toast.error('Failed to delete draft')
    });
  }

  timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }

  getCategoryColor(cat: string): string {
    const colors: Record<string, string> = {
      professional: '#1a365d', modern: '#6366f1', minimal: '#111827', creative: '#dc2626'
    };
    return colors[cat] || '#64748b';
  }
}
