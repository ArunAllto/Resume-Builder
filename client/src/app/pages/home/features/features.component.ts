import { Component } from '@angular/core';

interface Feature {
  icon: string;
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
      icon: 'ai',
      title: 'AI-Powered Content',
      description: 'Get intelligent suggestions to improve your resume content. Our AI helps you write compelling descriptions and summaries.',
    },
    {
      icon: 'templates',
      title: 'Multiple Templates',
      description: 'Choose from a wide variety of professionally designed templates. From modern to classic, find the perfect style for your industry.',
    },
    {
      icon: 'preview',
      title: 'Live Preview',
      description: 'See your changes in real-time as you build your resume. What you see is exactly what you get in the final PDF.',
    },
    {
      icon: 'upload',
      title: 'Upload & Edit',
      description: 'Already have a resume? Upload it and our AI will parse the content so you can edit and enhance it with new templates.',
    },
    {
      icon: 'pdf',
      title: 'PDF Download',
      description: 'Download your finished resume as a high-quality PDF. Perfectly formatted and ready to send to employers.',
    },
    {
      icon: 'ats',
      title: 'ATS Friendly',
      description: 'All our templates are optimized for Applicant Tracking Systems. Ensure your resume passes automated screening.',
    },
  ];
}
