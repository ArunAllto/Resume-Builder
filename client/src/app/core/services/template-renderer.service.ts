import { Injectable } from '@angular/core';
import {
  ResumeData,
  Experience,
  Education,
  SkillItem,
  Project,
  Certification,
  LanguageItem,
} from '../models/resume.model';
import {
  ArtboardElement,
  CanvasTemplateData,
  RenderedElement,
} from '../models/artboard.model';

@Injectable({ providedIn: 'root' })
export class TemplateRendererService {

  /**
   * Resolve all data bindings in a template against the given resume data.
   * Returns a new array of RenderedElement with resolvedText / resolvedImageUrl populated.
   */
  resolveAllBindings(
    elements: ArtboardElement[],
    resumeData: ResumeData
  ): RenderedElement[] {
    return elements.map((el) => {
      const rendered: RenderedElement = { ...el };

      if (!el.dataBinding) {
        rendered.resolvedText = el.text ?? '';
        rendered.resolvedImageUrl = el.imageUrl ?? '';
        return rendered;
      }

      if (el.type === 'image' || el.dataBinding === 'personal.photo') {
        rendered.resolvedImageUrl = this.resolveImageBinding(el.dataBinding, resumeData);
        rendered.resolvedText = '';
      } else {
        rendered.resolvedText = this.resolveBinding(el.dataBinding, resumeData);
      }

      return rendered;
    });
  }

  /**
   * Resolve a single text data binding to a string value.
   */
  resolveBinding(binding: string, resumeData: ResumeData): string {
    if (!binding) return '';

    const parts = binding.split('.');

    // Personal info fields
    if (parts[0] === 'personal' && parts.length > 1) {
      const field = parts[1] as keyof typeof resumeData.personalInfo;
      return resumeData.personalInfo[field] ?? '';
    }

    // Summary
    if (binding === 'summary') {
      return resumeData.summary ?? '';
    }

    // Section bindings
    if (binding === 'experience') {
      return this.formatExperience(resumeData.experience);
    }
    if (binding === 'education') {
      return this.formatEducation(resumeData.education);
    }
    if (binding === 'skills') {
      return this.formatSkills(resumeData.skills);
    }
    if (binding === 'projects') {
      return this.formatProjects(resumeData.projects);
    }
    if (binding === 'certifications') {
      return this.formatCertifications(resumeData.certifications);
    }
    if (binding === 'languages') {
      return this.formatLanguages(resumeData.languages);
    }

    return '';
  }

  /**
   * Resolve an image data binding (currently only personal.photo).
   */
  resolveImageBinding(binding: string, resumeData: ResumeData): string {
    if (binding === 'personal.photo') {
      return resumeData.personalInfo.photo ?? '';
    }
    return '';
  }

  /**
   * Format the experience section as multi-line text.
   */
  formatExperience(experience: Experience[]): string {
    if (!experience || experience.length === 0) return '';

    return experience
      .map((exp) => {
        const dateRange = exp.current
          ? `${exp.startDate} - Present`
          : `${exp.startDate} - ${exp.endDate}`;
        const lines: string[] = [
          `${exp.position}`,
          `${exp.company}${exp.location ? ', ' + exp.location : ''}`,
          dateRange,
        ];
        if (exp.description) {
          lines.push(exp.description);
        }
        if (exp.highlights && exp.highlights.length > 0) {
          exp.highlights.forEach((h) => {
            if (h.trim()) {
              lines.push(`• ${h}`);
            }
          });
        }
        return lines.join('\n');
      })
      .join('\n\n');
  }

  /**
   * Format the education section as multi-line text.
   */
  formatEducation(education: Education[]): string {
    if (!education || education.length === 0) return '';

    return education
      .map((edu) => {
        const lines: string[] = [
          `${edu.degree}${edu.field ? ' in ' + edu.field : ''}`,
          `${edu.institution}${edu.location ? ', ' + edu.location : ''}`,
          `${edu.startDate} - ${edu.endDate}`,
        ];
        if (edu.gpa) {
          lines.push(`GPA: ${edu.gpa}`);
        }
        if (edu.highlights && edu.highlights.length > 0) {
          edu.highlights.forEach((h) => {
            if (h.trim()) {
              lines.push(`• ${h}`);
            }
          });
        }
        return lines.join('\n');
      })
      .join('\n\n');
  }

  /**
   * Format the skills section as a grouped or flat list.
   */
  formatSkills(skills: SkillItem[]): string {
    if (!skills || skills.length === 0) return '';

    // Group by category
    const grouped = new Map<string, SkillItem[]>();
    for (const skill of skills) {
      const cat = skill.category || 'General';
      if (!grouped.has(cat)) {
        grouped.set(cat, []);
      }
      grouped.get(cat)!.push(skill);
    }

    const sections: string[] = [];
    for (const [category, items] of grouped) {
      const skillNames = items.map((s) => s.name).join(', ');
      if (grouped.size > 1) {
        sections.push(`${category}: ${skillNames}`);
      } else {
        sections.push(skillNames);
      }
    }

    return sections.join('\n');
  }

  /**
   * Format the projects section as multi-line text.
   */
  formatProjects(projects: Project[]): string {
    if (!projects || projects.length === 0) return '';

    return projects
      .map((proj) => {
        const lines: string[] = [`${proj.name}`];
        if (proj.startDate || proj.endDate) {
          lines.push(`${proj.startDate}${proj.endDate ? ' - ' + proj.endDate : ''}`);
        }
        if (proj.description) {
          lines.push(proj.description);
        }
        if (proj.technologies && proj.technologies.length > 0) {
          lines.push(`Technologies: ${proj.technologies.join(', ')}`);
        }
        if (proj.url) {
          lines.push(proj.url);
        }
        return lines.join('\n');
      })
      .join('\n\n');
  }

  /**
   * Format the certifications section as multi-line text.
   */
  formatCertifications(certifications: Certification[]): string {
    if (!certifications || certifications.length === 0) return '';

    return certifications
      .map((cert) => {
        const parts: string[] = [cert.name];
        if (cert.issuer) {
          parts.push(cert.issuer);
        }
        if (cert.date) {
          parts.push(cert.date);
        }
        return parts.join(' | ');
      })
      .join('\n');
  }

  /**
   * Format the languages section as multi-line text.
   */
  formatLanguages(languages: LanguageItem[]): string {
    if (!languages || languages.length === 0) return '';

    return languages.map((lang) => `${lang.name} - ${lang.proficiency}`).join('\n');
  }

  /**
   * Convert a fabric.js canvas JSON (as stored in layoutConfig.canvasData)
   * into our ArtboardElement array for rendering.
   */
  fabricJsonToElements(canvasData: FabricCanvasJson): ArtboardElement[] {
    const elements: ArtboardElement[] = [];
    let idCounter = 1;

    if (!canvasData.objects) return elements;

    for (const obj of canvasData.objects) {
      // Skip internal elements (grid lines, page background)
      if (obj.name === '__grid' || obj.name === '__page_background') {
        continue;
      }

      const el = this.fabricObjectToElement(obj, idCounter++);
      if (el) {
        elements.push(el);
      }
    }

    return elements;
  }

  /**
   * Convert a single fabric.js object to an ArtboardElement.
   */
  private fabricObjectToElement(obj: FabricObjectJson, id: number): ArtboardElement | null {
    const base: ArtboardElement = {
      id,
      type: 'shape',
      x: obj.left ?? 0,
      y: obj.top ?? 0,
      width: (obj.width ?? 0) * (obj.scaleX ?? 1),
      height: (obj.height ?? 0) * (obj.scaleY ?? 1),
      rotation: obj.angle ?? 0,
      borderRadius: obj.rx ?? 0,
      opacity: obj.opacity ?? 1,
      zIndex: id,
      locked: obj.lockMovementX && obj.lockMovementY,
      visible: obj.visible !== false,
      name: obj.name,

      // Fill/Stroke
      fillColor: typeof obj.fill === 'string' ? obj.fill : undefined,
      strokeColor: typeof obj.stroke === 'string' ? obj.stroke : undefined,
      strokeWidth: obj.strokeWidth,

      // Shadow
      hasShadow: !!obj.shadow,
      shadowColor: typeof obj.shadow === 'object' ? obj.shadow?.color : undefined,
      shadowBlur: typeof obj.shadow === 'object' ? obj.shadow?.blur : undefined,
      shadowOffsetX: typeof obj.shadow === 'object' ? obj.shadow?.offsetX : undefined,
      shadowOffsetY: typeof obj.shadow === 'object' ? obj.shadow?.offsetY : undefined,

      // Data binding
      dataBinding: obj.dataBinding,
      dataFormat: obj.dataFormat,
    };

    // Determine element type from fabric type
    const fabricType = obj.type ?? '';

    if (
      fabricType === 'textbox' ||
      fabricType === 'text' ||
      fabricType === 'i-text' ||
      fabricType === 'IText'
    ) {
      base.type = 'text';
      base.text = obj.text ?? '';
      base.fontFamily = obj.fontFamily ?? 'Arial';
      base.fontSize = obj.fontSize ?? 16;
      base.fontWeight = obj.fontWeight != null ? String(obj.fontWeight) : 'normal';
      base.fontStyle = obj.fontStyle ?? 'normal';
      base.textDecoration =
        obj.underline ? 'underline' : obj.linethrough ? 'line-through' : 'none';
      base.textAlign = obj.textAlign ?? 'left';
      base.textColor = typeof obj.fill === 'string' ? obj.fill : '#000000';
      base.lineHeight = obj.lineHeight != null ? String(obj.lineHeight) : '1.16';
      base.letterSpacing = obj.charSpacing != null ? `${obj.charSpacing / 1000}em` : '0';
    } else if (fabricType === 'image' || fabricType === 'Image') {
      base.type = 'image';
      base.imageUrl = obj.src ?? '';
      base.imageFit = 'cover';
    } else if (fabricType === 'group' || fabricType === 'Group') {
      // Groups could be tables or other compound elements
      base.type = 'shape';
      // If the group contains text + lines, it might be a table created by the designer
      if (obj.objects && obj.objects.length > 0) {
        const hasText = obj.objects.some(
          (o: FabricObjectJson) =>
            o.type === 'text' || o.type === 'textbox' || o.type === 'i-text' || o.type === 'IText'
        );
        const hasLines = obj.objects.some(
          (o: FabricObjectJson) => o.type === 'line' || o.type === 'Line'
        );
        if (hasText && hasLines) {
          base.type = 'table';
        }
      }
    } else if (
      fabricType === 'rect' ||
      fabricType === 'Rect' ||
      fabricType === 'circle' ||
      fabricType === 'Circle' ||
      fabricType === 'ellipse' ||
      fabricType === 'Ellipse' ||
      fabricType === 'triangle' ||
      fabricType === 'Triangle' ||
      fabricType === 'polygon' ||
      fabricType === 'Polygon' ||
      fabricType === 'line' ||
      fabricType === 'Line'
    ) {
      base.type = 'shape';
    }

    return base;
  }

  /**
   * Parse a layoutConfig that may contain canvasData into CanvasTemplateData.
   * Handles both raw fabric.js JSON and already-parsed ArtboardElement arrays.
   */
  parseCanvasTemplateData(layoutConfig: Record<string, unknown>): CanvasTemplateData | null {
    if (!layoutConfig || !layoutConfig['canvasData']) {
      return null;
    }

    let canvasData = layoutConfig['canvasData'];
    if (typeof canvasData === 'string') {
      try {
        canvasData = JSON.parse(canvasData);
      } catch {
        return null;
      }
    }

    const fabricJson = canvasData as FabricCanvasJson;
    const artboardWidth = (layoutConfig['canvasWidth'] as number) ?? 595;
    const artboardHeight = (layoutConfig['canvasHeight'] as number) ?? 842;

    // Check if canvasData is already an ArtboardElement array (pre-converted)
    if (Array.isArray(canvasData)) {
      return {
        artboardWidth,
        artboardHeight,
        elements: canvasData as ArtboardElement[],
      };
    }

    // Convert from fabric.js JSON
    const elements = this.fabricJsonToElements(fabricJson);

    return {
      artboardWidth,
      artboardHeight,
      elements,
    };
  }

  /**
   * Generate a self-contained HTML string for printing / PDF generation.
   * Renders the template with all data bindings resolved.
   */
  generatePrintableHTML(
    templateData: CanvasTemplateData,
    resumeData: ResumeData
  ): string {
    const resolved = this.resolveAllBindings(templateData.elements, resumeData);

    let elementsHtml = '';
    for (const el of resolved) {
      if (el.visible === false) continue;
      elementsHtml += this.renderElementToHTML(el);
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Resume</title>
<style>
  @page {
    size: ${templateData.artboardWidth}px ${templateData.artboardHeight}px;
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${templateData.artboardWidth}px;
    height: ${templateData.artboardHeight}px;
    overflow: hidden;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .artboard {
    position: relative;
    width: ${templateData.artboardWidth}px;
    height: ${templateData.artboardHeight}px;
    background: #ffffff;
    overflow: hidden;
  }
  .el {
    position: absolute;
    box-sizing: border-box;
    overflow: hidden;
  }
  .el-text {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .el-image img {
    width: 100%;
    height: 100%;
    display: block;
  }
  .el-shape {
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
<div class="artboard">
${elementsHtml}
</div>
</body>
</html>`;
  }

  /**
   * Render a single resolved element to an HTML string.
   */
  private renderElementToHTML(el: RenderedElement): string {
    const styles = this.buildElementStyles(el);
    const styleAttr = Object.entries(styles)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');

    let innerHtml = '';

    switch (el.type) {
      case 'text':
        innerHtml = `<div class="el-text">${this.escapeHtml(el.resolvedText ?? el.text ?? '')}</div>`;
        break;
      case 'image': {
        const src = el.resolvedImageUrl || el.imageUrl || '';
        if (src) {
          const fit = el.imageFit ?? 'cover';
          innerHtml = `<div class="el-image"><img src="${this.escapeHtml(src)}" style="object-fit: ${fit};" alt="" /></div>`;
        }
        break;
      }
      case 'shape':
        innerHtml = `<div class="el-shape"></div>`;
        break;
      default:
        innerHtml = `<div class="el-text">${this.escapeHtml(el.resolvedText ?? el.text ?? '')}</div>`;
        break;
    }

    return `  <div class="el" style="${styleAttr}">${innerHtml}</div>\n`;
  }

  /**
   * Build a CSS style map for a given element.
   */
  buildElementStyles(el: ArtboardElement | RenderedElement): Record<string, string> {
    const styles: Record<string, string> = {
      left: `${el.x}px`,
      top: `${el.y}px`,
      width: `${el.width}px`,
      height: `${el.height}px`,
      'z-index': `${el.zIndex}`,
    };

    if (el.rotation) {
      styles['transform'] = `rotate(${el.rotation}deg)`;
    }
    if (el.opacity != null && el.opacity < 1) {
      styles['opacity'] = `${el.opacity}`;
    }
    if (el.borderRadius) {
      styles['border-radius'] = `${el.borderRadius}px`;
    }

    // Fill
    if (el.fillColor && el.type === 'shape') {
      styles['background-color'] = el.fillColor;
      if (el.fillOpacity != null && el.fillOpacity < 1) {
        styles['background-color'] = this.applyOpacity(el.fillColor, el.fillOpacity);
      }
    }

    // Stroke
    if (el.strokeColor && el.strokeWidth) {
      const dashStyle = el.strokeStyle === 'dashed' ? 'dashed' : el.strokeStyle === 'dotted' ? 'dotted' : 'solid';
      styles['border'] = `${el.strokeWidth}px ${dashStyle} ${el.strokeColor}`;
    }

    // Shadow
    if (el.hasShadow && el.shadowColor) {
      styles['box-shadow'] = `${el.shadowOffsetX ?? 0}px ${el.shadowOffsetY ?? 0}px ${el.shadowBlur ?? 0}px ${el.shadowColor}`;
    }

    // Text styles
    if (el.type === 'text') {
      if (el.fontFamily) styles['font-family'] = `${el.fontFamily}, sans-serif`;
      if (el.fontSize) styles['font-size'] = `${el.fontSize}px`;
      if (el.fontWeight) styles['font-weight'] = el.fontWeight;
      if (el.fontStyle && el.fontStyle !== 'normal') styles['font-style'] = el.fontStyle;
      if (el.textDecoration && el.textDecoration !== 'none') styles['text-decoration'] = el.textDecoration;
      if (el.textAlign) styles['text-align'] = el.textAlign;
      if (el.textColor) styles['color'] = el.textColor;
      if (el.lineHeight) styles['line-height'] = el.lineHeight;
      if (el.letterSpacing && el.letterSpacing !== '0') styles['letter-spacing'] = el.letterSpacing;
      if (el.textTransform) styles['text-transform'] = el.textTransform;
    }

    // Image fit
    if (el.type === 'image') {
      styles['overflow'] = 'hidden';
    }

    return styles;
  }

  /**
   * Apply alpha to a hex color string.
   */
  private applyOpacity(hex: string, opacity: number): string {
    if (hex.startsWith('rgba')) return hex;
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /**
   * Escape HTML special characters.
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

/**
 * Minimal type definition for a fabric.js canvas JSON export.
 */
export interface FabricCanvasJson {
  version?: string;
  objects?: FabricObjectJson[];
  background?: string;
  [key: string]: unknown;
}

export interface FabricObjectJson {
  type?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  visible?: boolean;
  fill?: string | object;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
  ry?: number;
  name?: string;
  lockMovementX?: boolean;
  lockMovementY?: boolean;

  // Text properties
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  underline?: boolean;
  linethrough?: boolean;
  textAlign?: string;
  lineHeight?: number;
  charSpacing?: number;

  // Image
  src?: string;

  // Shadow
  shadow?: {
    color?: string;
    blur?: number;
    offsetX?: number;
    offsetY?: number;
  } | null;

  // Group children
  objects?: FabricObjectJson[];

  // Custom data binding properties
  dataBinding?: string;
  dataFormat?: string;

  [key: string]: unknown;
}
