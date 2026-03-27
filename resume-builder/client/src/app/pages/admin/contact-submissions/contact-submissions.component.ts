import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-contact-submissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-submissions.component.html',
  styleUrl: './contact-submissions.component.scss',
})
export class ContactSubmissionsComponent implements OnInit {
  submissions: ContactSubmission[] = [];
  isLoading = true;
  filter: 'all' | 'unread' | 'read' = 'all';
  expandedId: string | null = null;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.isLoading = true;
    this.api.get<ContactSubmission[]>('/contact/submissions').subscribe({
      next: (data) => {
        this.submissions = data;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load contact submissions');
        this.isLoading = false;
      },
    });
  }

  get filteredSubmissions(): ContactSubmission[] {
    if (this.filter === 'unread') return this.submissions.filter((s) => !s.isRead);
    if (this.filter === 'read') return this.submissions.filter((s) => s.isRead);
    return this.submissions;
  }

  get unreadCount(): number {
    return this.submissions.filter((s) => !s.isRead).length;
  }

  get readCount(): number {
    return this.submissions.filter((s) => s.isRead).length;
  }

  setFilter(f: 'all' | 'unread' | 'read'): void {
    this.filter = f;
    this.expandedId = null;
  }

  toggleExpand(submission: ContactSubmission): void {
    if (this.expandedId === submission._id) {
      this.expandedId = null;
    } else {
      this.expandedId = submission._id;
      if (!submission.isRead) {
        this.markAsRead(submission);
      }
    }
  }

  markAsRead(submission: ContactSubmission): void {
    if (submission.isRead) return;
    this.api.put<any>(`/contact/submissions/${submission._id}/read`).subscribe({
      next: () => {
        submission.isRead = true;
      },
      error: () => this.toast.error('Failed to mark as read'),
    });
  }

  toggleReadStatus(submission: ContactSubmission, event: Event): void {
    event.stopPropagation();
    this.api.put<any>(`/contact/submissions/${submission._id}/read`).subscribe({
      next: () => {
        submission.isRead = !submission.isRead;
      },
      error: () => this.toast.error('Failed to update status'),
    });
  }

  deleteSubmission(submission: ContactSubmission, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Delete this submission from "${submission.name}"?`)) return;
    this.api.delete(`/contact/submissions/${submission._id}`).subscribe({
      next: () => {
        this.submissions = this.submissions.filter((s) => s._id !== submission._id);
        if (this.expandedId === submission._id) this.expandedId = null;
        this.toast.success('Submission deleted');
      },
      error: () => this.toast.error('Failed to delete submission'),
    });
  }
}
