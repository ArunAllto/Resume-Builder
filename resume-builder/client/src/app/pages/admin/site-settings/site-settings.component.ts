import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  imageUrl: string;
  isPublished: boolean;
  createdAt: string;
}

interface ResumeExample {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  downloadUrl: string;
  category: string;
  isActive: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  color: string;
}

interface Transaction {
  id: string;
  userName: string;
  email: string;
  amount: number;
  templateName: string;
  date: string;
  status: 'completed' | 'pending' | 'refunded';
}

interface SiteSettings {
  general: {
    siteName: string;
    tagline: string;
    heroTitle: string;
    heroSubtitle: string;
    maintenanceMode: boolean;
  };
  branding: {
    primaryColor: string;
    logoUrl: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
  };
  announcement: {
    enabled: boolean;
    text: string;
    bgColor: string;
    linkUrl: string;
    dismissible: boolean;
  };
}

@Component({
  selector: 'app-site-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './site-settings.component.html',
  styleUrl: './site-settings.component.scss',
})
export class SiteSettingsComponent implements OnInit {
  activeTab: 'general' | 'branding' | 'contact' | 'social' | 'announcement' | 'blog' | 'resume-examples' | 'pricing' | 'finance' | 'admin' = 'general';
  isLoading = true;
  isSaving = false;
  errorMessage = '';

  // Blog
  blogArticles: BlogArticle[] = [];
  showBlogForm = false;
  editingBlog: BlogArticle | null = null;
  blogForm = { title: '', excerpt: '', content: '', category: 'tips', author: 'Admin', imageUrl: '', isPublished: true };

  // Resume Examples
  resumeExamples: ResumeExample[] = [];
  showExampleForm = false;
  editingExample: ResumeExample | null = null;
  exampleForm = { title: '', description: '', imageUrl: '', downloadUrl: '', category: 'professional', isActive: true };

  // Pricing
  pricingPlans: PricingPlan[] = this.getDefaultPricing();

  // Finance
  transactions: Transaction[] = [];
  financeStats = { totalRevenue: 0, monthlyRevenue: 0, totalTransactions: 0 };
  loadingFinance = false;

  // Admin settings
  adminPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  isSavingPassword = false;

  settings: SiteSettings = this.getDefaults();

  private originalSettings: SiteSettings = this.getDefaults();

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadBlogArticles();
    this.loadResumeExamples();
    const savedPricing = localStorage.getItem('admin_pricing_plans');
    if (savedPricing) this.pricingPlans = JSON.parse(savedPricing);
  }

  private getDefaults(): SiteSettings {
    return {
      general: {
        siteName: '',
        tagline: '',
        heroTitle: '',
        heroSubtitle: '',
        maintenanceMode: false,
      },
      branding: {
        primaryColor: '#4f46e5',
        logoUrl: '',
      },
      contact: {
        email: '',
        phone: '',
        address: '',
      },
      social: {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        youtube: '',
      },
      announcement: {
        enabled: false,
        text: '',
        bgColor: '#4f46e5',
        linkUrl: '',
        dismissible: true,
      },
    };
  }

  loadSettings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.get<SiteSettings>('/settings').subscribe({
      next: (data) => {
        this.settings = { ...this.getDefaults(), ...data };
        this.originalSettings = JSON.parse(JSON.stringify(this.settings));
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load settings.';
        this.isLoading = false;
        this.toast.error('Failed to load settings');
      },
    });
  }

  saveSettings(): void {
    this.isSaving = true;

    this.api.put<SiteSettings>('/settings', this.settings).subscribe({
      next: (data) => {
        this.settings = { ...this.getDefaults(), ...data };
        this.originalSettings = JSON.parse(JSON.stringify(this.settings));
        this.isSaving = false;
        this.toast.success('Settings saved successfully');
      },
      error: (err) => {
        this.isSaving = false;
        this.toast.error('Failed to save settings: ' + (err.error?.error || 'Unknown error'));
      },
    });
  }

  resetSettings(): void {
    this.settings = JSON.parse(JSON.stringify(this.originalSettings));
    this.toast.info('Settings reset to last saved state');
  }

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }

  switchTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
    if (tab === 'finance') this.loadFinance();
  }

  // Blog methods
  loadBlogArticles(): void {
    const stored = localStorage.getItem('admin_blog_articles');
    this.blogArticles = stored ? JSON.parse(stored) : this.getDefaultBlogArticles();
  }

  saveBlogArticles(): void {
    localStorage.setItem('admin_blog_articles', JSON.stringify(this.blogArticles));
  }

  getDefaultBlogArticles(): BlogArticle[] {
    return [
      { id: '1', title: 'How to Write a Perfect Resume in 2025', excerpt: 'Learn the key elements that make a resume stand out to recruiters and ATS systems.', content: '', category: 'tips', author: 'Admin', imageUrl: '', isPublished: true, createdAt: new Date().toISOString() },
      { id: '2', title: 'Top 10 Resume Mistakes to Avoid', excerpt: 'Common errors that could be costing you interviews and how to fix them.', content: '', category: 'tips', author: 'Admin', imageUrl: '', isPublished: true, createdAt: new Date().toISOString() },
      { id: '3', title: 'ATS Optimization Guide', excerpt: 'Make sure your resume passes the automated screening systems used by most companies.', content: '', category: 'guides', author: 'Admin', imageUrl: '', isPublished: false, createdAt: new Date().toISOString() },
    ];
  }

  openAddBlog(): void {
    this.editingBlog = null;
    this.blogForm = { title: '', excerpt: '', content: '', category: 'tips', author: 'Admin', imageUrl: '', isPublished: true };
    this.showBlogForm = true;
  }

  openEditBlog(article: BlogArticle): void {
    this.editingBlog = article;
    this.blogForm = { title: article.title, excerpt: article.excerpt, content: article.content, category: article.category, author: article.author, imageUrl: article.imageUrl, isPublished: article.isPublished };
    this.showBlogForm = true;
  }

  saveBlog(): void {
    if (!this.blogForm.title.trim()) { this.toast.warning('Title is required'); return; }
    if (this.editingBlog) {
      const idx = this.blogArticles.findIndex(a => a.id === this.editingBlog!.id);
      if (idx !== -1) this.blogArticles[idx] = { ...this.editingBlog, ...this.blogForm };
    } else {
      this.blogArticles.unshift({ ...this.blogForm, id: Date.now().toString(), createdAt: new Date().toISOString() });
    }
    this.saveBlogArticles();
    this.showBlogForm = false;
    this.toast.success(this.editingBlog ? 'Article updated' : 'Article created');
  }

  deleteBlog(article: BlogArticle): void {
    if (!confirm('Delete this article?')) return;
    this.blogArticles = this.blogArticles.filter(a => a.id !== article.id);
    this.saveBlogArticles();
    this.toast.success('Article deleted');
  }

  toggleBlogPublish(article: BlogArticle): void {
    article.isPublished = !article.isPublished;
    this.saveBlogArticles();
  }

  cancelBlogForm(): void { this.showBlogForm = false; }

  // Resume Examples methods
  loadResumeExamples(): void {
    const stored = localStorage.getItem('admin_resume_examples');
    this.resumeExamples = stored ? JSON.parse(stored) : this.getDefaultExamples();
  }

  saveResumeExamples(): void {
    localStorage.setItem('admin_resume_examples', JSON.stringify(this.resumeExamples));
  }

  getDefaultExamples(): ResumeExample[] {
    return [
      { id: '1', title: 'Software Engineer Resume', description: 'Clean, modern resume for tech professionals.', imageUrl: '', downloadUrl: '', category: 'professional', isActive: true },
      { id: '2', title: 'Marketing Manager Resume', description: 'Creative layout for marketing roles.', imageUrl: '', downloadUrl: '', category: 'creative', isActive: true },
      { id: '3', title: 'Fresher Resume', description: 'Minimal resume for recent graduates.', imageUrl: '', downloadUrl: '', category: 'minimal', isActive: true },
    ];
  }

  openAddExample(): void {
    this.editingExample = null;
    this.exampleForm = { title: '', description: '', imageUrl: '', downloadUrl: '', category: 'professional', isActive: true };
    this.showExampleForm = true;
  }

  openEditExample(ex: ResumeExample): void {
    this.editingExample = ex;
    this.exampleForm = { title: ex.title, description: ex.description, imageUrl: ex.imageUrl, downloadUrl: ex.downloadUrl, category: ex.category, isActive: ex.isActive };
    this.showExampleForm = true;
  }

  saveExample(): void {
    if (!this.exampleForm.title.trim()) { this.toast.warning('Title is required'); return; }
    if (this.editingExample) {
      const idx = this.resumeExamples.findIndex(e => e.id === this.editingExample!.id);
      if (idx !== -1) this.resumeExamples[idx] = { ...this.editingExample, ...this.exampleForm };
    } else {
      this.resumeExamples.unshift({ ...this.exampleForm, id: Date.now().toString() });
    }
    this.saveResumeExamples();
    this.showExampleForm = false;
    this.toast.success(this.editingExample ? 'Example updated' : 'Example added');
  }

  deleteExample(ex: ResumeExample): void {
    if (!confirm('Delete this example?')) return;
    this.resumeExamples = this.resumeExamples.filter(e => e.id !== ex.id);
    this.saveResumeExamples();
    this.toast.success('Example deleted');
  }

  cancelExampleForm(): void { this.showExampleForm = false; }

  // Pricing methods
  getDefaultPricing(): PricingPlan[] {
    return [
      { id: '1', name: 'Free', price: 0, billingPeriod: 'monthly', features: ['3 Resume Exports', '5 Templates', 'Basic ATS Check', 'PDF Download'], isPopular: false, isActive: true, color: '#6c757d' },
      { id: '2', name: 'Pro', price: 299, billingPeriod: 'monthly', features: ['Unlimited Resumes', 'All Templates', 'Advanced ATS', 'AI Suggestions', 'Priority Support', 'Custom Domain'], isPopular: true, isActive: true, color: '#4f46e5' },
      { id: '3', name: 'Enterprise', price: 999, billingPeriod: 'monthly', features: ['Everything in Pro', 'Team Access (5 users)', 'API Access', 'Dedicated Support', 'Custom Branding', 'Analytics'], isPopular: false, isActive: true, color: '#7c3aed' },
    ];
  }

  addPricingFeature(plan: PricingPlan): void {
    plan.features.push('');
  }

  removePricingFeature(plan: PricingPlan, idx: number): void {
    plan.features.splice(idx, 1);
  }

  savePricing(): void {
    localStorage.setItem('admin_pricing_plans', JSON.stringify(this.pricingPlans));
    this.toast.success('Pricing updated');
  }

  // Finance methods
  loadFinance(): void {
    this.loadingFinance = true;
    this.api.get<any>('/admin/analytics/revenue').subscribe({
      next: (data) => {
        this.financeStats = {
          totalRevenue: data?.totalRevenue ?? 0,
          monthlyRevenue: data?.thisMonthRevenue ?? 0,
          totalTransactions: data?.totalPurchases ?? 0,
        };
        this.loadingFinance = false;
      },
      error: () => { this.loadingFinance = false; },
    });
  }

  // Admin password change
  changePassword(): void {
    if (!this.adminPasswordForm.currentPassword || !this.adminPasswordForm.newPassword) {
      this.toast.warning('Please fill all password fields');
      return;
    }
    if (this.adminPasswordForm.newPassword !== this.adminPasswordForm.confirmPassword) {
      this.toast.warning('New passwords do not match');
      return;
    }
    if (this.adminPasswordForm.newPassword.length < 6) {
      this.toast.warning('Password must be at least 6 characters');
      return;
    }
    this.isSavingPassword = true;
    this.api.post('/admin/change-password', {
      currentPassword: this.adminPasswordForm.currentPassword,
      newPassword: this.adminPasswordForm.newPassword,
    }).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.adminPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.toast.success('Password changed successfully');
      },
      error: (err: any) => {
        this.isSavingPassword = false;
        this.toast.error('Failed: ' + (err.error?.error || 'Check current password'));
      },
    });
  }
}
