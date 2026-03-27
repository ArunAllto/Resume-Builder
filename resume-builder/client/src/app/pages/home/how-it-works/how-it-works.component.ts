import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Step {
  number: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss',
})
export class HowItWorksComponent {
  steps: Step[] = [
    {
      number: '1',
      icon: 'bi-layout-text-window',
      title: 'Choose a Template',
      description:
        'Browse our collection of 50+ professionally designed templates. Filter by style — professional, modern, minimal, or creative — and pick the one that fits your industry.',
    },
    {
      number: '2',
      icon: 'bi-pencil-square',
      title: 'Fill Your Details',
      description:
        'Enter your information with AI-powered suggestions. Our smart editor helps you write compelling bullet points, summaries, and skill descriptions in seconds.',
    },
    {
      number: '3',
      icon: 'bi-download',
      title: 'Download & Apply',
      description:
        'Preview your finished resume in real-time, then download it as a perfectly formatted, ATS-optimized PDF ready to impress employers.',
    },
  ];
}
