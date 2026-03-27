import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BLOG_ARTICLES, BlogArticle } from '../../core/data/blog-articles';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent {
  articles = BLOG_ARTICLES;
  categories: Array<'All' | BlogArticle['category']> = [
    'All',
    'Resume Tips',
    'Interview Prep',
    'Career Advice',
    'Job Search',
  ];
  activeCategory: string = 'All';

  get featuredArticle(): BlogArticle | undefined {
    return this.filteredArticles.find((a) => a.featured);
  }

  get filteredArticles(): BlogArticle[] {
    if (this.activeCategory === 'All') {
      return this.articles;
    }
    return this.articles.filter((a) => a.category === this.activeCategory);
  }

  get gridArticles(): BlogArticle[] {
    const featured = this.featuredArticle;
    return this.filteredArticles.filter((a) => a !== featured);
  }

  getCategoryCount(category: string): number {
    if (category === 'All') {
      return this.articles.length;
    }
    return this.articles.filter((a) => a.category === category).length;
  }

  setCategory(category: string): void {
    this.activeCategory = category;
  }

  getCategoryClass(category: string): string {
    switch (category) {
      case 'Resume Tips':
        return 'bg-primary';
      case 'Interview Prep':
        return 'bg-success';
      case 'Career Advice':
        return 'bg-warning text-dark';
      case 'Job Search':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary';
    }
  }

  getGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    ];
    return gradients[index % gradients.length];
  }
}
