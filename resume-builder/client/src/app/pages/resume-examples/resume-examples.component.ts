import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RESUME_EXAMPLES, ResumeExample } from '../../core/data/resume-examples';

interface IndustryCard {
  name: string;
  icon: string;
  description: string;
  count: number;
}

@Component({
  selector: 'app-resume-examples',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './resume-examples.component.html',
  styleUrl: './resume-examples.component.scss',
})
export class ResumeExamplesComponent {
  allExamples: ResumeExample[] = RESUME_EXAMPLES;
  filteredExamples: ResumeExample[] = [...RESUME_EXAMPLES];
  searchQuery = '';
  activeIndustry: string | null = null;

  industries: IndustryCard[] = [
    { name: 'Technology', icon: 'bi-cpu', description: 'Software, data & IT roles', count: 0 },
    { name: 'Healthcare', icon: 'bi-heart-pulse', description: 'Medical & clinical roles', count: 0 },
    { name: 'Education', icon: 'bi-mortarboard', description: 'Teaching & training roles', count: 0 },
    { name: 'Business', icon: 'bi-briefcase', description: 'Management & operations', count: 0 },
    { name: 'Creative', icon: 'bi-palette', description: 'Writing & media roles', count: 0 },
    { name: 'Engineering', icon: 'bi-gear', description: 'Structural & mechanical', count: 0 },
    { name: 'Sales', icon: 'bi-graph-up-arrow', description: 'Revenue & client roles', count: 0 },
    { name: 'Marketing', icon: 'bi-megaphone', description: 'Campaigns & branding', count: 0 },
    { name: 'Finance', icon: 'bi-cash-stack', description: 'Accounting & analysis', count: 0 },
    { name: 'Design', icon: 'bi-vector-pen', description: 'Visual & UX design', count: 0 },
  ];

  constructor() {
    this.industries.forEach((industry) => {
      industry.count = this.allExamples.filter((e) => e.industry === industry.name).length;
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.applyFilters();
  }

  filterByIndustry(industryName: string): void {
    if (this.activeIndustry === industryName) {
      this.activeIndustry = null;
    } else {
      this.activeIndustry = industryName;
    }
    this.applyFilters();
  }

  clearFilter(): void {
    this.activeIndustry = null;
    this.searchQuery = '';
    this.filteredExamples = [...this.allExamples];
  }

  getScoreBadgeClass(score: number): string {
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

  private applyFilters(): void {
    let results = [...this.allExamples];

    if (this.activeIndustry) {
      results = results.filter((e) => e.industry === this.activeIndustry);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      results = results.filter(
        (e) =>
          e.jobTitle.toLowerCase().includes(query) ||
          e.industry.toLowerCase().includes(query) ||
          e.skills.some((s) => s.toLowerCase().includes(query)) ||
          e.description.toLowerCase().includes(query)
      );
    }

    this.filteredExamples = results;
  }
}
