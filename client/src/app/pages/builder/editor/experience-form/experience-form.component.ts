import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Experience } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-experience-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './experience-form.component.html',
  styleUrls: ['./experience-form.component.scss'],
})
export class ExperienceFormComponent {
  @Input() data: Experience[] = [];
  @Output() dataChange = new EventEmitter<Experience[]>();
  @Input() onAIEnhance!: (type: string, text: string) => Promise<string>;

  expandedIndex: number | null = 0;
  enhancingIndex: number | null = null;

  toggleExpand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  addExperience(): void {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      highlights: [],
    };
    this.data = [...this.data, newExp];
    this.expandedIndex = this.data.length - 1;
    this.emitChange();
  }

  removeExperience(index: number): void {
    this.data = this.data.filter((_, i) => i !== index);
    if (this.expandedIndex === index) {
      this.expandedIndex = null;
    } else if (this.expandedIndex !== null && this.expandedIndex > index) {
      this.expandedIndex--;
    }
    this.emitChange();
  }

  addHighlight(expIndex: number): void {
    this.data[expIndex].highlights = [...this.data[expIndex].highlights, ''];
    this.emitChange();
  }

  removeHighlight(expIndex: number, hlIndex: number): void {
    this.data[expIndex].highlights = this.data[expIndex].highlights.filter(
      (_, i) => i !== hlIndex
    );
    this.emitChange();
  }

  updateHighlight(expIndex: number, hlIndex: number, value: string): void {
    this.data[expIndex].highlights[hlIndex] = value;
    this.emitChange();
  }

  async enhanceDescription(index: number): Promise<void> {
    if (!this.onAIEnhance || !this.data[index].description.trim()) return;
    this.enhancingIndex = index;
    try {
      const enhanced = await this.onAIEnhance('experience', this.data[index].description);
      this.data[index].description = enhanced;
      this.emitChange();
    } catch (err) {
      console.error('AI enhance failed:', err);
    } finally {
      this.enhancingIndex = null;
    }
  }

  onCurrentChange(index: number): void {
    if (this.data[index].current) {
      this.data[index].endDate = '';
    }
    this.emitChange();
  }

  emitChange(): void {
    this.dataChange.emit([...this.data]);
  }

  getEntryTitle(exp: Experience): string {
    if (exp.position && exp.company) return `${exp.position} at ${exp.company}`;
    if (exp.position) return exp.position;
    if (exp.company) return exp.company;
    return 'New Experience';
  }

  trackByIndex(index: number): number {
    return index;
  }
}
