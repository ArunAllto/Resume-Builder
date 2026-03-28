export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FAQ_DATA: FaqItem[] = [
  // ── General (8) ──
  {
    question: 'What is ResumeAI?',
    answer:
      'ResumeAI is an AI-powered online resume builder that helps you create professional, ATS-friendly resumes in minutes. It combines beautiful templates with intelligent content suggestions to help you land your dream job.',
    category: 'General',
  },
  {
    question: 'How does the resume builder work?',
    answer:
      'Simply choose a template, fill in your details using our guided editor, and let our AI suggest improvements to your content. You can preview your resume in real-time and download it as a polished PDF when you are ready.',
    category: 'General',
  },
  {
    question: 'Is ResumeAI free to use?',
    answer:
      'Yes! Our Free plan lets you access 3 templates, basic AI suggestions, PDF downloads, and up to 2 draft saves at no cost. For more advanced features and unlimited access, check out our Pro and Premium plans.',
    category: 'General',
  },
  {
    question: 'What file formats can I download my resume in?',
    answer:
      'Free users can download resumes as PDF. Pro and Premium users get access to multiple formats including PDF, DOCX, and plain text, making it easy to submit your resume in any format employers require.',
    category: 'General',
  },
  {
    question: 'Are the resumes ATS-friendly?',
    answer:
      'Absolutely. All our templates are designed with ATS (Applicant Tracking System) compatibility in mind. Pro users also get access to our ATS Optimization tool that scores your resume and suggests improvements for better parsing.',
    category: 'General',
  },
  {
    question: 'How long does it take to create a resume?',
    answer:
      'Most users complete their first resume in under 15 minutes. Our AI-powered suggestions and pre-built templates speed up the process significantly. You can also upload an existing resume to get started even faster.',
    category: 'General',
  },
  {
    question: 'Can I edit my resume after saving it?',
    answer:
      'Yes, you can edit your saved drafts at any time. Free users can save up to 2 drafts, Pro users get 10 drafts, and Premium users enjoy unlimited draft saves. All changes are saved automatically.',
    category: 'General',
  },
  {
    question: 'Does ResumeAI work on mobile devices?',
    answer:
      'Yes, ResumeAI is fully responsive and works on smartphones, tablets, and desktops. While we recommend using a larger screen for the best editing experience, you can create and edit resumes on any device.',
    category: 'General',
  },

  // ── Templates (6) ──
  {
    question: 'How many templates are available?',
    answer:
      'We offer over 50 professionally designed templates. Free users can access 3 templates, Pro users unlock 20+ premium templates, and Premium users get unlimited access to our entire library including new releases.',
    category: 'Templates',
  },
  {
    question: 'Can I customize the templates?',
    answer:
      'Yes, all templates are fully customizable. You can adjust colors, fonts, sections, and layout to match your personal style. The live preview shows your changes in real-time so you can see exactly how your resume will look.',
    category: 'Templates',
  },
  {
    question: 'What is included in a template?',
    answer:
      'Each template includes pre-designed sections for personal information, work experience, education, skills, and projects. Templates also come with optimized formatting, typography, and spacing to ensure a professional look.',
    category: 'Templates',
  },
  {
    question: 'What is the difference between a template and an example resume?',
    answer:
      'A template is a blank, customizable layout that you fill with your own information. An example resume is a sample document with placeholder content to inspire you. Our templates combine both by providing professional layouts with helpful placeholder text.',
    category: 'Templates',
  },
  {
    question: 'Can I switch templates after I have started?',
    answer:
      'Yes, you can switch templates at any time without losing your content. Your information is preserved when you change templates, so feel free to experiment until you find the perfect design for your needs.',
    category: 'Templates',
  },
  {
    question: 'Are all templates ATS-compatible?',
    answer:
      'Yes, every template in our library has been tested for ATS compatibility. We design our templates to be easily parsed by applicant tracking systems while maintaining a visually appealing layout for human reviewers.',
    category: 'Templates',
  },

  // ── Pricing (6) ──
  {
    question: 'What is the difference between Free and paid plans?',
    answer:
      'The Free plan includes 3 templates, basic AI suggestions, PDF download, and 2 draft saves. The Pro plan adds 20+ premium templates, advanced AI writing, cover letter builder, ATS optimization, and more formats. Premium includes everything plus unlimited access, custom branding, team collaboration, and API access.',
    category: 'Pricing',
  },
  {
    question: 'What is your refund policy?',
    answer:
      'We offer a 7-day money-back guarantee on all paid plans. If you are not satisfied with your purchase, contact our support team within 7 days for a full refund, no questions asked.',
    category: 'Pricing',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard, American Express), UPI, net banking, and popular digital wallets. All payments are processed securely through our payment partners.',
    category: 'Pricing',
  },
  {
    question: 'How do I cancel my subscription?',
    answer:
      'You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period. No cancellation fees apply.',
    category: 'Pricing',
  },
  {
    question: 'Do you offer discounts or promotional offers?',
    answer:
      'Yes, we regularly offer seasonal discounts and promotional pricing. Annual plans already include a significant discount compared to monthly billing. Students and educational institutions can contact us for special pricing.',
    category: 'Pricing',
  },
  {
    question: 'Do you offer enterprise or team pricing?',
    answer:
      'Yes, we offer custom enterprise plans for organizations and career services. These include volume discounts, admin dashboards, team collaboration tools, and dedicated support. Contact us at enterprise@resumeai.com for details.',
    category: 'Pricing',
  },

  // ── Account (5) ──
  {
    question: 'How do I create an account?',
    answer:
      'Click the "Sign Up" button on the top right of any page. You can register with your email address or sign in instantly using your Google account. No credit card is required for the Free plan.',
    category: 'Account',
  },
  {
    question: 'How do I reset my password?',
    answer:
      'Click "Forgot Password" on the login page and enter your registered email address. You will receive a password reset link within minutes. If you signed up with Google, you can manage your password through your Google account settings.',
    category: 'Account',
  },
  {
    question: 'Can I delete my account?',
    answer:
      'Yes, you can delete your account from your account settings page. Please note that account deletion is permanent and will remove all your saved drafts, resumes, and personal data from our servers.',
    category: 'Account',
  },
  {
    question: 'Can I sign in with Google?',
    answer:
      'Yes, we support Google Sign-In for a quick and seamless login experience. Simply click the "Sign in with Google" button and authorize the connection. Your resume data is kept separate from your Google account.',
    category: 'Account',
  },
  {
    question: 'How is my data and privacy protected?',
    answer:
      'We take your privacy seriously. All data is encrypted in transit and at rest. We never share your personal information with third parties. You can download or delete your data at any time. Please review our Privacy Policy for full details.',
    category: 'Account',
  },

  // ── Technical (5) ──
  {
    question: 'Which browsers are supported?',
    answer:
      'ResumeAI works best on the latest versions of Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari. We recommend keeping your browser up to date for the best experience and security.',
    category: 'Technical',
  },
  {
    question: 'My PDF is not downloading. What should I do?',
    answer:
      'First, check that your browser allows pop-ups and downloads from our site. Try clearing your browser cache and disabling any ad blockers. If the issue persists, try a different browser or contact our support team for assistance.',
    category: 'Technical',
  },
  {
    question: 'My resume upload is not working. How can I fix it?',
    answer:
      'Ensure your file is in PDF or DOCX format and is under 10 MB. Check your internet connection and try uploading again. If the problem continues, try a different browser or reach out to our support team.',
    category: 'Technical',
  },
  {
    question: 'Where is my data stored?',
    answer:
      'Your data is stored securely on cloud servers with industry-standard encryption. We use reliable cloud infrastructure to ensure your data is safe, backed up, and accessible whenever you need it.',
    category: 'Technical',
  },
  {
    question: 'Can I use ResumeAI offline?',
    answer:
      'ResumeAI requires an internet connection to use its AI features, template library, and cloud saving. However, once you download your resume as a PDF, you can access and share it offline anytime.',
    category: 'Technical',
  },
];
