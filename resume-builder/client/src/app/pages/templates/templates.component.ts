import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Template } from '../../core/models/template.model';
import { TemplateService } from '../../core/services/template.service';
import { ToastService } from '../../shared/services/toast.service';

type CategoryFilter = 'all' | 'professional' | 'modern' | 'minimal' | 'creative';
type PricingFilter = 'all' | 'free' | 'paid';
type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'price-low' | 'price-high';
type LayoutFilter = 'single-column' | 'two-column' | 'sidebar';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
})
export class TemplatesComponent implements OnInit {
  templates: Template[] = [];
  filteredTemplates: Template[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  activeCategory: CategoryFilter = 'all';
  pricingFilter: PricingFilter = 'all';
  sortOption: SortOption = 'newest';
  selectedLayouts: Set<LayoutFilter> = new Set();

  categories: { key: CategoryFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'bi-grid' },
    { key: 'professional', label: 'Professional', icon: 'bi-briefcase' },
    { key: 'modern', label: 'Modern', icon: 'bi-lightning' },
    { key: 'minimal', label: 'Minimal', icon: 'bi-layout-text-window' },
    { key: 'creative', label: 'Creative', icon: 'bi-palette' },
  ];

  layoutOptions: { key: LayoutFilter; label: string }[] = [
    { key: 'single-column', label: 'Single Column' },
    { key: 'two-column', label: 'Two Column' },
    { key: 'sidebar', label: 'Sidebar' },
  ];

  categoryGradients: Record<string, string> = {
    professional: 'linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #3182ce 100%)',
    modern: 'linear-gradient(135deg, #553c9a 0%, #6b46c1 50%, #805ad5 100%)',
    minimal: 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #718096 100%)',
    creative: 'linear-gradient(135deg, #c53030 0%, #e53e3e 50%, #fc8181 100%)',
  };

  constructor(
    private templateService: TemplateService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.error = '';
    this.templateService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load templates. Please try again.';
        this.loading = false;
        this.toast.error('Failed to load templates');
      },
    });
  }

  filterByCategory(category: CategoryFilter): void {
    this.activeCategory = category;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onPricingChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleLayout(layout: LayoutFilter): void {
    if (this.selectedLayouts.has(layout)) {
      this.selectedLayouts.delete(layout);
    } else {
      this.selectedLayouts.add(layout);
    }
    this.applyFilters();
  }

  isLayoutSelected(layout: LayoutFilter): boolean {
    return this.selectedLayouts.has(layout);
  }

  applyFilters(): void {
    let result = [...this.templates];

    // Category filter
    if (this.activeCategory !== 'all') {
      result = result.filter((t) => t.category === this.activeCategory);
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    // Pricing filter
    if (this.pricingFilter === 'free') {
      result = result.filter((t) => t.isFree);
    } else if (this.pricingFilter === 'paid') {
      result = result.filter((t) => !t.isFree);
    }

    // Layout filter
    if (this.selectedLayouts.size > 0) {
      result = result.filter(
        (t) =>
          t.layoutConfig &&
          this.selectedLayouts.has(t.layoutConfig.layout as LayoutFilter)
      );
    }

    // Sort
    result = this.sortTemplates(result);

    this.filteredTemplates = result;
  }

  private sortTemplates(templates: Template[]): Template[] {
    switch (this.sortOption) {
      case 'newest':
        return templates.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return templates.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'name-asc':
        return templates.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return templates.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-low':
        return templates.sort(
          (a, b) => (a.offerPrice || 0) - (b.offerPrice || 0)
        );
      case 'price-high':
        return templates.sort(
          (a, b) => (b.offerPrice || 0) - (a.offerPrice || 0)
        );
      default:
        return templates;
    }
  }

  useTemplate(template: Template): void {
    this.router.navigate(['/builder', template.id]);
  }

  getGradient(category: string): string {
    return (
      this.categoryGradients[category] ||
      this.categoryGradients['professional']
    );
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

  hasThumbnail(template: Template): boolean {
    return (
      typeof template.thumbnail === 'string' &&
      template.thumbnail.trim().length > 0
    );
  }
}
