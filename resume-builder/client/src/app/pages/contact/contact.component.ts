import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  submitted = false;

  subjectOptions = [
    'General Inquiry',
    'Technical Support',
    'Billing',
    'Feedback',
    'Partnership',
  ];

  infoCards = [
    {
      icon: 'bi-envelope',
      title: 'Email Us',
      detail: 'support@resumeai.com',
      subtitle: 'We reply within 24 hours',
    },
    {
      icon: 'bi-telephone',
      title: 'Call Us',
      detail: '+91 1234 567 890',
      subtitle: 'Mon-Fri, 9AM-6PM IST',
    },
    {
      icon: 'bi-clock',
      title: 'Business Hours',
      detail: 'Mon-Fri, 9AM-6PM IST',
      subtitle: 'Weekend support via email',
    },
  ];

  faqLinks = [
    { text: 'How do I download my resume as PDF?', fragment: 'download' },
    { text: 'Can I use ResumeAI for free?', fragment: 'pricing' },
    { text: 'How does ATS optimization work?', fragment: 'ats' },
  ];

  onSubmit(): void {
    this.submitted = true;
    // Reset form after showing success
    setTimeout(() => {
      this.contactForm = { name: '', email: '', subject: '', message: '' };
    }, 300);
  }

  dismissAlert(): void {
    this.submitted = false;
  }
}
