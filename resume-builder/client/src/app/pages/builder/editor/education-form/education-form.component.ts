import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Education } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-education-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './education-form.component.html',
  styleUrls: ['./education-form.component.scss'],
})
export class EducationFormComponent {
  @Input() data: Education[] = [];
  @Output() dataChange = new EventEmitter<Education[]>();

  expandedIndex: number | null = 0;

  toggleExpand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  addEducation(): void {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      highlights: [],
    };
    this.data = [...this.data, newEdu];
    this.expandedIndex = this.data.length - 1;
    this.emitChange();
  }

  removeEducation(index: number): void {
    this.data = this.data.filter((_, i) => i !== index);
    if (this.expandedIndex === index) {
      this.expandedIndex = null;
    } else if (this.expandedIndex !== null && this.expandedIndex > index) {
      this.expandedIndex--;
    }
    this.emitChange();
  }

  addHighlight(eduIndex: number): void {
    this.data[eduIndex].highlights = [...this.data[eduIndex].highlights, ''];
    this.emitChange();
  }

  removeHighlight(eduIndex: number, hlIndex: number): void {
    this.data[eduIndex].highlights = this.data[eduIndex].highlights.filter(
      (_, i) => i !== hlIndex
    );
    this.emitChange();
  }

  updateHighlight(eduIndex: number, hlIndex: number, value: string): void {
    this.data[eduIndex].highlights[hlIndex] = value;
    this.emitChange();
  }

  emitChange(): void {
    this.dataChange.emit([...this.data]);
  }

  getEntryTitle(edu: Education): string {
    if (edu.degree && edu.institution) return `${edu.degree} - ${edu.institution}`;
    if (edu.degree) return edu.degree;
    if (edu.institution) return edu.institution;
    return 'New Education';
  }
}
