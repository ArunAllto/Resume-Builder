import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-resume-formats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './resume-formats.component.html',
  styleUrl: './resume-formats.component.scss',
})
export class ResumeFormatsComponent {
  formats = [
    {
      icon: 'bi-list-ol',
      title: 'Chronological',
      bestFor: 'Steady career progression',
      description:
        'Lists your work experience in reverse chronological order, starting with your most recent position. This is the most widely used and recognized resume format.',
      pros: [
        'Preferred by most hiring managers',
        'Easy for ATS systems to parse',
        'Shows clear career progression',
        'Highlights recent experience',
      ],
      cons: [
        'Exposes gaps in employment',
        'Not ideal for career changers',
        'Can seem repetitive for similar roles',
      ],
    },
    {
      icon: 'bi-grid-3x3',
      title: 'Functional',
      bestFor: 'Career changers, gaps',
      description:
        'Focuses on your skills and abilities rather than your chronological work history. Groups your experience by skill categories instead of by employer.',
      pros: [
        'Highlights transferable skills',
        'De-emphasizes employment gaps',
        'Great for career changers',
        'Showcases relevant abilities',
      ],
      cons: [
        'Less preferred by recruiters',
        'May raise red flags about gaps',
        'Lower ATS compatibility',
      ],
    },
    {
      icon: 'bi-layout-split',
      title: 'Combination',
      bestFor: 'Experienced professionals',
      description:
        'Merges the best of both chronological and functional formats. Features a prominent skills section followed by a detailed employment history.',
      pros: [
        'Showcases skills and experience',
        'Flexible and comprehensive',
        'Good for senior professionals',
        'Balances skills with history',
      ],
      cons: [
        'Can become lengthy',
        'Requires careful organization',
        'May be redundant in places',
      ],
    },
  ];

  comparisonRows = [
    {
      format: 'Chronological',
      bestFor: 'Steady career path',
      experience: 'Any level',
      atsScore: 'Excellent',
      recommended: 'Traditional industries, corporate roles',
    },
    {
      format: 'Functional',
      bestFor: 'Career change, gaps',
      experience: 'Varies',
      atsScore: 'Fair',
      recommended: 'Freelancers, career changers, re-entering workforce',
    },
    {
      format: 'Combination',
      bestFor: 'Showcasing depth',
      experience: '5+ years',
      atsScore: 'Good',
      recommended: 'Senior roles, tech industry, consulting',
    },
  ];

  scenarios = [
    {
      icon: 'bi-mortarboard',
      title: 'Recent Graduate',
      description:
        'If you are a recent graduate with limited work experience, use the chronological format. Place your education section first and highlight internships, projects, and relevant coursework.',
      recommended: 'Chronological',
    },
    {
      icon: 'bi-arrow-left-right',
      title: 'Switching Careers',
      description:
        'If you are transitioning to a new industry, the functional format helps you emphasize transferable skills over unrelated job titles. Focus on skills that align with your target role.',
      recommended: 'Functional',
    },
    {
      icon: 'bi-briefcase',
      title: 'Senior Professional',
      description:
        'If you have 10+ years of experience with diverse skills, the combination format lets you showcase both your expertise and your impressive career trajectory.',
      recommended: 'Combination',
    },
  ];
}
