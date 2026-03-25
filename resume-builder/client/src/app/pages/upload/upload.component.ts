import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UploadService } from '../../core/services/upload.service';
import { TemplateService } from '../../core/services/template.service';
import { ResumeData } from '../../core/models/resume.model';
import { Template } from '../../core/models/template.model';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent {
  currentStep = 1;
  selectedFile: File | null = null;
  isDragging = false;
  isUploading = false;
  uploadError = '';

  parsedData: ResumeData | null = null;
  templates: Template[] = [];
  selectedTemplateId = '';
  editableSummary = '';

  constructor(
    private uploadService: UploadService,
    private templateService: TemplateService,
    private router: Router,
    private toast: ToastService
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    if (file.type !== 'application/pdf') {
      this.uploadError = 'Only PDF files are accepted. Please select a PDF file.';
      this.selectedFile = null;
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError = 'File size exceeds 10MB limit.';
      this.selectedFile = null;
      this.toast.warning('File size exceeds 10MB limit');
      return;
    }
    this.uploadError = '';
    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadError = '';
  }

  uploadResume(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadError = '';

    this.uploadService.uploadResume(this.selectedFile).subscribe({
      next: (data) => {
        this.parsedData = data;
        this.editableSummary = data.summary || '';
        this.isUploading = false;
        this.currentStep = 2;
        this.loadTemplates();
        this.toast.success('Resume parsed successfully!');
      },
      error: (err) => {
        this.uploadError = err.error?.error || 'Failed to upload and parse resume. Please try again.';
        this.isUploading = false;
        this.toast.error('Failed to parse resume. Please try a different file.');
      },
    });
  }

  loadTemplates(): void {
    this.templateService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        if (templates.length > 0) {
          this.selectedTemplateId = templates[0].id;
        }
      },
      error: () => {},
    });
  }

  selectTemplate(id: string): void {
    this.selectedTemplateId = id;
  }

  goBack(): void {
    this.currentStep = 1;
  }

  get skillsCount(): number {
    return this.parsedData?.skills?.length ?? 0;
  }

  get experienceCount(): number {
    return this.parsedData?.experience?.length ?? 0;
  }

  get educationCount(): number {
    return this.parsedData?.education?.length ?? 0;
  }

  continueToEditor(): void {
    if (!this.parsedData || !this.selectedTemplateId) return;

    const dataToStore = { ...this.parsedData, summary: this.editableSummary };
    localStorage.setItem('uploaded-resume-data', JSON.stringify(dataToStore));
    this.router.navigate(['/builder', this.selectedTemplateId]);
  }
}
