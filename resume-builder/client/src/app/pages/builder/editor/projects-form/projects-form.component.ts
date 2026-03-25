import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-projects-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-form.component.html',
  styleUrls: ['./projects-form.component.scss'],
})
export class ProjectsFormComponent {
  @Input() data: Project[] = [];
  @Output() dataChange = new EventEmitter<Project[]>();

  expandedIndex: number | null = 0;
  newTechInputs: Record<number, string> = {};

  toggleExpand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  addProject(): void {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      technologies: [],
      url: '',
      startDate: '',
      endDate: '',
    };
    this.data = [...this.data, newProj];
    this.expandedIndex = this.data.length - 1;
    this.emitChange();
  }

  removeProject(index: number): void {
    this.data = this.data.filter((_, i) => i !== index);
    if (this.expandedIndex === index) {
      this.expandedIndex = null;
    } else if (this.expandedIndex !== null && this.expandedIndex > index) {
      this.expandedIndex--;
    }
    this.emitChange();
  }

  addTechnology(projIndex: number): void {
    const tech = (this.newTechInputs[projIndex] || '').trim();
    if (!tech) return;
    this.data[projIndex].technologies = [...this.data[projIndex].technologies, tech];
    this.newTechInputs[projIndex] = '';
    this.emitChange();
  }

  removeTechnology(projIndex: number, techIndex: number): void {
    this.data[projIndex].technologies = this.data[projIndex].technologies.filter(
      (_, i) => i !== techIndex
    );
    this.emitChange();
  }

  onTechKeydown(event: KeyboardEvent, projIndex: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTechnology(projIndex);
    }
  }

  emitChange(): void {
    this.dataChange.emit([...this.data]);
  }

  getEntryTitle(proj: Project): string {
    return proj.name || 'New Project';
  }
}
