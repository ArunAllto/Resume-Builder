import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillItem } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-skills-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skills-form.component.html',
  styleUrls: ['./skills-form.component.scss'],
})
export class SkillsFormComponent {
  @Input() data: SkillItem[] = [];
  @Output() dataChange = new EventEmitter<SkillItem[]>();

  newSkillName = '';
  newSkillCategory = 'Technical';
  newSkillLevel: SkillItem['level'] = 'intermediate';

  categories = ['Technical', 'Soft Skills', 'Tools', 'Languages', 'Other'];
  levels: { value: SkillItem['level']; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ];

  quickSuggestions: { name: string; category: string }[] = [
    { name: 'JavaScript', category: 'Technical' },
    { name: 'TypeScript', category: 'Technical' },
    { name: 'Python', category: 'Technical' },
    { name: 'React', category: 'Technical' },
    { name: 'Angular', category: 'Technical' },
    { name: 'Node.js', category: 'Technical' },
    { name: 'SQL', category: 'Technical' },
    { name: 'Git', category: 'Tools' },
    { name: 'Docker', category: 'Tools' },
    { name: 'AWS', category: 'Tools' },
    { name: 'Figma', category: 'Tools' },
    { name: 'Leadership', category: 'Soft Skills' },
    { name: 'Communication', category: 'Soft Skills' },
    { name: 'Problem Solving', category: 'Soft Skills' },
    { name: 'Teamwork', category: 'Soft Skills' },
  ];

  get groupedSkills(): Record<string, SkillItem[]> {
    const groups: Record<string, SkillItem[]> = {};
    for (const skill of this.data) {
      const cat = skill.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    }
    return groups;
  }

  get groupedCategories(): string[] {
    return Object.keys(this.groupedSkills);
  }

  get availableSuggestions(): { name: string; category: string }[] {
    const existing = new Set(this.data.map((s) => s.name.toLowerCase()));
    return this.quickSuggestions.filter((s) => !existing.has(s.name.toLowerCase()));
  }

  addSkill(): void {
    if (!this.newSkillName.trim()) return;

    const newSkill: SkillItem = {
      id: crypto.randomUUID(),
      name: this.newSkillName.trim(),
      category: this.newSkillCategory,
      level: this.newSkillLevel,
    };

    this.data = [...this.data, newSkill];
    this.newSkillName = '';
    this.emitChange();
  }

  addQuickSkill(suggestion: { name: string; category: string }): void {
    const newSkill: SkillItem = {
      id: crypto.randomUUID(),
      name: suggestion.name,
      category: suggestion.category,
      level: 'intermediate',
    };
    this.data = [...this.data, newSkill];
    this.emitChange();
  }

  removeSkill(id: string): void {
    this.data = this.data.filter((s) => s.id !== id);
    this.emitChange();
  }

  emitChange(): void {
    this.dataChange.emit([...this.data]);
  }

  getLevelColor(level: string): string {
    const colors: Record<string, string> = {
      beginner: '#f59e0b',
      intermediate: '#3b82f6',
      advanced: '#8b5cf6',
      expert: '#10b981',
    };
    return colors[level] || '#6b7280';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      Technical: '#2563eb',
      'Soft Skills': '#7c3aed',
      Tools: '#059669',
      Languages: '#d97706',
      Other: '#6b7280',
    };
    return colors[category] || '#6b7280';
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSkill();
    }
  }
}
