export interface ArtboardElement {
  id: number;
  type: 'text' | 'shape' | 'image' | 'qrcode' | 'table' | 'columns' | 'icon';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  borderRadius: number;
  opacity: number;
  zIndex: number;
  locked?: boolean;
  visible?: boolean;
  name?: string;

  // Text
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  textColor?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  verticalAlign?: string;

  // Fill/Stroke
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: string; // solid | dashed | dotted
  strokeAlignment?: string; // inside | center | outside
  strokeOpacity?: number;

  // Shadow (drop shadow)
  hasShadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  // Image
  imageUrl?: string;
  imageFit?: string; // cover | contain | fill | none

  // Shape-specific
  shapeType?: string; // rectangle | circle | oval | star | arrow | line | hexagon | pentagon | triangle | square
  cornerCount?: number;  // star points count
  cornerRatio?: number;  // star inner radius ratio 0-1

  // Table
  tableRows?: number;
  tableCols?: number;
  tableData?: string[][]; // cell content
  tableHeaderBg?: string;
  tableBorderColor?: string;
  hasTableHeader?: boolean;
  hasTableFooter?: boolean;
  stripedRows?: boolean;

  // Columns
  columnCount?: number;
  columnWidths?: number[];  // percentage widths
  columnGap?: number;
  columnFill?: string;
  columnStroke?: string;
  columnStrokeWidth?: number;
  children?: ArtboardElement[][]; // children per column

  // QR Code
  qrContent?: string;
  qrErrorCorrection?: string;
  qrForeground?: string;
  qrBackground?: string;
  qrMargin?: number;

  // Data binding (maps to resume fields)
  dataBinding?: string;
  dataFormat?: string;
}

export interface PageSettings {
  size: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  marginPreset: 'normal' | 'narrow' | 'moderate' | 'custom';
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  backgroundColor: string;
  watermarkText?: string;
  watermarkImageUrl?: string;
  watermarkOpacity?: number;
  pageBorderColor?: string;
  pageBorderWidth?: number;
  pageBorderStyle?: string;
}

export const PAGE_SIZES: Record<string, { w: number; h: number }> = {
  a4: { w: 210, h: 297 },
  letter: { w: 216, h: 279 },
  legal: { w: 216, h: 356 },
};

export const MARGIN_PRESETS: Record<string, { top: number; right: number; bottom: number; left: number; label: string }> = {
  normal: { top: 20, right: 20, bottom: 20, left: 20, label: 'Normal' },
  narrow: { top: 12, right: 12, bottom: 12, left: 12, label: 'Narrow' },
  moderate: { top: 25.4, right: 19.1, bottom: 25.4, left: 19.1, label: 'Moderate' },
  custom: { top: 0, right: 0, bottom: 0, left: 0, label: 'Custom' },
};

export interface CanvasTemplateData {
  artboardWidth: number;
  artboardHeight: number;
  elements: ArtboardElement[];
  pageSettings?: PageSettings;
  metadata?: {
    name: string;
    category: string;
    description: string;
    isPublished: boolean;
  };
}

export interface RenderedElement extends ArtboardElement {
  resolvedText?: string;
  resolvedImageUrl?: string;
  resolvedTableData?: string[][];
}

// Resume field bindings that can be used in templates
export const RESUME_FIELD_BINDINGS = [
  { value: 'personal.fullName', label: 'Full Name' },
  { value: 'personal.email', label: 'Email' },
  { value: 'personal.phone', label: 'Phone' },
  { value: 'personal.location', label: 'Location' },
  { value: 'personal.linkedin', label: 'LinkedIn' },
  { value: 'personal.website', label: 'Website' },
  { value: 'personal.photo', label: 'Photo' },
  { value: 'summary', label: 'Professional Summary' },
  { value: 'experience', label: 'Experience Section' },
  { value: 'education', label: 'Education Section' },
  { value: 'skills', label: 'Skills Section' },
  { value: 'projects', label: 'Projects Section' },
  { value: 'certifications', label: 'Certifications Section' },
  { value: 'languages', label: 'Languages Section' },
];

// Shape definitions
export const SHAPE_DEFS = [
  { type: 'rectangle', label: 'Rectangle', icon: '▬' },
  { type: 'square', label: 'Square', icon: '■' },
  { type: 'circle', label: 'Circle', icon: '●' },
  { type: 'oval', label: 'Oval', icon: '⬮' },
  { type: 'triangle', label: 'Triangle', icon: '▲' },
  { type: 'star', label: 'Star', icon: '★' },
  { type: 'arrow', label: 'Arrow', icon: '➤' },
  { type: 'line', label: 'Line', icon: '─' },
  { type: 'hexagon', label: 'Hexagon', icon: '⬡' },
  { type: 'pentagon', label: 'Pentagon', icon: '⬠' },
];

export const ICON_DEFS = [
  { name: 'mail', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' },
  { name: 'phone', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' },
  { name: 'location', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' },
  { name: 'linkedin', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>' },
  { name: 'globe', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>' },
  { name: 'star', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>' },
  { name: 'user', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  { name: 'calendar', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>' },
  { name: 'check', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
  { name: 'award', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>' },
  { name: 'briefcase', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
  { name: 'book', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>' },
];
