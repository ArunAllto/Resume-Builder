import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FAQ_DATA, FaqItem } from '../../core/data/faq-data';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  allFaqs: FaqItem[] = FAQ_DATA;
  searchText = '';
  activeCategory = 'All';

  categories: string[] = ['All', 'General', 'Templates', 'Pricing', 'Account', 'Technical'];

  get filteredFaqs(): FaqItem[] {
    let result = this.allFaqs;

    if (this.activeCategory !== 'All') {
      result = result.filter((f) => f.category === this.activeCategory);
    }

    if (this.searchText.trim()) {
      const query = this.searchText.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(query) ||
          f.answer.toLowerCase().includes(query)
      );
    }

    return result;
  }

  setCategory(category: string): void {
    this.activeCategory = category;
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      All: 'bi-grid',
      General: 'bi-info-circle',
      Templates: 'bi-layout-text-window-reverse',
      Pricing: 'bi-currency-rupee',
      Account: 'bi-person-circle',
      Technical: 'bi-gear',
    };
    return icons[category] || 'bi-tag';
  }

  getCategoryCount(category: string): number {
    if (category === 'All') return this.allFaqs.length;
    return this.allFaqs.filter((f) => f.category === category).length;
  }
}
