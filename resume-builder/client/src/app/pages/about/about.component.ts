import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  stats = [
    { value: '10,000+', label: 'Resumes Created' },
    { value: '50+', label: 'Templates' },
    { value: '95%', label: 'ATS Pass Rate' },
  ];

  features = [
    {
      icon: 'bi-robot',
      title: 'AI-Powered Writing',
      description:
        'Our intelligent AI analyzes job descriptions and suggests tailored content to make your resume stand out from the competition.',
    },
    {
      icon: 'bi-layout-text-window-reverse',
      title: 'Professional Templates',
      description:
        'Choose from over 50 professionally designed templates that are optimized for both visual appeal and ATS compatibility.',
    },
    {
      icon: 'bi-check2-square',
      title: 'ATS Optimization',
      description:
        'Every resume is automatically checked against applicant tracking systems to ensure it passes automated screening.',
    },
  ];

  values = [
    {
      icon: 'bi-lightning-charge',
      title: 'Simplicity',
      description:
        'We believe building a resume should be straightforward. Our intuitive interface guides you through every step without unnecessary complexity.',
    },
    {
      icon: 'bi-award',
      title: 'Quality',
      description:
        'Every template and feature is crafted with attention to detail, ensuring your resume meets the highest professional standards.',
    },
    {
      icon: 'bi-universal-access',
      title: 'Accessibility',
      description:
        'Professional resume tools should be available to everyone regardless of their background, experience level, or budget.',
    },
    {
      icon: 'bi-lightbulb',
      title: 'Innovation',
      description:
        'We continuously improve our AI algorithms and design tools to stay ahead of hiring trends and technology changes.',
    },
  ];
}
