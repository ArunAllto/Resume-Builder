import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumeData, defaultResumeData } from '../../../../core/models/resume.model';
import { Template } from '../../../../core/models/template.model';
import { CanvasTemplateData } from '../../../../core/models/artboard.model';
import { TemplateRendererService } from '../../../../core/services/template-renderer.service';
import { TemplateRendererComponent } from '../../../../shared/components/template-renderer/template-renderer.component';
import { ProfessionalTemplateComponent } from '../../../../templates/professional/professional-template.component';
import { ModernTemplateComponent } from '../../../../templates/modern/modern-template.component';
import { MinimalTemplateComponent } from '../../../../templates/minimal/minimal-template.component';
import { CreativeTemplateComponent } from '../../../../templates/creative/creative-template.component';

@Component({
  selector: 'app-live-preview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TemplateRendererComponent,
    ProfessionalTemplateComponent,
    ModernTemplateComponent,
    MinimalTemplateComponent,
    CreativeTemplateComponent,
  ],
  templateUrl: './live-preview.component.html',
  styleUrls: ['./live-preview.component.scss'],
})
export class LivePreviewComponent implements OnChanges {
  @Input() data: ResumeData = defaultResumeData;
  @Input() templateCategory: string = 'professional';
  @Input() template: Template | null = null;

  activeTemplate: string = 'professional';
  zoomLevel: number = 0.5;
  canvasTemplateData: CanvasTemplateData | null = null;

  templateOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'creative', label: 'Creative' },
  ];

  constructor(private rendererService: TemplateRendererService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['templateCategory'] && this.templateCategory) {
      this.activeTemplate = this.templateCategory;
    }

    if (changes['template']) {
      this.updateCanvasTemplateData();
    }
  }

  /**
   * Check if the current template is a canvas-designed template.
   */
  get isCanvasTemplate(): boolean {
    return !!this.template?.layoutConfig?.canvasData;
  }

  /**
   * Parse and cache the canvas template data from the template's layoutConfig.
   */
  private updateCanvasTemplateData(): void {
    if (!this.isCanvasTemplate || !this.template) {
      this.canvasTemplateData = null;
      return;
    }

    const config = this.template.layoutConfig;
    this.canvasTemplateData = this.rendererService.parseCanvasTemplateData(
      config as unknown as Record<string, unknown>
    );
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 1.0);
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.25);
  }

  resetZoom(): void {
    this.zoomLevel = 0.5;
  }

  get zoomPercent(): number {
    return Math.round(this.zoomLevel * 100);
  }
}
