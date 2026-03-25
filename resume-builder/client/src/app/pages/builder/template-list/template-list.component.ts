import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Template, TemplateConfig } from '../../../core/models/template.model';
import { TemplateService } from '../../../core/services/template.service';
import { ToastService } from '../../../shared/services/toast.service';

type CategoryFilter = 'all' | 'professional' | 'modern' | 'minimal' | 'creative';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
})
export class TemplateListComponent implements OnInit {
  templates: Template[] = [];
  filteredTemplates: Template[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  activeCategory: CategoryFilter = 'all';

  categories: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'professional', label: 'Professional' },
    { key: 'modern', label: 'Modern' },
    { key: 'minimal', label: 'Minimal' },
    { key: 'creative', label: 'Creative' },
  ];

  categoryGradients: Record<string, string> = {
    professional: 'linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #3182ce 100%)',
    modern: 'linear-gradient(135deg, #553c9a 0%, #6b46c1 50%, #805ad5 100%)',
    minimal: 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #718096 100%)',
    creative: 'linear-gradient(135deg, #c53030 0%, #e53e3e 50%, #fc8181 100%)',
  };

  constructor(private templateService: TemplateService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.error = '';
    this.templateService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates.map((t) => this.parseLayoutConfig(t));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load templates. Please try again.';
        this.loading = false;
        console.error('Template load error:', err);
        this.toast.error('Failed to load templates');
      },
    });
  }

  /** Parse layoutConfig from JSON string if needed */
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

  /** Check if template has a real thumbnail (non-empty base64 data URL) */
  hasThumbnail(template: Template): boolean {
    return typeof template.thumbnail === 'string' && template.thumbnail.trim().length > 0;
  }

  /** Check if template was designed with the canvas designer */
  isCanvasTemplate(template: Template): boolean {
    return !!(
      template.layoutConfig &&
      typeof template.layoutConfig === 'object' &&
      template.layoutConfig.canvasData
    );
  }

  filterByCategory(category: CategoryFilter): void {
    this.activeCategory = category;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.templates];

    if (this.activeCategory !== 'all') {
      result = result.filter((t) => t.category === this.activeCategory);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    this.filteredTemplates = result;
  }

  getGradient(category: string): string {
    return this.categoryGradients[category] || this.categoryGradients['professional'];
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      professional: '#2c5282',
      modern: '#6b46c1',
      minimal: '#4a5568',
      creative: '#e53e3e',
    };
    return colors[category] || '#4a5568';
  }
}
