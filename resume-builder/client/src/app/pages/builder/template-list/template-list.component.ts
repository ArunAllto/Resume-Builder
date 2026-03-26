import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Template, TemplateConfig } from '../../../core/models/template.model';
import { TemplateService } from '../../../core/services/template.service';
import { UserService } from '../../../core/services/user.service';
import { PurchaseService } from '../../../core/services/purchase.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthModalComponent } from '../../../shared/components/auth-modal/auth-modal.component';
import { PurchaseModalComponent } from '../../../shared/components/purchase-modal/purchase-modal.component';

type CategoryFilter = 'all' | 'professional' | 'modern' | 'minimal' | 'creative';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuthModalComponent, PurchaseModalComponent],
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

  // Auth modal
  showAuthModal = false;
  selectedTemplateId = '';

  // Purchase modal
  showPurchaseModal = false;
  selectedTemplate: Template | null = null;

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

  constructor(
    private templateService: TemplateService,
    private userService: UserService,
    private purchaseService: PurchaseService,
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
        this.templates = templates.map((t) => this.parseLayoutConfig(t));
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

  useTemplate(template: Template): void {
    // Step 1: Check if logged in
    if (!this.userService.isLoggedIn()) {
      this.selectedTemplateId = template.id;
      this.showAuthModal = true;
      return;
    }

    // Step 2: Check if paid template needs purchase
    if (!template.isFree) {
      this.purchaseService.checkPurchase(template.id).subscribe({
        next: (purchased) => {
          if (purchased) {
            this.navigateToEditor(template.id);
          } else {
            this.selectedTemplate = template;
            this.showPurchaseModal = true;
          }
        },
        error: () => {
          // If check fails, try to navigate anyway
          this.navigateToEditor(template.id);
        }
      });
      return;
    }

    // Free template + logged in
    this.navigateToEditor(template.id);
  }

  onAuthenticated(): void {
    this.showAuthModal = false;
    // After auth, re-run the template selection flow
    const template = this.templates.find(t => t.id === this.selectedTemplateId);
    if (template) {
      this.useTemplate(template);
    } else {
      this.navigateToEditor(this.selectedTemplateId);
    }
  }

  onPurchased(): void {
    this.showPurchaseModal = false;
    if (this.selectedTemplate) {
      this.navigateToEditor(this.selectedTemplate.id);
    }
  }

  private navigateToEditor(templateId: string): void {
    this.router.navigate(['/builder', templateId]);
  }

  private parseLayoutConfig(template: Template): Template {
    if (typeof template.layoutConfig === 'string') {
      try {
        template.layoutConfig = JSON.parse(template.layoutConfig) as TemplateConfig;
      } catch {}
    }
    return template;
  }

  hasThumbnail(template: Template): boolean {
    return typeof template.thumbnail === 'string' && template.thumbnail.trim().length > 0;
  }

  isCanvasTemplate(template: Template): boolean {
    return !!(template.layoutConfig && typeof template.layoutConfig === 'object' && template.layoutConfig.canvasData);
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
      result = result.filter((t) =>
        t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
      );
    }
    this.filteredTemplates = result;
  }

  getGradient(category: string): string {
    return this.categoryGradients[category] || this.categoryGradients['professional'];
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      professional: '#2c5282', modern: '#6b46c1', minimal: '#4a5568', creative: '#e53e3e',
    };
    return colors[category] || '#4a5568';
  }
}
