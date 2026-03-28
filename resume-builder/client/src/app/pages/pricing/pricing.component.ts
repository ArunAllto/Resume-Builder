import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PRICING_PLANS, PricingPlan } from '../../core/data/pricing-plans';
import { FAQ_DATA, FaqItem } from '../../core/data/faq-data';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  plans = PRICING_PLANS;
  isAnnual = false;
  pricingFaqs: FaqItem[] = [];

  /** Feature comparison rows for the table */
  comparisonFeatures = [
    { name: 'Templates', free: '3 Basic', pro: '20+ Premium', premium: 'Unlimited' },
    { name: 'AI Suggestions', free: 'Basic', pro: 'Advanced', premium: 'Advanced' },
    { name: 'Draft Saves', free: '2', pro: '10', premium: 'Unlimited' },
    { name: 'Download Formats', free: 'PDF', pro: 'PDF, DOCX, TXT', premium: 'PDF, DOCX, TXT' },
    { name: 'Cover Letter Builder', free: '\u2014', pro: '\u2713', premium: '\u2713' },
    { name: 'ATS Optimization', free: '\u2014', pro: '\u2713', premium: '\u2713' },
    { name: 'Custom Branding', free: '\u2014', pro: '\u2014', premium: '\u2713' },
    { name: 'Team Collaboration', free: '\u2014', pro: '\u2014', premium: '\u2713' },
    { name: 'Analytics Dashboard', free: '\u2014', pro: '\u2014', premium: '\u2713' },
    { name: 'API Access', free: '\u2014', pro: '\u2014', premium: '\u2713' },
    { name: 'Priority Support', free: '\u2014', pro: '\u2014', premium: '\u2713' },
  ];

  constructor() {
    // Pick 6 pricing-relevant FAQs
    const pricingCat = FAQ_DATA.filter((f) => f.category === 'Pricing');
    const generalPricing = FAQ_DATA.filter(
      (f) => f.category === 'General' && f.question.toLowerCase().includes('free')
    );
    this.pricingFaqs = [...generalPricing, ...pricingCat].slice(0, 6);
  }

  toggleBilling(): void {
    this.isAnnual = !this.isAnnual;
  }

  getDisplayPrice(plan: PricingPlan): string {
    if (plan.price === null) return 'Free';
    if (this.isAnnual && plan.period === '/month') {
      const annual = Math.round(plan.price * 12 * 0.8);
      return '\u20B9' + annual.toLocaleString('en-IN');
    }
    return '\u20B9' + plan.price.toLocaleString('en-IN');
  }

  getDisplayPeriod(plan: PricingPlan): string {
    if (plan.price === null) return 'Forever';
    if (this.isAnnual && plan.period === '/month') return '/year';
    return plan.period;
  }

  getAnnualSavings(plan: PricingPlan): number | null {
    if (plan.price === null || plan.period !== '/month') return null;
    if (!this.isAnnual) return null;
    return Math.round(plan.price * 12 * 0.2);
  }

  getCardHeaderClass(plan: PricingPlan): string {
    if (plan.popular) return 'pricing-card-header--pro';
    if (plan.name === 'Premium') return 'pricing-card-header--premium';
    return 'pricing-card-header--free';
  }

  getCtaClass(plan: PricingPlan): string {
    if (plan.popular) return 'btn btn-primary btn-lg w-100';
    if (plan.name === 'Premium') return 'btn btn-dark btn-lg w-100';
    return 'btn btn-outline-primary btn-lg w-100';
  }
}
