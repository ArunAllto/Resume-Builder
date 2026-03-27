import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { RESUME_EXAMPLES, ResumeExample } from '../../../core/data/resume-examples';

@Component({
  selector: 'app-example-detail',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  templateUrl: './example-detail.component.html',
  styleUrl: './example-detail.component.scss',
})
export class ExampleDetailComponent implements OnInit {
  example: ResumeExample | null = null;
  relatedExamples: ResumeExample[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      this.example = RESUME_EXAMPLES.find((e) => e.slug === slug) || null;

      if (!this.example) {
        this.router.navigate(['/resume-examples']);
        return;
      }

      this.relatedExamples = RESUME_EXAMPLES.filter(
        (e) => e.industry === this.example!.industry && e.slug !== this.example!.slug
      ).slice(0, 4);
    });
  }

  getScoreBarClass(score: number): string {
    if (score >= 95) return 'bg-success';
    if (score >= 90) return 'bg-primary';
    return 'bg-info';
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'Entry Level':
        return 'bg-info-subtle text-info-emphasis';
      case 'Mid Level':
        return 'bg-primary-subtle text-primary-emphasis';
      case 'Senior':
        return 'bg-warning-subtle text-warning-emphasis';
      case 'Executive':
        return 'bg-danger-subtle text-danger-emphasis';
      default:
        return 'bg-secondary-subtle text-secondary-emphasis';
    }
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 95) return 'bg-success';
    if (score >= 90) return 'bg-primary';
    return 'bg-info';
  }
}
