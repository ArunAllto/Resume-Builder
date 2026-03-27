import { Component } from '@angular/core';

interface Feature {
  icon: string;
  color: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      icon: 'bi-robot',
      color: '#4f46e5',
      title: 'AI Content Writer',
      description:
        'AI generates bullet points and summaries tailored to your role. Just describe your job and get professional content instantly.',
    },
    {
      icon: 'bi-shield-check',
      color: '#059669',
      title: 'ATS Optimization',
      description:
        'Pass applicant tracking systems with confidence. Our templates and content are optimized for automated screening.',
    },
    {
      icon: 'bi-eye',
      color: '#7c3aed',
      title: 'Live Preview',
      description:
        'See changes in real-time as you type. What you see on screen is exactly what you get in the final PDF download.',
    },
    {
      icon: 'bi-file-earmark-pdf',
      color: '#dc2626',
      title: 'Multiple Formats',
      description:
        'Download your resume as a high-quality PDF, perfectly formatted and ready to send to employers worldwide.',
    },
    {
      icon: 'bi-palette',
      color: '#d97706',
      title: 'Template Designer',
      description:
        'Admin-built custom templates designed by professionals. Each one crafted for maximum visual impact and readability.',
    },
    {
      icon: 'bi-cloud-arrow-up',
      color: '#0891b2',
      title: 'Upload & Edit',
      description:
        'Upload your existing resume and our AI parses the content so you can edit, enhance, and apply new templates.',
    },
  ];
}
