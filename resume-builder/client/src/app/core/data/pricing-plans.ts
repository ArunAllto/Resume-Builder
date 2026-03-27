export interface PricingPlan {
  name: string;
  price: number | null; // null = free
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  popular?: boolean;
  cta: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    price: null,
    period: '',
    description: 'Get started with basic features',
    popular: false,
    cta: 'Get Started Free',
    features: [
      { text: '3 Free Templates', included: true },
      { text: 'Basic AI Suggestions', included: true },
      { text: 'PDF Download', included: true },
      { text: '2 Draft Saves', included: true },
      { text: 'All Premium Templates', included: false },
      { text: 'Advanced AI Writing', included: false },
      { text: 'Cover Letter Builder', included: false },
      { text: 'Priority Support', included: false },
    ],
  },
  {
    name: 'Pro',
    price: 499,
    period: '/month',
    description: 'Perfect for active job seekers',
    popular: true,
    cta: 'Start Pro Trial',
    features: [
      { text: 'All Free Templates', included: true },
      { text: '20+ Premium Templates', included: true },
      { text: 'Advanced AI Writing', included: true },
      { text: '10 Draft Saves', included: true },
      { text: 'Cover Letter Builder', included: true },
      { text: 'ATS Optimization', included: true },
      { text: 'Multiple Download Formats', included: true },
      { text: 'Priority Support', included: false },
    ],
  },
  {
    name: 'Premium',
    price: 2999,
    period: '/year',
    description: 'Unlimited access to everything',
    popular: false,
    cta: 'Go Premium',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited Templates', included: true },
      { text: 'Unlimited Drafts', included: true },
      { text: 'Priority Support', included: true },
      { text: 'Custom Branding', included: true },
      { text: 'Team Collaboration', included: true },
      { text: 'Analytics Dashboard', included: true },
      { text: 'API Access', included: true },
    ],
  },
];
