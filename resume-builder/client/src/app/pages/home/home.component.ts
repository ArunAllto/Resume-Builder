import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { HeroComponent } from './hero/hero.component';
import { FeaturesComponent } from './features/features.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { ApiService } from '../../core/services/api.service';
import { Template } from '../../core/models/template.model';
import { PRICING_PLANS, PricingPlan } from '../../core/data/pricing-plans';
import { BLOG_ARTICLES, BlogArticle } from '../../core/data/blog-articles';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroComponent, FeaturesComponent, HowItWorksComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private http = inject(HttpClient);

  // ── Templates ──
  templates: Template[] = [];
  filteredTemplates: Template[] = [];
  activeCategory = 'all';
  templateCategories = ['all', 'professional', 'modern', 'minimal', 'creative'];

  // ── Testimonials ──
  testimonials: Testimonial[] = [];
  currentTestimonialIndex = 0;
  private testimonialInterval: ReturnType<typeof setInterval> | null = null;

  // ── Pricing ──
  pricingPlans: PricingPlan[] = PRICING_PLANS;

  // ── Blog ──
  latestArticles: BlogArticle[] = [];

  // ── Trusted By (placeholder) ──
  trustedCompanies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'];

  // ── Fallback testimonials ──
  private readonly fallbackTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      role: 'Software Engineer',
      company: 'TechCorp',
      content:
        'ResumeAI helped me land my dream job! The AI suggestions were incredibly accurate and the templates looked professional.',
      rating: 5,
    },
    {
      id: '2',
      name: 'James Wilson',
      role: 'Marketing Manager',
      company: 'BrandCo',
      content:
        'I went from zero callbacks to 5 interviews in a week after rebuilding my resume here. The ATS optimization is a game-changer.',
      rating: 5,
    },
    {
      id: '3',
      name: 'Aisha Patel',
      role: 'Product Designer',
      company: 'DesignHub',
      content:
        'Beautiful templates and the live preview made it so easy to perfect my resume. Highly recommend to any job seeker.',
      rating: 4,
    },
    {
      id: '4',
      name: 'Carlos Rivera',
      role: 'Data Analyst',
      company: 'DataStream',
      content:
        'The upload-and-edit feature saved me hours. It parsed my old resume perfectly and I just picked a new template.',
      rating: 5,
    },
    {
      id: '5',
      name: 'Emily Chen',
      role: 'HR Director',
      company: 'PeopleFirst',
      content:
        'As someone who reviews hundreds of resumes, I can confirm — ResumeAI outputs stand out. Clean, ATS-friendly, and well-written.',
      rating: 5,
    },
  ];

  ngOnInit(): void {
    this.fetchTemplates();
    this.fetchTestimonials();
    this.loadLatestArticles();
  }

  ngOnDestroy(): void {
    this.stopTestimonialAutoRotate();
  }

  // ── Templates ──

  private fetchTemplates(): void {
    this.api.get<Template[]>('/templates').subscribe({
      next: (data) => {
        this.templates = (data || []).slice(0, 8);
        this.filteredTemplates = this.templates;
      },
      error: () => {
        this.templates = [];
        this.filteredTemplates = [];
      },
    });
  }

  filterTemplates(category: string): void {
    this.activeCategory = category;
    if (category === 'all') {
      this.filteredTemplates = this.templates;
    } else {
      this.filteredTemplates = this.templates.filter((t) => t.category === category);
    }
  }

  // ── Testimonials ──

  private fetchTestimonials(): void {
    this.api.get<Testimonial[]>('/testimonials').subscribe({
      next: (data) => {
        this.testimonials = data && data.length ? data : this.fallbackTestimonials;
        this.startTestimonialAutoRotate();
      },
      error: () => {
        this.testimonials = this.fallbackTestimonials;
        this.startTestimonialAutoRotate();
      },
    });
  }

  private startTestimonialAutoRotate(): void {
    this.stopTestimonialAutoRotate();
    if (this.testimonials.length > 1) {
      this.testimonialInterval = setInterval(() => {
        this.nextTestimonial();
      }, 5000);
    }
  }

  private stopTestimonialAutoRotate(): void {
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
      this.testimonialInterval = null;
    }
  }

  nextTestimonial(): void {
    this.currentTestimonialIndex =
      (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }

  prevTestimonial(): void {
    this.currentTestimonialIndex =
      (this.currentTestimonialIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }

  goToTestimonial(index: number): void {
    this.currentTestimonialIndex = index;
    this.startTestimonialAutoRotate();
  }

  get visibleTestimonials(): Testimonial[] {
    if (!this.testimonials.length) return [];
    const result: Testimonial[] = [];
    for (let i = 0; i < Math.min(3, this.testimonials.length); i++) {
      const idx = (this.currentTestimonialIndex + i) % this.testimonials.length;
      result.push(this.testimonials[idx]);
    }
    return result;
  }

  // ── Blog ──

  private loadLatestArticles(): void {
    this.latestArticles = [...BLOG_ARTICLES]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }

  // ── Helpers ──

  starsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < rating ? 1 : 0));
  }

  formatPrice(price: number | null): string {
    if (price === null) return 'Free';
    return '\u20B9' + price.toLocaleString('en-IN');
  }

  templateGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      'linear-gradient(135deg, #fccb90, #d57eeb)',
      'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
    ];
    return gradients[index % gradients.length];
  }

  blogGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
    ];
    return gradients[index % gradients.length];
  }
}
