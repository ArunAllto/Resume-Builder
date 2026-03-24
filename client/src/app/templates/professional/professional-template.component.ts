import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeData, defaultResumeData } from '../../core/models/resume.model';

@Component({
  selector: 'app-professional-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professional-template.component.html',
  styleUrls: ['./professional-template.component.scss'],
})
export class ProfessionalTemplateComponent {
  @Input() data: ResumeData = defaultResumeData;

  get groupedSkills(): Record<string, typeof this.data.skills> {
    const groups: Record<string, typeof this.data.skills> = {};
    for (const skill of this.data.skills) {
      const cat = skill.category || 'Other';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(skill);
    }
    return groups;
  }

  get skillCategories(): string[] {
    return Object.keys(this.groupedSkills);
  }

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
