import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeData, defaultResumeData } from '../../core/models/resume.model';

@Component({
  selector: 'app-minimal-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minimal-template.component.html',
  styleUrls: ['./minimal-template.component.scss'],
})
export class MinimalTemplateComponent {
  @Input() data: ResumeData = defaultResumeData;

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  formatDateRange(start: string, end: string, current?: boolean): string {
    const s = this.formatDate(start);
    const e = current ? 'Present' : this.formatDate(end);
    if (!s && !e) return '';
    return `${s} – ${e}`;
  }
}
