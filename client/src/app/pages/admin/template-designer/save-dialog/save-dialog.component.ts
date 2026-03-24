import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ArtboardElement } from '../../../../core/models/artboard.model';
import { ApiService } from '../../../../core/services/api.service';

interface TemplateCategory {
  value: string;
  label: string;
}

@Component({
  selector: 'app-save-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './save-dialog.component.html',
  styleUrls: ['./save-dialog.component.scss'],
})
export class SaveDialogComponent implements OnInit {
  @Input() elements: ArtboardElement[] = [];
  @Input() artboardWidth = 724;
  @Input() artboardHeight = 1024;
  @Input() templateName = '';
  @Output() saved = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  private api = inject(ApiService);

  name = '';
  description = '';
  category = 'professional';
  isActive = true;
  isPublished = false;
  thumbnailUrl = '';
  isSaving = false;
  saveSuccess = false;
  errorMessage = '';

  categories: TemplateCategory[] = [
    { value: 'professional', label: 'Professional' },
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'creative', label: 'Creative' },
  ];

  ngOnInit(): void {
    this.name = this.templateName || '';
    this.generateThumbnail();
  }

  private generateThumbnail(): void {
    // Generate a placeholder gradient thumbnail based on category
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const gradients: Record<string, [string, string]> = {
      professional: ['#1e3a5f', '#4a90d9'],
      modern: ['#6366f1', '#a855f7'],
      minimal: ['#f8fafc', '#e2e8f0'],
      creative: ['#f59e0b', '#ef4444'],
    };
    const [c1, c2] = gradients[this.category] || gradients['professional'];
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw placeholder content lines
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(30, 40, 140, 14);
    ctx.fillRect(30, 65, 240, 8);
    ctx.fillRect(30, 80, 200, 8);
    ctx.fillRect(30, 95, 220, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(30, 130, 240, 60);
    ctx.fillRect(30, 210, 240, 40);
    ctx.fillRect(30, 270, 240, 40);

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Template Preview', 30, canvas.height - 20);

    this.thumbnailUrl = canvas.toDataURL('image/png');
  }

  extractPrimaryColor(): string {
    for (const el of this.elements) {
      if (el.type === 'text' && el.textColor) {
        return el.textColor;
      }
    }
    return '#333333';
  }

  extractFontFamily(): string {
    for (const el of this.elements) {
      if (el.type === 'text' && el.fontFamily) {
        return el.fontFamily;
      }
    }
    return 'Inter';
  }

  async save(): Promise<void> {
    if (!this.name.trim()) {
      this.errorMessage = 'Template name is required.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.saveSuccess = false;

    try {
      // Generate thumbnail
      if (!this.thumbnailUrl) {
        this.generateThumbnail();
      }

      const payload = {
        name: this.name.trim(),
        description: this.description.trim(),
        category: this.category,
        thumbnail: this.thumbnailUrl,
        isActive: this.isActive,
        isPublished: this.isPublished,
        layoutConfig: {
          canvasData: JSON.stringify({
            artboardWidth: this.artboardWidth,
            artboardHeight: this.artboardHeight,
            elements: this.elements,
          }),
          primaryColor: this.extractPrimaryColor(),
          fontFamily: this.extractFontFamily(),
          layout: 'canvas-designed',
          showPhoto: false,
          fontSize: 11,
          sectionOrder: ['summary', 'experience', 'education', 'skills'],
          secondaryColor: '#333333',
        },
      };

      await firstValueFrom(
        this.api.post<any>('/templates', payload)
      );

      this.saveSuccess = true;

      setTimeout(() => {
        this.saved.emit();
      }, 1200);
    } catch (err: unknown) {
      const error = err as { error?: { error?: string; message?: string } };
      this.errorMessage =
        error?.error?.error ||
        error?.error?.message ||
        'Failed to save template. Please try again.';
      console.error('Save error:', err);
    } finally {
      this.isSaving = false;
    }
  }

  onCategoryChange(): void {
    this.generateThumbnail();
  }

  onClose(): void {
    this.close.emit();
  }
}
