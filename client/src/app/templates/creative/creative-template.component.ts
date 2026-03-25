import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeData, defaultResumeData } from '../../core/models/resume.model';

@Component({
  selector: 'app-creative-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './creative-template.component.html',
  styleUrls: ['./creative-template.component.scss'],
})
export class CreativeTemplateComponent {
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

  skillLevelDots(level: string): boolean[] {
    const map: Record<string, number> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };
    const filled = map[level] ?? 2;
    return Array.from({ length: 4 }, (_, i) => i < filled);
  }

  proficiencyDots(proficiency: string): boolean[] {
    const map: Record<string, number> = {
      basic: 1,
      conversational: 2,
      proficient: 3,
      fluent: 4,
      native: 5,
    };
    const filled = map[proficiency] ?? 2;
    return Array.from({ length: 5 }, (_, i) => i < filled);
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
