import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeData, defaultResumeData } from '../../../core/models/resume.model';
import {
  ArtboardElement,
  CanvasTemplateData,
  RenderedElement,
} from '../../../core/models/artboard.model';
import { TemplateRendererService } from '../../../core/services/template-renderer.service';

@Component({
  selector: 'app-template-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-renderer.component.html',
  styleUrls: ['./template-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateRendererComponent implements OnChanges {
  @Input() templateData: CanvasTemplateData | null = null;
  @Input() resumeData: ResumeData = defaultResumeData;
  @Input() scale: number = 1;
  @Input() editable: boolean = false;

  renderedElements: RenderedElement[] = [];

  constructor(private rendererService: TemplateRendererService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['templateData'] || changes['resumeData']) {
      this.resolveElements();
    }
  }

  /**
   * Resolve all data bindings and prepare elements for rendering.
   */
  private resolveElements(): void {
    if (!this.templateData || !this.templateData.elements) {
      this.renderedElements = [];
      return;
    }

    this.renderedElements = this.rendererService
      .resolveAllBindings(this.templateData.elements, this.resumeData)
      .filter((el) => el.visible !== false)
      .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  }

  /**
   * Build inline styles for a given element.
   */
  getElementStyles(el: RenderedElement): Record<string, string> {
    return this.rendererService.buildElementStyles(el);
  }

  /**
   * Handle inline text editing for unbound elements when editable=true.
   */
  onTextEdit(el: RenderedElement, event: Event): void {
    if (!this.editable || el.dataBinding) return;

    const target = event.target as HTMLElement;
    el.text = target.innerText;
    el.resolvedText = target.innerText;
  }

  /**
   * Determine if an element's text should use contenteditable.
   */
  isEditable(el: RenderedElement): boolean {
    return this.editable && el.type === 'text' && !el.dataBinding;
  }

  /**
   * Get the display text for a text element.
   */
  getDisplayText(el: RenderedElement): string {
    return el.resolvedText ?? el.text ?? '';
  }

  /**
   * Get the display image URL for an image element.
   */
  getImageUrl(el: RenderedElement): string {
    return el.resolvedImageUrl || el.imageUrl || '';
  }

  /**
   * Check if a text element is rendering a section (multi-entry data).
   */
  isSectionBinding(el: RenderedElement): boolean {
    if (!el.dataBinding) return false;
    const sectionBindings = [
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
      'languages',
    ];
    return sectionBindings.includes(el.dataBinding);
  }

  /**
   * Get the artboard transform string for scaling.
   */
  get artboardTransform(): string {
    return `scale(${this.scale})`;
  }

  /**
   * Get the artboard width in pixels.
   */
  get artboardWidth(): number {
    return this.templateData?.artboardWidth ?? 595;
  }

  /**
   * Get the artboard height in pixels.
   */
  get artboardHeight(): number {
    return this.templateData?.artboardHeight ?? 842;
  }

  trackById(_index: number, el: RenderedElement): number {
    return el.id;
  }
}
