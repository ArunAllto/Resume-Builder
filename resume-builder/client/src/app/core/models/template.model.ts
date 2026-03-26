export interface TemplateConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: string;
  sectionOrder: string[];
  showPhoto: boolean;
  layout: 'single-column' | 'two-column' | 'sidebar';

  // Canvas-designed template data (set when template is created in the designer)
  canvasData?: unknown;
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'professional' | 'modern' | 'minimal' | 'creative';
  layoutConfig: TemplateConfig;
  isActive: boolean;
  isPublished: boolean;
  isFree: boolean;
  originalPrice?: number;
  offerPrice?: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
