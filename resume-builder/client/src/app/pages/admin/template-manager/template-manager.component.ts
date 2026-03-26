import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TemplateService } from '../../../core/services/template.service';
import { Template, TemplateConfig } from '../../../core/models/template.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-template-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './template-manager.component.html',
  styleUrl: './template-manager.component.scss',
})
export class TemplateManagerComponent implements OnInit {
  // View toggle
  showCreator = false;

  // List state
  templates: Template[] = [];
  isLoading = true;
  errorMessage = '';

  // Creator form state
  isSubmitting = false;
  creatorError = '';
  formName = '';
  formDescription = '';
  formCategory: 'professional' | 'modern' | 'minimal' | 'creative' = 'professional';
  formPrimaryColor = '#4f46e5';
  formSecondaryColor = '#6366f1';
  formFontFamily = 'Inter';
  formLayout: 'single-column' | 'two-column' | 'sidebar' = 'single-column';
  formShowPhoto = false;
  formThumbnail = '';
  formSectionOrder: string[] = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'];

  // Pricing
  formIsFree = true;
  formOriginalPrice: number | null = null;
  formOfferPrice: number | null = null;

  fontFamilies = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Merriweather', 'Playfair Display', 'Source Sans Pro', 'Nunito'];
  categories: Array<'professional' | 'modern' | 'minimal' | 'creative'> = ['professional', 'modern', 'minimal', 'creative'];
  layouts: Array<'single-column' | 'two-column' | 'sidebar'> = ['single-column', 'two-column', 'sidebar'];

  constructor(private templateService: TemplateService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.templateService.getTemplates(true).subscribe({
      next: (templates) => {
        this.templates = templates.map((t) => this.parseLayoutConfig(t));
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load templates.';
        this.isLoading = false;
        this.toast.error('Failed to load templates');
      },
    });
  }

  /** Parse layoutConfig from JSON string if the API returns it as a string */
  private parseLayoutConfig(template: Template): Template {
    if (typeof template.layoutConfig === 'string') {
      try {
        template.layoutConfig = JSON.parse(template.layoutConfig) as TemplateConfig;
      } catch {
        // Leave as-is if parsing fails
      }
    }
    return template;
  }

  toggleActive(template: Template): void {
    this.templateService.updateTemplate(template.id, { isActive: !template.isActive }).subscribe({
      next: () => {
        const idx = this.templates.findIndex((t) => t.id === template.id);
        if (idx !== -1) {
          this.templates[idx] = { ...this.templates[idx], isActive: !template.isActive };
        }
        this.toast.info('Template status updated');
      },
      error: (err) => {
        this.toast.error('Operation failed: ' + (err.error?.error || 'Could not update template status'));
      },
    });
  }

  togglePublish(template: Template): void {
    const newValue = !template.isPublished;
    this.templateService.updateTemplate(template.id, { isPublished: newValue } as Partial<Template>).subscribe({
      next: () => {
        const idx = this.templates.findIndex((t) => t.id === template.id);
        if (idx !== -1) {
          this.templates[idx] = { ...this.templates[idx], isPublished: newValue };
        }
      },
      error: () => {},
    });
  }

  deleteTemplate(template: Template): void {
    if (!window.confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
      return;
    }

    this.templateService.deleteTemplate(template.id).subscribe({
      next: () => {
        this.templates = this.templates.filter((t) => t.id !== template.id);
        this.toast.success('Template deleted');
      },
      error: (err) => {
        this.toast.error('Operation failed: ' + (err.error?.error || 'Could not delete template'));
      },
    });
  }

  showCreatorView(): void {
    this.resetForm();
    this.showCreator = true;
  }

  cancelCreator(): void {
    this.showCreator = false;
    this.resetForm();
  }

  resetForm(): void {
    this.formName = '';
    this.formDescription = '';
    this.formCategory = 'professional';
    this.formPrimaryColor = '#4f46e5';
    this.formSecondaryColor = '#6366f1';
    this.formFontFamily = 'Inter';
    this.formLayout = 'single-column';
    this.formShowPhoto = false;
    this.formThumbnail = '';
    this.formSectionOrder = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'];
    this.formIsFree = true;
    this.formOriginalPrice = null;
    this.formOfferPrice = null;
    this.creatorError = '';
  }

  moveSectionUp(index: number): void {
    if (index <= 0) return;
    const temp = this.formSectionOrder[index];
    this.formSectionOrder[index] = this.formSectionOrder[index - 1];
    this.formSectionOrder[index - 1] = temp;
  }

  moveSectionDown(index: number): void {
    if (index >= this.formSectionOrder.length - 1) return;
    const temp = this.formSectionOrder[index];
    this.formSectionOrder[index] = this.formSectionOrder[index + 1];
    this.formSectionOrder[index + 1] = temp;
  }

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.formThumbnail = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeThumbnail(): void {
    this.formThumbnail = '';
  }

  submitTemplate(): void {
    if (!this.formName.trim()) {
      this.creatorError = 'Template name is required.';
      return;
    }

    this.isSubmitting = true;
    this.creatorError = '';

    const layoutConfig: TemplateConfig = {
      primaryColor: this.formPrimaryColor,
      secondaryColor: this.formSecondaryColor,
      fontFamily: this.formFontFamily,
      fontSize: '14px',
      sectionOrder: [...this.formSectionOrder],
      showPhoto: this.formShowPhoto,
      layout: this.formLayout,
    };

    const templateData: Partial<Template> = {
      name: this.formName.trim(),
      description: this.formDescription.trim(),
      category: this.formCategory,
      thumbnail: this.formThumbnail,
      layoutConfig,
      isActive: true,
      isPublished: false,
      isFree: this.formIsFree,
      originalPrice: this.formIsFree ? undefined : (this.formOriginalPrice ?? undefined),
      offerPrice: this.formIsFree ? undefined : (this.formOfferPrice ?? undefined),
    };

    this.templateService.createTemplate(templateData).subscribe({
      next: (created) => {
        this.templates.unshift(created);
        this.isSubmitting = false;
        this.showCreator = false;
        this.resetForm();
        this.toast.success('Template created successfully');
      },
      error: (err) => {
        this.creatorError = err.error?.error || 'Failed to create template.';
        this.isSubmitting = false;
        this.toast.error('Operation failed: ' + (err.error?.error || 'Could not create template'));
      },
    });
  }
}
