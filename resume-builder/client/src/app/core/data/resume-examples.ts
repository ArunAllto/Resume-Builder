export interface ResumeExample {
  slug: string;
  jobTitle: string;
  industry: string;
  experienceLevel: string;
  description: string;
  highlights: string[];
  skills: string[];
  atsScore: number;
  templateCategory: string;
}

export const RESUME_EXAMPLES: ResumeExample[] = [
  {
    slug: 'software-engineer',
    jobTitle: 'Software Engineer',
    industry: 'Technology',
    experienceLevel: 'Mid Level',
    description:
      'A results-driven software engineer resume showcasing full-stack development expertise, agile methodologies, and measurable impact on product delivery timelines.',
    highlights: [
      'Reduced API response time by 40% through query optimization',
      'Led migration from monolith to microservices architecture',
      'Mentored 3 junior developers through onboarding program',
      'Delivered 12 features ahead of sprint deadlines',
    ],
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    atsScore: 94,
    templateCategory: 'modern',
  },
  {
    slug: 'registered-nurse',
    jobTitle: 'Registered Nurse',
    industry: 'Healthcare',
    experienceLevel: 'Mid Level',
    description:
      'A compassionate registered nurse resume highlighting patient care excellence, clinical competencies, and strong collaboration with multidisciplinary medical teams.',
    highlights: [
      'Maintained 98% patient satisfaction scores over 3 years',
      'Trained 15 new nursing staff on hospital protocols',
      'Reduced medication errors by 25% with improved charting procedures',
      'Managed care for 8-12 patients per shift in acute care unit',
    ],
    skills: ['Patient Assessment', 'IV Therapy', 'EMR Systems', 'Wound Care', 'BLS/ACLS', 'Care Planning'],
    atsScore: 92,
    templateCategory: 'professional',
  },
  {
    slug: 'marketing-manager',
    jobTitle: 'Marketing Manager',
    industry: 'Marketing',
    experienceLevel: 'Senior',
    description:
      'A strategic marketing manager resume demonstrating expertise in campaign management, brand development, and data-driven growth initiatives across digital channels.',
    highlights: [
      'Increased organic traffic by 150% through SEO strategy overhaul',
      'Managed $2M annual marketing budget across 6 channels',
      'Launched rebranding campaign that boosted brand awareness by 35%',
      'Built and led a team of 8 marketing specialists',
    ],
    skills: ['SEO/SEM', 'Google Analytics', 'Content Strategy', 'Brand Management', 'HubSpot', 'Budget Management'],
    atsScore: 96,
    templateCategory: 'professional',
  },
  {
    slug: 'graphic-designer',
    jobTitle: 'Graphic Designer',
    industry: 'Design',
    experienceLevel: 'Mid Level',
    description:
      'A visually compelling graphic designer resume showcasing creative versatility, brand identity design, and proficiency across print and digital media.',
    highlights: [
      'Designed brand identities for 20+ clients across industries',
      'Created marketing collateral that increased engagement by 45%',
      'Won 3 industry design awards for packaging concepts',
      'Streamlined design workflow reducing project turnaround by 30%',
    ],
    skills: ['Adobe Creative Suite', 'Figma', 'Typography', 'Brand Identity', 'Print Design', 'UI Design'],
    atsScore: 88,
    templateCategory: 'creative',
  },
  {
    slug: 'financial-analyst',
    jobTitle: 'Financial Analyst',
    industry: 'Finance',
    experienceLevel: 'Mid Level',
    description:
      'A detail-oriented financial analyst resume emphasizing quantitative analysis, financial modeling, and strategic recommendations that drive business decisions.',
    highlights: [
      'Built financial models that guided $50M in investment decisions',
      'Identified $3.2M in cost savings through variance analysis',
      'Automated monthly reporting saving 20 hours per cycle',
      'Presented quarterly forecasts to C-suite executives',
    ],
    skills: ['Financial Modeling', 'Excel/VBA', 'SQL', 'Bloomberg Terminal', 'Power BI', 'Risk Analysis'],
    atsScore: 95,
    templateCategory: 'professional',
  },
  {
    slug: 'data-scientist',
    jobTitle: 'Data Scientist',
    industry: 'Technology',
    experienceLevel: 'Senior',
    description:
      'An analytically rigorous data scientist resume highlighting machine learning expertise, statistical modeling, and the ability to translate complex data into actionable business insights.',
    highlights: [
      'Developed ML model that improved customer retention by 22%',
      'Processed and analyzed datasets exceeding 50TB',
      'Published 2 peer-reviewed papers on NLP techniques',
      'Reduced fraud detection false positives by 60%',
    ],
    skills: ['Python', 'TensorFlow', 'SQL', 'Spark', 'Statistical Modeling', 'NLP'],
    atsScore: 93,
    templateCategory: 'modern',
  },
  {
    slug: 'product-manager',
    jobTitle: 'Product Manager',
    industry: 'Technology',
    experienceLevel: 'Senior',
    description:
      'A customer-focused product manager resume showcasing end-to-end product lifecycle management, cross-functional leadership, and data-informed product strategy.',
    highlights: [
      'Launched 4 products generating $8M in first-year revenue',
      'Improved user activation rate by 35% through onboarding redesign',
      'Managed product roadmap across 3 engineering teams',
      'Conducted 200+ user interviews to inform product decisions',
    ],
    skills: ['Product Strategy', 'Agile/Scrum', 'JIRA', 'A/B Testing', 'User Research', 'Roadmapping'],
    atsScore: 94,
    templateCategory: 'modern',
  },
  {
    slug: 'teacher',
    jobTitle: 'Teacher',
    industry: 'Education',
    experienceLevel: 'Mid Level',
    description:
      'An engaging teacher resume highlighting curriculum development, differentiated instruction, and a proven track record of improving student achievement outcomes.',
    highlights: [
      'Raised standardized test scores by 18% over 2 academic years',
      'Developed and implemented STEM curriculum for grades 6-8',
      'Supervised 25-30 students per class across 5 sections',
      'Organized annual science fair with 200+ student participants',
    ],
    skills: ['Curriculum Design', 'Classroom Management', 'Google Classroom', 'Differentiated Instruction', 'Assessment', 'IEP Development'],
    atsScore: 90,
    templateCategory: 'professional',
  },
  {
    slug: 'sales-representative',
    jobTitle: 'Sales Representative',
    industry: 'Sales',
    experienceLevel: 'Mid Level',
    description:
      'A high-performing sales representative resume demonstrating consistent quota achievement, relationship building skills, and expertise in consultative selling techniques.',
    highlights: [
      'Exceeded annual quota by 130% for 3 consecutive years',
      'Closed $4.5M in new business within first 18 months',
      'Expanded key account portfolio by 40 new enterprise clients',
      'Achieved highest customer retention rate in the division at 95%',
    ],
    skills: ['Salesforce CRM', 'Consultative Selling', 'Pipeline Management', 'Cold Outreach', 'Contract Negotiation', 'B2B Sales'],
    atsScore: 91,
    templateCategory: 'professional',
  },
  {
    slug: 'ux-designer',
    jobTitle: 'UX Designer',
    industry: 'Design',
    experienceLevel: 'Mid Level',
    description:
      'A user-centered UX designer resume showcasing research-driven design processes, prototyping expertise, and measurable improvements in user experience metrics.',
    highlights: [
      'Redesigned checkout flow increasing conversion by 28%',
      'Conducted 100+ usability tests across 5 product lines',
      'Created design system used by 4 product teams',
      'Reduced user support tickets by 40% through UX improvements',
    ],
    skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Accessibility'],
    atsScore: 90,
    templateCategory: 'creative',
  },
  {
    slug: 'project-manager',
    jobTitle: 'Project Manager',
    industry: 'Business',
    experienceLevel: 'Senior',
    description:
      'A certified project manager resume demonstrating successful delivery of complex initiatives, stakeholder management, and resource optimization across multiple departments.',
    highlights: [
      'Delivered 15 projects on time and under budget totaling $12M',
      'Managed cross-functional teams of up to 25 members',
      'Implemented Agile methodology reducing delivery time by 30%',
      'Achieved PMP certification with 98th percentile score',
    ],
    skills: ['PMP Certified', 'Agile/Scrum', 'MS Project', 'Risk Management', 'Stakeholder Management', 'Budget Control'],
    atsScore: 96,
    templateCategory: 'professional',
  },
  {
    slug: 'accountant',
    jobTitle: 'Accountant',
    industry: 'Finance',
    experienceLevel: 'Mid Level',
    description:
      'A meticulous accountant resume highlighting expertise in financial reporting, tax compliance, and process improvements that enhance accuracy and efficiency.',
    highlights: [
      'Managed accounts receivable/payable for $15M revenue company',
      'Reduced month-end close cycle from 10 to 5 business days',
      'Prepared and filed tax returns with 100% compliance rate',
      'Implemented new ERP system saving 15 hours of manual work weekly',
    ],
    skills: ['GAAP', 'QuickBooks', 'SAP', 'Tax Preparation', 'Financial Reporting', 'Reconciliation'],
    atsScore: 93,
    templateCategory: 'minimal',
  },
  {
    slug: 'web-developer',
    jobTitle: 'Web Developer',
    industry: 'Technology',
    experienceLevel: 'Entry Level',
    description:
      'A promising web developer resume showcasing modern front-end skills, personal projects, and a passion for building responsive, accessible web applications.',
    highlights: [
      'Built 10+ responsive websites using modern frameworks',
      'Contributed to 3 open-source projects on GitHub',
      'Achieved Google Mobile-Friendly certification for all client sites',
      'Completed Full-Stack Web Development bootcamp with honors',
    ],
    skills: ['HTML/CSS', 'JavaScript', 'React', 'Git', 'Responsive Design', 'REST APIs'],
    atsScore: 87,
    templateCategory: 'modern',
  },
  {
    slug: 'mechanical-engineer',
    jobTitle: 'Mechanical Engineer',
    industry: 'Engineering',
    experienceLevel: 'Mid Level',
    description:
      'A technically proficient mechanical engineer resume highlighting CAD expertise, product development experience, and contributions to manufacturing efficiency improvements.',
    highlights: [
      'Designed components that reduced manufacturing costs by 20%',
      'Led product development from concept to production for 5 products',
      'Conducted FEA analysis preventing 3 potential design failures',
      'Improved production line efficiency by 15% through process redesign',
    ],
    skills: ['SolidWorks', 'AutoCAD', 'FEA/CFD', 'GD&T', 'Lean Manufacturing', 'MATLAB'],
    atsScore: 92,
    templateCategory: 'professional',
  },
  {
    slug: 'hr-manager',
    jobTitle: 'HR Manager',
    industry: 'Business',
    experienceLevel: 'Senior',
    description:
      'A people-focused HR manager resume demonstrating expertise in talent acquisition, employee engagement, and the development of HR policies that drive organizational success.',
    highlights: [
      'Reduced employee turnover by 25% through engagement programs',
      'Managed full-cycle recruitment for 100+ positions annually',
      'Implemented HRIS system serving 500+ employees',
      'Developed diversity initiative increasing minority hires by 40%',
    ],
    skills: ['Talent Acquisition', 'HRIS Systems', 'Employee Relations', 'Performance Management', 'Labor Law', 'Benefits Administration'],
    atsScore: 94,
    templateCategory: 'professional',
  },
  {
    slug: 'content-writer',
    jobTitle: 'Content Writer',
    industry: 'Creative',
    experienceLevel: 'Mid Level',
    description:
      'A versatile content writer resume showcasing storytelling ability, SEO proficiency, and a portfolio of high-performing content across multiple industries and formats.',
    highlights: [
      'Produced 500+ articles with average 3-minute read time',
      'Increased blog traffic by 200% through SEO-optimized content',
      'Managed editorial calendar for 4 brand publications',
      'Ghostwrote thought leadership pieces for 3 C-suite executives',
    ],
    skills: ['SEO Writing', 'WordPress', 'Copywriting', 'Content Strategy', 'Social Media', 'Google Analytics'],
    atsScore: 89,
    templateCategory: 'creative',
  },
  {
    slug: 'business-analyst',
    jobTitle: 'Business Analyst',
    industry: 'Business',
    experienceLevel: 'Mid Level',
    description:
      'A strategic business analyst resume highlighting requirements gathering, process improvement, and the ability to bridge communication between technical teams and business stakeholders.',
    highlights: [
      'Documented requirements for 10 enterprise-level projects',
      'Identified process improvements saving $1.5M annually',
      'Created data dashboards used by 50+ stakeholders',
      'Facilitated 200+ stakeholder workshops and UAT sessions',
    ],
    skills: ['Requirements Analysis', 'SQL', 'Tableau', 'BPMN', 'User Stories', 'Stakeholder Management'],
    atsScore: 93,
    templateCategory: 'minimal',
  },
  {
    slug: 'civil-engineer',
    jobTitle: 'Civil Engineer',
    industry: 'Engineering',
    experienceLevel: 'Mid Level',
    description:
      'A licensed civil engineer resume showcasing infrastructure project management, structural design expertise, and commitment to sustainable engineering practices.',
    highlights: [
      'Managed $8M highway infrastructure project from design to completion',
      'Performed structural analysis for 20+ commercial buildings',
      'Obtained PE license with first-attempt pass',
      'Reduced project material waste by 18% through design optimization',
    ],
    skills: ['AutoCAD Civil 3D', 'Structural Analysis', 'Project Management', 'Revit', 'Geotechnical', 'Building Codes'],
    atsScore: 91,
    templateCategory: 'professional',
  },
  {
    slug: 'pharmacist',
    jobTitle: 'Pharmacist',
    industry: 'Healthcare',
    experienceLevel: 'Senior',
    description:
      'A licensed pharmacist resume emphasizing medication therapy management, patient counseling excellence, and leadership in pharmacy operations and compliance.',
    highlights: [
      'Dispensed 300+ prescriptions daily with zero error rate',
      'Implemented medication therapy management program for 200 patients',
      'Trained and supervised team of 8 pharmacy technicians',
      'Achieved 99.5% regulatory compliance score on state inspections',
    ],
    skills: ['Medication Therapy', 'Clinical Pharmacy', 'Drug Interactions', 'Patient Counseling', 'Pharmacy Operations', 'Regulatory Compliance'],
    atsScore: 95,
    templateCategory: 'professional',
  },
  {
    slug: 'digital-marketing-specialist',
    jobTitle: 'Digital Marketing Specialist',
    industry: 'Marketing',
    experienceLevel: 'Entry Level',
    description:
      'An enthusiastic digital marketing specialist resume showcasing social media management, paid advertising skills, and a data-driven approach to campaign optimization.',
    highlights: [
      'Managed social media accounts with combined 50K+ followers',
      'Achieved 4.5x ROAS on Google Ads campaigns',
      'Grew email subscriber list by 300% in 12 months',
      'Created content calendar driving 2M+ annual impressions',
    ],
    skills: ['Google Ads', 'Facebook Ads', 'Email Marketing', 'Social Media', 'Google Analytics', 'Canva'],
    atsScore: 88,
    templateCategory: 'modern',
  },
  {
    slug: 'executive-director',
    jobTitle: 'Executive Director',
    industry: 'Business',
    experienceLevel: 'Executive',
    description:
      'A visionary executive director resume demonstrating organizational leadership, strategic planning, and a track record of driving growth and operational excellence.',
    highlights: [
      'Grew organization revenue from $5M to $18M over 5 years',
      'Led strategic planning resulting in 3 new market expansions',
      'Built executive leadership team of 8 senior directors',
      'Secured $4M in funding through investor and board relations',
    ],
    skills: ['Strategic Planning', 'P&L Management', 'Board Relations', 'Organizational Development', 'Change Management', 'Fundraising'],
    atsScore: 97,
    templateCategory: 'professional',
  },
  {
    slug: 'devops-engineer',
    jobTitle: 'DevOps Engineer',
    industry: 'Technology',
    experienceLevel: 'Senior',
    description:
      'A technically advanced DevOps engineer resume showcasing CI/CD pipeline expertise, cloud infrastructure management, and a focus on reliability and automation at scale.',
    highlights: [
      'Reduced deployment time from 4 hours to 15 minutes with CI/CD pipelines',
      'Maintained 99.99% uptime for production services',
      'Migrated 50+ services to Kubernetes cluster',
      'Cut cloud infrastructure costs by 35% through optimization',
    ],
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Jenkins', 'Docker', 'Linux Administration'],
    atsScore: 95,
    templateCategory: 'modern',
  },
];
