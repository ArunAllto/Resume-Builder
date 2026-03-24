import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as fabric from 'fabric';

interface ShadowConfig {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './properties-panel.component.html',
  styleUrl: './properties-panel.component.scss',
})
export class PropertiesPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() canvas: fabric.Canvas | null = null;
  @Input() selectedObjects: fabric.FabricObject[] = [];

  // Section collapse state
  sections: Record<string, boolean> = {
    canvas: true,
    transform: true,
    appearance: true,
    shadow: false,
    text: true,
    arrangement: true,
  };

  // Canvas properties
  canvasWidth = 800;
  canvasHeight = 600;
  canvasBackground = '#ffffff';
  gridEnabled = false;
  gridSize = 20;

  // Transform
  objX = 0;
  objY = 0;
  objWidth = 0;
  objHeight = 0;
  objRotation = 0;
  lockAspectRatio = false;
  private aspectRatio = 1;

  // Appearance
  fillColor = '#000000';
  fillHex = '#000000';
  fillOpacity = 100;
  strokeColor = '#000000';
  strokeHex = '#000000';
  strokeWidth = 0;
  strokeDashPattern: 'solid' | 'dashed' | 'dotted' = 'solid';
  objOpacity = 100;
  borderRadius = 0;

  // Shadow
  shadow: ShadowConfig = {
    enabled: false,
    color: '#000000',
    blur: 10,
    offsetX: 5,
    offsetY: 5,
  };

  // Text
  fontFamily = 'Arial';
  fontSize = 20;
  fontWeight: string | number = 'normal';
  fontStyle: 'normal' | 'italic' = 'normal';
  textDecoration: 'none' | 'underline' | 'line-through' = 'none';
  textAlign: 'left' | 'center' | 'right' | 'justify' = 'left';
  lineHeight = 1.16;
  charSpacing = 0;

  fontFamilies = [
    'Arial',
    'Helvetica',
    'Georgia',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Impact',
    'Comic Sans MS',
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
  ];

  fontWeights = [
    { label: 'Normal', value: 'normal' },
    { label: 'Bold', value: 'bold' },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
    { label: '300', value: 300 },
    { label: '400', value: 400 },
    { label: '500', value: 500 },
    { label: '600', value: 600 },
    { label: '700', value: 700 },
    { label: '800', value: 800 },
    { label: '900', value: 900 },
  ];

  strokeDashOptions = [
    { label: 'Solid', value: 'solid' as const },
    { label: 'Dashed', value: 'dashed' as const },
    { label: 'Dotted', value: 'dotted' as const },
  ];

  private canvasEventsBound = false;

  get selectedObject(): fabric.FabricObject | null {
    return this.selectedObjects.length === 1 ? this.selectedObjects[0] : null;
  }

  get hasSelection(): boolean {
    return this.selectedObjects.length > 0;
  }

  get isSingleSelection(): boolean {
    return this.selectedObjects.length === 1;
  }

  get isTextObject(): boolean {
    if (!this.selectedObject) return false;
    return (
      this.selectedObject.type === 'textbox' ||
      this.selectedObject.type === 'text' ||
      this.selectedObject.type === 'i-text'
    );
  }

  get isRectObject(): boolean {
    if (!this.selectedObject) return false;
    return this.selectedObject.type === 'rect';
  }

  ngOnInit(): void {
    this.bindCanvasEvents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['canvas']) {
      this.bindCanvasEvents();
      this.readCanvasProperties();
    }
    if (changes['selectedObjects']) {
      this.readObjectProperties();
    }
  }

  ngOnDestroy(): void {
    this.unbindCanvasEvents();
  }

  toggleSection(section: string): void {
    this.sections[section] = !this.sections[section];
  }

  // ── Canvas Properties ──────────────────────────────────────────────

  readCanvasProperties(): void {
    if (!this.canvas) return;
    this.canvasWidth = this.canvas.getWidth();
    this.canvasHeight = this.canvas.getHeight();
    const bg = this.canvas.backgroundColor;
    if (typeof bg === 'string') {
      this.canvasBackground = bg || '#ffffff';
    }
  }

  onCanvasWidthChange(value: number): void {
    if (!this.canvas || value < 1) return;
    this.canvas.setWidth(value);
    this.canvas.renderAll();
  }

  onCanvasHeightChange(value: number): void {
    if (!this.canvas || value < 1) return;
    this.canvas.setHeight(value);
    this.canvas.renderAll();
  }

  onCanvasBackgroundChange(color: string): void {
    if (!this.canvas) return;
    this.canvasBackground = color;
    this.canvas.backgroundColor = color;
    this.canvas.renderAll();
  }

  onGridToggle(): void {
    // Grid rendering is typically managed by the parent component.
    // Emit or signal the grid state change.
    if (!this.canvas) return;
    this.drawGrid();
  }

  onGridSizeChange(size: number): void {
    if (size < 5) return;
    this.gridSize = size;
    if (this.gridEnabled) {
      this.drawGrid();
    }
  }

  private drawGrid(): void {
    if (!this.canvas) return;
    // Remove existing grid lines
    const objects = this.canvas.getObjects();
    const gridLines = objects.filter(
      (o) => (o as any).__gridLine === true
    );
    gridLines.forEach((line) => this.canvas!.remove(line));

    if (!this.gridEnabled) {
      this.canvas.renderAll();
      return;
    }

    const width = this.canvas.getWidth();
    const height = this.canvas.getHeight();

    for (let x = 0; x <= width; x += this.gridSize) {
      const line = new fabric.Line([x, 0, x, height], {
        stroke: '#e0e0e0',
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      (line as any).__gridLine = true;
      this.canvas.add(line);
      this.canvas.sendObjectToBack(line);
    }

    for (let y = 0; y <= height; y += this.gridSize) {
      const line = new fabric.Line([0, y, width, y], {
        stroke: '#e0e0e0',
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      (line as any).__gridLine = true;
      this.canvas.add(line);
      this.canvas.sendObjectToBack(line);
    }

    this.canvas.renderAll();
  }

  // ── Object Properties ──────────────────────────────────────────────

  readObjectProperties(): void {
    const obj = this.selectedObject;
    if (!obj) return;

    this.objX = Math.round(obj.left ?? 0);
    this.objY = Math.round(obj.top ?? 0);
    this.objWidth = Math.round((obj.width ?? 0) * (obj.scaleX ?? 1));
    this.objHeight = Math.round((obj.height ?? 0) * (obj.scaleY ?? 1));
    this.objRotation = Math.round(obj.angle ?? 0);
    this.aspectRatio =
      this.objHeight !== 0 ? this.objWidth / this.objHeight : 1;

    // Fill
    const fill = obj.fill;
    if (typeof fill === 'string') {
      this.fillColor = fill || '#000000';
      this.fillHex = this.fillColor;
    }
    this.fillOpacity = Math.round((obj.opacity ?? 1) * 100);
    this.objOpacity = this.fillOpacity;

    // Stroke
    const stroke = obj.stroke;
    if (typeof stroke === 'string') {
      this.strokeColor = stroke || '#000000';
      this.strokeHex = this.strokeColor;
    }
    this.strokeWidth = obj.strokeWidth ?? 0;

    // Stroke dash
    const dashArray = obj.strokeDashArray;
    if (!dashArray || dashArray.length === 0) {
      this.strokeDashPattern = 'solid';
    } else if (dashArray[0] > 5) {
      this.strokeDashPattern = 'dashed';
    } else {
      this.strokeDashPattern = 'dotted';
    }

    // Border radius for Rect
    if (this.isRectObject) {
      this.borderRadius = (obj as fabric.Rect).rx ?? 0;
    }

    // Shadow
    const shadowObj = obj.shadow as fabric.Shadow | null;
    if (shadowObj) {
      this.shadow = {
        enabled: true,
        color: (shadowObj.color as string) || '#000000',
        blur: shadowObj.blur ?? 10,
        offsetX: shadowObj.offsetX ?? 5,
        offsetY: shadowObj.offsetY ?? 5,
      };
    } else {
      this.shadow = {
        enabled: false,
        color: '#000000',
        blur: 10,
        offsetX: 5,
        offsetY: 5,
      };
    }

    // Text properties
    if (this.isTextObject) {
      const textObj = obj as fabric.Textbox;
      this.fontFamily = textObj.fontFamily ?? 'Arial';
      this.fontSize = textObj.fontSize ?? 20;
      this.fontWeight = textObj.fontWeight ?? 'normal';
      this.fontStyle = (textObj.fontStyle as 'normal' | 'italic') ?? 'normal';
      this.textAlign =
        (textObj.textAlign as 'left' | 'center' | 'right' | 'justify') ??
        'left';
      this.lineHeight = textObj.lineHeight ?? 1.16;
      this.charSpacing = textObj.charSpacing ?? 0;

      if (textObj.underline) {
        this.textDecoration = 'underline';
      } else if (textObj.linethrough) {
        this.textDecoration = 'line-through';
      } else {
        this.textDecoration = 'none';
      }
    }
  }

  // ── Transform handlers ─────────────────────────────────────────────

  onPositionChange(axis: 'x' | 'y', value: number): void {
    if (!this.selectedObject || !this.canvas) return;
    if (axis === 'x') {
      this.selectedObject.set('left', value);
    } else {
      this.selectedObject.set('top', value);
    }
    this.selectedObject.setCoords();
    this.canvas.renderAll();
  }

  onSizeChange(dimension: 'width' | 'height', value: number): void {
    if (!this.selectedObject || !this.canvas || value < 1) return;
    const obj = this.selectedObject;
    const currentWidth = (obj.width ?? 1) * (obj.scaleX ?? 1);
    const currentHeight = (obj.height ?? 1) * (obj.scaleY ?? 1);

    if (dimension === 'width') {
      const newScaleX = value / (obj.width ?? 1);
      obj.set('scaleX', newScaleX);
      this.objWidth = value;
      if (this.lockAspectRatio) {
        const ratio = value / currentWidth;
        const newHeight = currentHeight * ratio;
        const newScaleY = newHeight / (obj.height ?? 1);
        obj.set('scaleY', newScaleY);
        this.objHeight = Math.round(newHeight);
      }
    } else {
      const newScaleY = value / (obj.height ?? 1);
      obj.set('scaleY', newScaleY);
      this.objHeight = value;
      if (this.lockAspectRatio) {
        const ratio = value / currentHeight;
        const newWidth = currentWidth * ratio;
        const newScaleX = newWidth / (obj.width ?? 1);
        obj.set('scaleX', newScaleX);
        this.objWidth = Math.round(newWidth);
      }
    }

    obj.setCoords();
    this.canvas.renderAll();
  }

  onRotationChange(value: number): void {
    if (!this.selectedObject || !this.canvas) return;
    this.selectedObject.set('angle', value);
    this.selectedObject.setCoords();
    this.canvas.renderAll();
  }

  // ── Appearance handlers ────────────────────────────────────────────

  onFillColorChange(color: string): void {
    if (!this.selectedObject || !this.canvas) return;
    this.fillColor = color;
    this.fillHex = color;
    this.selectedObject.set('fill', color);
    this.canvas.renderAll();
  }

  onFillHexInput(hex: string): void {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    this.fillColor = hex;
    this.onFillColorChange(hex);
  }

  onFillOpacityChange(value: number): void {
    if (!this.selectedObject || !this.canvas) return;
    this.fillOpacity = value;
    this.objOpacity = value;
    this.selectedObject.set('opacity', value / 100);
    this.canvas.renderAll();
  }

  onStrokeColorChange(color: string): void {
    if (!this.selectedObject || !this.canvas) return;
    this.strokeColor = color;
    this.strokeHex = color;
    this.selectedObject.set('stroke', color);
    this.canvas.renderAll();
  }

  onStrokeHexInput(hex: string): void {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    this.strokeColor = hex;
    this.onStrokeColorChange(hex);
  }

  onStrokeWidthChange(value: number): void {
    if (!this.selectedObject || !this.canvas) return;
    this.selectedObject.set('strokeWidth', value);
    this.canvas.renderAll();
  }

  onStrokeDashChange(pattern: 'solid' | 'dashed' | 'dotted'): void {
    if (!this.selectedObject || !this.canvas) return;
    this.strokeDashPattern = pattern;
    let dashArray: number[] | undefined;
    switch (pattern) {
      case 'dashed':
        dashArray = [10, 5];
        break;
      case 'dotted':
        dashArray = [2, 4];
        break;
      default:
        dashArray = undefined;
        break;
    }
    this.selectedObject.set(
      'strokeDashArray',
      dashArray as any
    );
    this.canvas.renderAll();
  }

  onOpacityChange(value: number): void {
    this.onFillOpacityChange(value);
  }

  onBorderRadiusChange(value: number): void {
    if (!this.selectedObject || !this.canvas || !this.isRectObject) return;
    const rect = this.selectedObject as fabric.Rect;
    rect.set('rx', value);
    rect.set('ry', value);
    this.canvas.renderAll();
  }

  // ── Shadow handlers ────────────────────────────────────────────────

  onShadowToggle(): void {
    if (!this.selectedObject || !this.canvas) return;
    if (this.shadow.enabled) {
      this.selectedObject.set(
        'shadow',
        new fabric.Shadow({
          color: this.shadow.color,
          blur: this.shadow.blur,
          offsetX: this.shadow.offsetX,
          offsetY: this.shadow.offsetY,
        })
      );
    } else {
      this.selectedObject.set('shadow', null as any);
    }
    this.canvas.renderAll();
  }

  onShadowPropertyChange(): void {
    if (
      !this.selectedObject ||
      !this.canvas ||
      !this.shadow.enabled
    )
      return;
    this.selectedObject.set(
      'shadow',
      new fabric.Shadow({
        color: this.shadow.color,
        blur: this.shadow.blur,
        offsetX: this.shadow.offsetX,
        offsetY: this.shadow.offsetY,
      })
    );
    this.canvas.renderAll();
  }

  // ── Text handlers ──────────────────────────────────────────────────

  onFontFamilyChange(family: string): void {
    if (!this.selectedObject || !this.canvas || !this.isTextObject) return;
    (this.selectedObject as fabric.Textbox).set('fontFamily', family);
    this.canvas.renderAll();
  }

  onFontSizeChange(size: number): void {
    if (!this.selectedObject || !this.canvas || !this.isTextObject) return;
    (this.selectedObject as fabric.Textbox).set('fontSize', size);
    this.canvas.renderAll();
  }

  onFontWeightChange(weight: string | number): void {
    if (!this.selectedObject || !this.canvas || !this.isTextObject) return;
    const w = typeof weight === 'string' && !isNaN(Number(weight)) ? Number(weight) : weight;
    (this.selectedObject as fabric.Textbox).set('fontWeight', w as any);
    this.canvas.renderAll();
  }

  onFontStyleChange(style: 'normal' | 'italic'): void {
    if (!this.selectedObject || !this.canvas || !this.isTextObject) return;
    (this.selectedObject as fabric.Textbox).set('fontStyle', style);
    this.canvas.renderAll();
  }

  onTextDecorationChange(decoration: 'none' | 'underline' | 'line-through'): void {
    if (!this.selectedObject || !this.canvas || !this.isTextObject) return;
    const textObj = this.selectedObject as fabric.Textbox;
    textObj.set('underline', decoration === 'underline');
    textObj.set('linethrough', decoration === 'line-through');
    this.canvas.renderAll();
  }

  onTextAlignChange(align: 'left' | 'center' | 'right' | 'justify'): void {
    if (!this.selectedObject || !this.canvas || !this.isTextObject) return;
    this.textAlign = align;
    (this.selectedObject as fabric.Textbox).set('textAlign', align);
    this.canvas.renderAll();
  }

  onLineHeightChange(value: number): void {
    if (!this.selectedObject || !this.canvas || !this.isTextObject) return;
    (this.selectedObject as fabric.Textbox).set('lineHeight', value);
    this.canvas.renderAll();
  }

  onCharSpacingChange(value: number): void {
    if (!this.selectedObject || !this.canvas || !this.isTextObject) return;
    (this.selectedObject as fabric.Textbox).set('charSpacing', value);
    this.canvas.renderAll();
  }

  // ── Arrangement handlers ───────────────────────────────────────────

  bringToFront(): void {
    if (!this.selectedObject || !this.canvas) return;
    this.canvas.bringObjectToFront(this.selectedObject);
    this.canvas.renderAll();
  }

  sendToBack(): void {
    if (!this.selectedObject || !this.canvas) return;
    this.canvas.sendObjectToBack(this.selectedObject);
    this.canvas.renderAll();
  }

  bringForward(): void {
    if (!this.selectedObject || !this.canvas) return;
    this.canvas.bringObjectForward(this.selectedObject);
    this.canvas.renderAll();
  }

  sendBackward(): void {
    if (!this.selectedObject || !this.canvas) return;
    this.canvas.sendObjectBackwards(this.selectedObject);
    this.canvas.renderAll();
  }

  alignTo(alignment: string): void {
    if (!this.selectedObject || !this.canvas) return;
    const obj = this.selectedObject;
    const canvasW = this.canvas.getWidth();
    const canvasH = this.canvas.getHeight();
    const objW = (obj.width ?? 0) * (obj.scaleX ?? 1);
    const objH = (obj.height ?? 0) * (obj.scaleY ?? 1);

    switch (alignment) {
      case 'left':
        obj.set('left', 0);
        break;
      case 'centerH':
        obj.set('left', (canvasW - objW) / 2);
        break;
      case 'right':
        obj.set('left', canvasW - objW);
        break;
      case 'top':
        obj.set('top', 0);
        break;
      case 'centerV':
        obj.set('top', (canvasH - objH) / 2);
        break;
      case 'bottom':
        obj.set('top', canvasH - objH);
        break;
    }

    obj.setCoords();
    this.readObjectProperties();
    this.canvas.renderAll();
  }

  flipHorizontal(): void {
    if (!this.selectedObject || !this.canvas) return;
    this.selectedObject.set('flipX', !this.selectedObject.flipX);
    this.canvas.renderAll();
  }

  flipVertical(): void {
    if (!this.selectedObject || !this.canvas) return;
    this.selectedObject.set('flipY', !this.selectedObject.flipY);
    this.canvas.renderAll();
  }

  // ── Canvas event binding ───────────────────────────────────────────

  private bindCanvasEvents(): void {
    if (!this.canvas || this.canvasEventsBound) return;

    this.canvas.on('object:modified', () => {
      this.readObjectProperties();
    });

    this.canvas.on('object:moving', () => {
      this.readObjectProperties();
    });

    this.canvas.on('object:scaling', () => {
      this.readObjectProperties();
    });

    this.canvas.on('object:rotating', () => {
      this.readObjectProperties();
    });

    this.canvasEventsBound = true;
  }

  private unbindCanvasEvents(): void {
    if (!this.canvas) return;
    this.canvas.off('object:modified');
    this.canvas.off('object:moving');
    this.canvas.off('object:scaling');
    this.canvas.off('object:rotating');
    this.canvasEventsBound = false;
  }
}
