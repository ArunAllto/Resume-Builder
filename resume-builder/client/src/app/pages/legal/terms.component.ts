import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss',
})
export class TermsComponent {
  sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'registration', title: 'Account Registration' },
    { id: 'use-of-services', title: 'Use of Services' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'payment', title: 'Payment Terms' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'termination', title: 'Termination' },
    { id: 'governing-law', title: 'Governing Law' },
    { id: 'contact-info', title: 'Contact Information' },
  ];

  scrollTo(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
