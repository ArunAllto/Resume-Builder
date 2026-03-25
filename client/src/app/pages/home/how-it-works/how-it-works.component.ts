import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Step {
  number: string;
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
      title: 'Choose a Template',
      description: 'Browse our collection of professionally designed templates and pick the one that best fits your style and industry.',
    },
    {
      number: '2',
      title: 'Fill in Your Details',
      description: 'Enter your information with the help of AI suggestions. Our smart editor makes it easy to create compelling content.',
    },
    {
      number: '3',
      title: 'Download Your Resume',
      description: 'Preview your finished resume and download it as a perfectly formatted PDF, ready to impress employers.',
    },
  ];
}
