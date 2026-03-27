import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BLOG_ARTICLES, BlogArticle } from '../../../core/data/blog-articles';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
})
export class ArticleDetailComponent implements OnInit {
  article: BlogArticle | undefined;
  relatedArticles: BlogArticle[] = [];
  sidebarRelated: BlogArticle[] = [];
  linkCopied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      this.article = BLOG_ARTICLES.find((a) => a.slug === slug);

      if (!this.article) {
        this.router.navigate(['/blog']);
        return;
      }

      const sameCategoryArticles = BLOG_ARTICLES.filter(
        (a) => a.category === this.article!.category && a.slug !== this.article!.slug
      );

      this.sidebarRelated = sameCategoryArticles.slice(0, 3);

      // For bottom related section, include cross-category if needed
      if (sameCategoryArticles.length >= 4) {
        this.relatedArticles = sameCategoryArticles.slice(0, 4);
      } else {
        const others = BLOG_ARTICLES.filter(
          (a) => a.slug !== this.article!.slug && !sameCategoryArticles.includes(a)
        );
        this.relatedArticles = [
          ...sameCategoryArticles,
          ...others.slice(0, 4 - sameCategoryArticles.length),
        ];
      }

      // Scroll to top on article change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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
    ];
    return gradients[index % gradients.length];
  }

  copyLink(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.linkCopied = true;
      setTimeout(() => (this.linkCopied = false), 2000);
    });
  }

  shareOnTwitter(): void {
    if (!this.article) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.article.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  }

  shareOnLinkedIn(): void {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }
}
