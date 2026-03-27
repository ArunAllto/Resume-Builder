import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface CoverLetterTemplate {
  id: string;
  name: string;
  category: string;
  gradient: string;
}

interface Tip {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-cover-letters',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cover-letters.component.html',
  styleUrls: ['./cover-letters.component.scss'],
})
export class CoverLettersComponent {
  coverLetterTemplates: CoverLetterTemplate[] = [
    {
      id: 'cl-1',
      name: 'Executive Classic',
      category: 'Professional',
      gradient: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
    },
    {
      id: 'cl-2',
      name: 'Modern Edge',
      category: 'Modern',
      gradient: 'linear-gradient(135deg, #553c9a 0%, #805ad5 100%)',
    },
    {
      id: 'cl-3',
      name: 'Clean Slate',
      category: 'Minimal',
      gradient: 'linear-gradient(135deg, #2d3748 0%, #718096 100%)',
    },
    {
      id: 'cl-4',
      name: 'Bold Impact',
      category: 'Creative',
      gradient: 'linear-gradient(135deg, #c53030 0%, #fc8181 100%)',
    },
    {
      id: 'cl-5',
      name: 'Corporate Pro',
      category: 'Professional',
      gradient: 'linear-gradient(135deg, #065f46 0%, #34d399 100%)',
    },
    {
      id: 'cl-6',
      name: 'Fresh Start',
      category: 'Modern',
      gradient: 'linear-gradient(135deg, #92400e 0%, #fbbf24 100%)',
    },
  ];

  steps = [
    {
      icon: 'bi-layout-text-window-reverse',
      number: '1',
      title: 'Choose Template',
      description: 'Pick from our collection of professionally designed cover letter templates.',
    },
    {
      icon: 'bi-pencil-square',
      number: '2',
      title: 'Fill Details',
      description: 'Add your information, customize the content, and tailor it to the job.',
    },
    {
      icon: 'bi-download',
      number: '3',
      title: 'Download',
      description: 'Export your polished cover letter as a PDF ready to send.',
    },
  ];

  tips: Tip[] = [
    {
      icon: 'bi-person-check',
      title: 'Address the Hiring Manager',
      description:
        'Research and use the hiring manager\'s name. Avoid generic greetings like "To Whom It May Concern" whenever possible.',
    },
    {
      icon: 'bi-star',
      title: 'Highlight Relevant Skills',
      description:
        'Focus on the skills and experiences that directly relate to the job description. Use specific examples and achievements.',
    },
    {
      icon: 'bi-emoji-smile',
      title: 'Show Enthusiasm',
      description:
        'Express genuine interest in the company and the role. Explain why you want to work there specifically.',
    },
    {
      icon: 'bi-text-paragraph',
      title: 'Keep It Concise',
      description:
        'Aim for 3-4 paragraphs on a single page. Recruiters appreciate brevity and clarity over lengthy explanations.',
    },
    {
      icon: 'bi-spellcheck',
      title: 'Proofread Carefully',
      description:
        'Check for typos, grammar errors, and formatting issues. Have someone else review it before sending.',
    },
  ];
}
