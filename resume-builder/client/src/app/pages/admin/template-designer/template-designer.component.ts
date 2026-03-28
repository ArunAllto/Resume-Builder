import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ToastService } from '../../../shared/services/toast.service';
import { ArtboardElement, PageSettings, PAGE_SIZES, MARGIN_PRESETS, SHAPE_DEFS, ICON_DEFS, RESUME_FIELD_BINDINGS } from '../../../core/models/artboard.model';
import { SaveDialogComponent } from './save-dialog/save-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-template-designer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SaveDialogComponent],
  templateUrl: './template-designer.component.html',
  styleUrls: ['./template-designer.component.scss'],
})
export class TemplateDesignerComponent implements AfterViewInit, OnDestroy {

  // ── Constants ──────────────────────────────────────────────────────────
  readonly PX_PER_MM = 3.78;
  readonly SHAPE_DEFS = SHAPE_DEFS;
  readonly ICON_DEFS = ICON_DEFS;
  readonly RESUME_FIELD_BINDINGS = RESUME_FIELD_BINDINGS;
  readonly PAGE_SIZES = PAGE_SIZES;
  readonly MARGIN_PRESETS = MARGIN_PRESETS;

  // ── Ruler canvases ─────────────────────────────────────────────────────
  @ViewChild('rulerH') rulerHCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('rulerV') rulerVCanvas!: ElementRef<HTMLCanvasElement>;

  // ── Page settings ──────────────────────────────────────────────────────
  pageSettings: PageSettings = {
    size: 'a4',
    orientation: 'portrait',
    marginPreset: 'normal',
    marginTop: 20,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 20,
    backgroundColor: '#ffffff',
    watermarkText: '',
    watermarkImageUrl: '',
    watermarkOpacity: 30,
    pageBorderColor: '#000000',
    pageBorderWidth: 0,
    pageBorderStyle: 'solid',
  };

  // ── Artboard computed dimensions (px) ──────────────────────────────────
  artboardWidth = 0;
  artboardHeight = 0;

  // ── Artboard shorthand aliases (used in template) ────────────────────
  get artboardW(): number { return this.artboardWidth; }
  get artboardH(): number { return this.artboardHeight; }

  // ── Undo / Redo getters (used in template) ───────────────────────────
  get canUndo(): boolean { return this.historyIndex > 0; }
  get canRedo(): boolean { return this.historyIndex < this.history.length - 1; }

  // ── Elements ───────────────────────────────────────────────────────────
  elements: ArtboardElement[] = [];
  selectedElement: ArtboardElement | null = null;
  nextElementId = 1;

  // ── Sidebar drawer ─────────────────────────────────────────────────────
  activeDrawer: string | null = null;
  drawerLabel = '';

  // ── Dragging ───────────────────────────────────────────────────────────
  isDragging = false;
  dragOffsetX = 0;
  dragOffsetY = 0;
  dragElement: ArtboardElement | null = null;

  // ── Resizing ───────────────────────────────────────────────────────────
  isResizing = false;
  resizeHandle = '';
  resizeStartData: {
    mouseX: number; mouseY: number;
    elX: number; elY: number;
    elW: number; elH: number;
  } | null = null;
  resizeElement: ArtboardElement | null = null;

  // ── Text editing ───────────────────────────────────────────────────────
  editingElementId: number | null = null;

  // ── Table cell editing ─────────────────────────────────────────────────
  editingCell: { row: number; col: number } | null = null;

  // ── Zoom / Pan ─────────────────────────────────────────────────────────
  zoom = 1;
  panX = 0;
  panY = 0;

  // ── Undo / Redo ────────────────────────────────────────────────────────
  history: string[] = [];
  historyIndex = -1;

  // ── Save dialog ────────────────────────────────────────────────────────
  showSaveDialog = false;
  templateName = 'Untitled Template';

  // ── Property panel bindings ────────────────────────────────────────────
  propX = 0;
  propY = 0;
  propW = 0;
  propH = 0;
  propRotation = 0;
  propRadius = 0;

  propFontFamily = 'Inter';
  propFontSize = 14;
  propFontWeight = 'normal';
  propFontStyle = 'normal';
  propTextDecoration = 'none';
  propTextAlign = 'left';
  propTextColor = '#26282b';
  propLineHeight = '1.5';
  propLetterSpacing = '0';
  propTextTransform = 'none';

  propFillColor = '#e2e8f0';
  propFillOpacity = 100;
  propStrokeColor = '#94a3b8';
  propStrokeWidth = 1;
  propStrokeStyle = 'solid';
  propStrokeOpacity = 100;

  propHasShadow = false;
  propShadowColor = '#00000040';
  propShadowBlur = 4;
  propShadowSpread = 0;
  propShadowOffsetX = 2;
  propShadowOffsetY = 2;

  propImageFit = 'cover';

  propShapeType = 'rectangle';
  propCornerCount = 5;
  propCornerRatio = 0.5;

  propTableRows = 3;
  propTableCols = 3;

  propColumnCount = 2;
  propColumnGap = 10;

  // ── Aliases for template (lowercase versions of constants) ────────────
  shapeDefs = SHAPE_DEFS;
  iconDefs = ICON_DEFS;
  resumeFieldBindings = RESUME_FIELD_BINDINGS;

  // ── Mouse tracking ───────────────────────────────────────────────────
  mouseX = 0;
  mouseY = 0;

  // ── Default font settings ────────────────────────────────────────────
  defaultFontFamily = 'Inter';
  defaultFontSize = 14;

  // ── Image drawer ─────────────────────────────────────────────────────
  imageUrlInput = '';

  // ── Table creation drawer ────────────────────────────────────────────
  newTableRows = 3;
  newTableCols = 3;
  newTableHasHeader = true;

  // ── QR code creation ─────────────────────────────────────────────────
  newQrContent = '';

  // ── Template placeholder value (used in Angular interpolation) ───────
  value = '';

  constructor(
    private ngZone: NgZone,
    private http: HttpClient,
    private toast: ToastService,
    private sanitizer: DomSanitizer,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════
  // Lifecycle
  // ═══════════════════════════════════════════════════════════════════════

  ngAfterViewInit(): void {
    this.updateArtboardSize();
    this.saveHistory();
    setTimeout(() => this.drawRulers(), 0);
  }

  ngOnDestroy(): void {
    // cleanup placeholder
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Artboard sizing
  // ═══════════════════════════════════════════════════════════════════════

  updateArtboardSize(): void {
    const pageDef = PAGE_SIZES[this.pageSettings.size] || PAGE_SIZES['a4'];
    let wMm = pageDef.w;
    let hMm = pageDef.h;
    if (this.pageSettings.orientation === 'landscape') {
      const tmp = wMm;
      wMm = hMm;
      hMm = tmp;
    }
    this.artboardWidth = Math.round(wMm * this.PX_PER_MM);
    this.artboardHeight = Math.round(hMm * this.PX_PER_MM);
    setTimeout(() => this.drawRulers(), 0);
  }

  onPageSizeChange(): void {
    this.updateArtboardSize();
  }

  onOrientationChange(): void {
    this.updateArtboardSize();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Drawer (left sidebar inner panels)
  // ═══════════════════════════════════════════════════════════════════════

  openDrawer(category: string): void {
    const labels: Record<string, string> = {
      text: 'Text',
      shapes: 'Shapes',
      image: 'Image',
      qrcode: 'QR Code',
      columns: 'Columns',
      icons: 'Icons',
      margins: 'Margins',
      background: 'Background',
      table: 'Table',
    };
    if (this.activeDrawer === category) {
      this.closeDrawer();
      return;
    }
    this.activeDrawer = category;
    this.drawerLabel = labels[category] || category;
  }

  closeDrawer(): void {
    this.activeDrawer = null;
    this.drawerLabel = '';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Element creation helpers
  // ═══════════════════════════════════════════════════════════════════════

  private baseElement(type: ArtboardElement['type'], w: number, h: number): ArtboardElement {
    const id = this.nextElementId++;
    const marginLeft = this.pageSettings.marginLeft * this.PX_PER_MM;
    const marginTop = this.pageSettings.marginTop * this.PX_PER_MM;
    const marginRight = this.pageSettings.marginRight * this.PX_PER_MM;
    const marginBottom = this.pageSettings.marginBottom * this.PX_PER_MM;
    const usableW = this.artboardWidth - marginLeft - marginRight;
    const usableH = this.artboardHeight - marginTop - marginBottom;

    return {
      id,
      type,
      x: Math.round(marginLeft + Math.max(0, (usableW - w) / 2)),
      y: Math.round(marginTop + Math.max(0, (usableH - h) / 4)),
      width: w,
      height: h,
      rotation: 0,
      borderRadius: 0,
      opacity: 100,
      zIndex: this.elements.length + 1,
      name: `${type}-${id}`,
    };
  }

  addElement(type: ArtboardElement['type'], options?: Partial<ArtboardElement>): ArtboardElement {
    const w = options?.width ?? 200;
    const h = options?.height ?? 100;
    const base = this.baseElement(type, w, h);
    const el: ArtboardElement = { ...base, ...options, id: base.id, zIndex: base.zIndex };
    this.elements.push(el);
    this.selectElement(el);
    this.saveHistory();
    return el;
  }

  deleteElement(): void {
    if (!this.selectedElement) return;
    this.elements = this.elements.filter(e => e.id !== this.selectedElement!.id);
    this.selectedElement = null;
    this.saveHistory();
  }

  duplicateElement(): void {
    if (!this.selectedElement) return;
    const src = this.selectedElement;
    const id = this.nextElementId++;
    const clone: ArtboardElement = {
      ...JSON.parse(JSON.stringify(src)),
      id,
      x: src.x + 20,
      y: src.y + 20,
      zIndex: this.elements.length + 1,
      name: `${src.type}-${id}`,
    };
    this.elements.push(clone);
    this.selectElement(clone);
    this.saveHistory();
  }

  selectElement(el: ArtboardElement): void {
    this.selectedElement = el;
    this.syncPropsFromElement(el);
  }

  deselectAll(): void {
    this.selectedElement = null;
    this.editingElementId = null;
    this.editingCell = null;
  }

  // ─── Text ──────────────────────────────────────────────────────────────

  addTextElement(variant: 'heading' | 'textbox' | 'paragraph'): void {
    const defaults: Record<string, Partial<ArtboardElement>> = {
      heading: {
        width: 400, height: 50, text: 'Heading',
        fontSize: 28, fontWeight: 'bold', fontFamily: 'Inter',
        textColor: '#26282b', textAlign: 'left', lineHeight: '1.3',
        letterSpacing: '0', textTransform: 'none', fontStyle: 'normal',
        textDecoration: 'none',
      },
      textbox: {
        width: 300, height: 40, text: 'Text box',
        fontSize: 14, fontWeight: 'normal', fontFamily: 'Inter',
        textColor: '#26282b', textAlign: 'left', lineHeight: '1.5',
        letterSpacing: '0', textTransform: 'none', fontStyle: 'normal',
        textDecoration: 'none',
      },
      paragraph: {
        width: 400, height: 120,
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        fontSize: 13, fontWeight: 'normal', fontFamily: 'Inter',
        textColor: '#4a5568', textAlign: 'left', lineHeight: '1.6',
        letterSpacing: '0', textTransform: 'none', fontStyle: 'normal',
        textDecoration: 'none',
      },
    };
    this.addElement('text', defaults[variant]);
    this.closeDrawer();
  }

  // ─── Shapes ────────────────────────────────────────────────────────────

  addShapeElement(shapeType: string): void {
    const sizeDefs: Record<string, { w: number; h: number }> = {
      rectangle: { w: 200, h: 100 },
      square: { w: 120, h: 120 },
      circle: { w: 120, h: 120 },
      oval: { w: 180, h: 100 },
      triangle: { w: 140, h: 120 },
      star: { w: 120, h: 120 },
      arrow: { w: 160, h: 60 },
      line: { w: 200, h: 4 },
      hexagon: { w: 130, h: 120 },
      pentagon: { w: 130, h: 120 },
    };
    const size = sizeDefs[shapeType] || { w: 150, h: 100 };
    this.addElement('shape', {
      width: size.w,
      height: size.h,
      shapeType,
      fillColor: '#e2e8f0',
      fillOpacity: 100,
      strokeColor: '#94a3b8',
      strokeWidth: 1,
      strokeStyle: 'solid',
      strokeOpacity: 100,
      strokeAlignment: 'center',
      borderRadius: shapeType === 'rectangle' ? 4 : 0,
      cornerCount: 5,
      cornerRatio: 0.5,
    });
    this.closeDrawer();
  }

  // ─── Image ─────────────────────────────────────────────────────────────

  addImageElement(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.ngZone.run(() => {
          this.addElement('image', {
            width: 200,
            height: 200,
            imageUrl: reader.result as string,
            imageFit: 'cover',
            borderRadius: 0,
          });
          this.closeDrawer();
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  addImageFromUrl(url?: string): void {
    const resolvedUrl = url ?? this.imageUrlInput;
    if (!resolvedUrl || !resolvedUrl.trim()) return;
    const urlTrimmed = resolvedUrl.trim();
    this.addElement('image', {
      width: 200,
      height: 200,
      imageUrl: urlTrimmed,
      imageFit: 'cover',
      borderRadius: 0,
    });
    this.imageUrlInput = '';
    this.closeDrawer();
  }

  // ─── Columns ───────────────────────────────────────────────────────────

  addColumnElement(count: number): void {
    const widths = Array(count).fill(Math.round(100 / count));
    this.addElement('columns', {
      width: 500,
      height: 300,
      columnCount: count,
      columnWidths: widths,
      columnGap: 10,
      columnFill: '#ffffff',
      columnStroke: '#e2e8f0',
      columnStrokeWidth: 1,
      children: Array.from({ length: count }, () => []),
    });
    this.closeDrawer();
  }

  // ─── Icons ─────────────────────────────────────────────────────────────

  addIconElement(iconDef: any): void {
    this.addElement('icon', {
      width: 24,
      height: 24,
      text: iconDef.svg,
      fillColor: '#26282b',
      name: `icon-${iconDef.name}`,
    });
    this.closeDrawer();
  }

  uploadSvgIcon(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.ngZone.run(() => {
          this.addElement('icon', {
            width: 24,
            height: 24,
            text: reader.result as string,
            fillColor: '#26282b',
            name: 'icon-custom',
          });
          this.closeDrawer();
        });
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // ─── Table ─────────────────────────────────────────────────────────────

  addTableElement(): void {
    const rows = 3;
    const cols = 3;
    const tableData: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''));
    this.addElement('table', {
      width: 400,
      height: 200,
      tableRows: rows,
      tableCols: cols,
      tableData,
      tableHeaderBg: '#f1f5f9',
      tableBorderColor: '#cbd5e1',
      hasTableHeader: true,
      hasTableFooter: false,
      stripedRows: false,
    });
    this.closeDrawer();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Element dragging on canvas
  // ═══════════════════════════════════════════════════════════════════════

  onElementMouseDown(event: MouseEvent, el: ArtboardElement): void {
    if (el.locked) return;
    if (this.editingElementId === el.id) return;
    event.preventDefault();
    event.stopPropagation();
    this.selectElement(el);

    this.isDragging = true;
    this.dragElement = el;
    this.dragOffsetX = (event.clientX / this.zoom) - el.x;
    this.dragOffsetY = (event.clientY / this.zoom) - el.y;
  }

  @HostListener('document:mousemove', ['$event'])
  onDocMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.dragElement) {
      const el = this.dragElement;
      let newX = (event.clientX / this.zoom) - this.dragOffsetX;
      let newY = (event.clientY / this.zoom) - this.dragOffsetY;

      // Clamp to margin bounds
      const mLeft = this.pageSettings.marginLeft * this.PX_PER_MM;
      const mTop = this.pageSettings.marginTop * this.PX_PER_MM;
      const mRight = this.artboardWidth - (this.pageSettings.marginRight * this.PX_PER_MM);
      const mBottom = this.artboardHeight - (this.pageSettings.marginBottom * this.PX_PER_MM);

      newX = Math.max(mLeft, Math.min(newX, mRight - el.width));
      newY = Math.max(mTop, Math.min(newY, mBottom - el.height));

      el.x = Math.round(newX);
      el.y = Math.round(newY);
      this.propX = el.x;
      this.propY = el.y;
      return;
    }

    if (this.isResizing && this.resizeElement && this.resizeStartData) {
      const dx = (event.clientX - this.resizeStartData.mouseX) / this.zoom;
      const dy = (event.clientY - this.resizeStartData.mouseY) / this.zoom;
      const s = this.resizeStartData;
      const minSize = 10;

      let newX = s.elX;
      let newY = s.elY;
      let newW = s.elW;
      let newH = s.elH;

      const handle = this.resizeHandle;

      // Horizontal
      if (handle.includes('e')) {
        newW = Math.max(minSize, s.elW + dx);
      }
      if (handle.includes('w')) {
        const maxDx = s.elW - minSize;
        const clampedDx = Math.min(dx, maxDx);
        newX = s.elX + clampedDx;
        newW = s.elW - clampedDx;
      }

      // Vertical
      if (handle.includes('s')) {
        newH = Math.max(minSize, s.elH + dy);
      }
      if (handle.includes('n')) {
        const maxDy = s.elH - minSize;
        const clampedDy = Math.min(dy, maxDy);
        newY = s.elY + clampedDy;
        newH = s.elH - clampedDy;
      }

      this.resizeElement.x = Math.round(newX);
      this.resizeElement.y = Math.round(newY);
      this.resizeElement.width = Math.round(newW);
      this.resizeElement.height = Math.round(newH);

      this.propX = this.resizeElement.x;
      this.propY = this.resizeElement.y;
      this.propW = this.resizeElement.width;
      this.propH = this.resizeElement.height;
    }
  }

  @HostListener('document:mouseup')
  onDocMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragElement = null;
      this.saveHistory();
    }
    if (this.isResizing) {
      this.isResizing = false;
      this.resizeElement = null;
      this.resizeStartData = null;
      this.saveHistory();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Element resizing (8 handles)
  // ═══════════════════════════════════════════════════════════════════════

  onResizeStart(event: MouseEvent, el: ArtboardElement, handle: string): void {
    if (el.locked) return;
    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.resizeHandle = handle;
    this.resizeElement = el;
    this.resizeStartData = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      elX: el.x,
      elY: el.y,
      elW: el.width,
      elH: el.height,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Text editing
  // ═══════════════════════════════════════════════════════════════════════

  onElementDblClick(el: ArtboardElement): void {
    if (el.type === 'text') {
      this.editingElementId = el.id;
    }
  }

  onTextBlur(el: ArtboardElement, event: Event): void {
    const target = event.target as HTMLElement;
    el.text = target.innerText;
    this.editingElementId = null;
    this.saveHistory();
  }

  onTextInput(el: ArtboardElement, event: Event): void {
    const target = event.target as HTMLElement;
    el.text = target.innerText;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Table cell editing
  // ═══════════════════════════════════════════════════════════════════════

  onCellDblClick(el: ArtboardElement, row: number, col: number): void {
    this.editingCell = { row, col };
  }

  onCellBlur(el: ArtboardElement, row: number, col: number, event: Event): void {
    const target = event.target as HTMLElement;
    if (el.tableData && el.tableData[row]) {
      el.tableData[row][col] = target.innerText;
    }
    this.editingCell = null;
    this.saveHistory();
  }

  addTableRow(el: ArtboardElement): void {
    if (!el.tableData || !el.tableCols) return;
    el.tableData.push(Array(el.tableCols).fill(''));
    el.tableRows = el.tableData.length;
    this.propTableRows = el.tableRows;
    this.saveHistory();
  }

  removeTableRow(el: ArtboardElement): void {
    if (!el.tableData || el.tableData.length <= 1) return;
    el.tableData.pop();
    el.tableRows = el.tableData.length;
    this.propTableRows = el.tableRows;
    this.saveHistory();
  }

  addTableCol(el: ArtboardElement): void {
    if (!el.tableData) return;
    el.tableData.forEach(row => row.push(''));
    el.tableCols = el.tableData[0].length;
    this.propTableCols = el.tableCols;
    this.saveHistory();
  }

  removeTableCol(el: ArtboardElement): void {
    if (!el.tableData || !el.tableData[0] || el.tableData[0].length <= 1) return;
    el.tableData.forEach(row => row.pop());
    el.tableCols = el.tableData[0].length;
    this.propTableCols = el.tableCols;
    this.saveHistory();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Property panel sync
  // ═══════════════════════════════════════════════════════════════════════

  syncPropsFromElement(el: ArtboardElement): void {
    this.propX = el.x;
    this.propY = el.y;
    this.propW = el.width;
    this.propH = el.height;
    this.propRotation = el.rotation;
    this.propRadius = el.borderRadius;

    // Text
    this.propFontFamily = el.fontFamily ?? 'Inter';
    this.propFontSize = el.fontSize ?? 14;
    this.propFontWeight = el.fontWeight ?? 'normal';
    this.propFontStyle = el.fontStyle ?? 'normal';
    this.propTextDecoration = el.textDecoration ?? 'none';
    this.propTextAlign = el.textAlign ?? 'left';
    this.propTextColor = el.textColor ?? '#26282b';
    this.propLineHeight = el.lineHeight ?? '1.5';
    this.propLetterSpacing = el.letterSpacing ?? '0';
    this.propTextTransform = el.textTransform ?? 'none';

    // Fill / stroke
    this.propFillColor = el.fillColor ?? '#e2e8f0';
    this.propFillOpacity = el.fillOpacity ?? 100;
    this.propStrokeColor = el.strokeColor ?? '#94a3b8';
    this.propStrokeWidth = el.strokeWidth ?? 1;
    this.propStrokeStyle = el.strokeStyle ?? 'solid';
    this.propStrokeOpacity = el.strokeOpacity ?? 100;

    // Shadow
    this.propHasShadow = el.hasShadow ?? false;
    this.propShadowColor = el.shadowColor ?? '#00000040';
    this.propShadowBlur = el.shadowBlur ?? 4;
    this.propShadowSpread = el.shadowSpread ?? 0;
    this.propShadowOffsetX = el.shadowOffsetX ?? 2;
    this.propShadowOffsetY = el.shadowOffsetY ?? 2;

    // Image
    this.propImageFit = el.imageFit ?? 'cover';

    // Shape
    this.propShapeType = el.shapeType ?? 'rectangle';
    this.propCornerCount = el.cornerCount ?? 5;
    this.propCornerRatio = el.cornerRatio ?? 0.5;

    // Table
    this.propTableRows = el.tableRows ?? 3;
    this.propTableCols = el.tableCols ?? 3;

    // Columns
    this.propColumnCount = el.columnCount ?? 2;
    this.propColumnGap = el.columnGap ?? 10;
  }

  onPropChange(field?: string): void {
    if (!this.selectedElement) return;
    const el = this.selectedElement;

    // When called without a specific field (from template bindings),
    // sync all props from the element and save history
    if (!field) {
      this.syncPropsFromElement(el);
      this.saveHistory();
      return;
    }

    switch (field) {
      // Position / size
      case 'x': el.x = this.propX; break;
      case 'y': el.y = this.propY; break;
      case 'width': el.width = this.propW; break;
      case 'height': el.height = this.propH; break;
      case 'rotation': el.rotation = this.propRotation; break;
      case 'borderRadius': el.borderRadius = this.propRadius; break;

      // Text
      case 'fontFamily': el.fontFamily = this.propFontFamily; break;
      case 'fontSize': el.fontSize = this.propFontSize; break;
      case 'fontWeight': el.fontWeight = this.propFontWeight; break;
      case 'fontStyle': el.fontStyle = this.propFontStyle; break;
      case 'textDecoration': el.textDecoration = this.propTextDecoration; break;
      case 'textAlign': el.textAlign = this.propTextAlign; break;
      case 'textColor': el.textColor = this.propTextColor; break;
      case 'lineHeight': el.lineHeight = this.propLineHeight; break;
      case 'letterSpacing': el.letterSpacing = this.propLetterSpacing; break;
      case 'textTransform': el.textTransform = this.propTextTransform; break;

      // Fill / stroke
      case 'fillColor': el.fillColor = this.propFillColor; break;
      case 'fillOpacity': el.fillOpacity = this.propFillOpacity; break;
      case 'strokeColor': el.strokeColor = this.propStrokeColor; break;
      case 'strokeWidth': el.strokeWidth = this.propStrokeWidth; break;
      case 'strokeStyle': el.strokeStyle = this.propStrokeStyle; break;
      case 'strokeOpacity': el.strokeOpacity = this.propStrokeOpacity; break;

      // Shadow
      case 'hasShadow':
        el.hasShadow = this.propHasShadow;
        if (this.propHasShadow) {
          el.shadowColor = el.shadowColor ?? this.propShadowColor;
          el.shadowBlur = el.shadowBlur ?? this.propShadowBlur;
          el.shadowSpread = el.shadowSpread ?? this.propShadowSpread;
          el.shadowOffsetX = el.shadowOffsetX ?? this.propShadowOffsetX;
          el.shadowOffsetY = el.shadowOffsetY ?? this.propShadowOffsetY;
        }
        break;
      case 'shadowColor': el.shadowColor = this.propShadowColor; break;
      case 'shadowBlur': el.shadowBlur = this.propShadowBlur; break;
      case 'shadowSpread': el.shadowSpread = this.propShadowSpread; break;
      case 'shadowOffsetX': el.shadowOffsetX = this.propShadowOffsetX; break;
      case 'shadowOffsetY': el.shadowOffsetY = this.propShadowOffsetY; break;

      // Image
      case 'imageFit': el.imageFit = this.propImageFit; break;

      // Shape
      case 'shapeType': el.shapeType = this.propShapeType; break;
      case 'cornerCount': el.cornerCount = this.propCornerCount; break;
      case 'cornerRatio': el.cornerRatio = this.propCornerRatio; break;

      // Table
      case 'tableRows': el.tableRows = this.propTableRows; break;
      case 'tableCols': el.tableCols = this.propTableCols; break;

      // Columns
      case 'columnCount':
        el.columnCount = this.propColumnCount;
        el.columnWidths = Array(this.propColumnCount).fill(Math.round(100 / this.propColumnCount));
        break;
      case 'columnGap': el.columnGap = this.propColumnGap; break;

      // Data binding
      case 'dataBinding': break; // Already set directly on element
    }

    this.saveHistory();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Color picker handler
  // ═══════════════════════════════════════════════════════════════════════

  onColorPickerChange(field: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    switch (field) {
      case 'textColor': this.propTextColor = value; break;
      case 'fillColor': this.propFillColor = value; break;
      case 'strokeColor': this.propStrokeColor = value; break;
      case 'shadowColor': this.propShadowColor = value; break;
    }
    this.onPropChange(field);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Margin handling
  // ═══════════════════════════════════════════════════════════════════════

  onMarginPresetChange(preset: string): void {
    this.pageSettings.marginPreset = preset as PageSettings['marginPreset'];
    // Only apply preset values for non-custom presets; for custom, preserve current values
    if (preset !== 'custom') {
      const presetValues = MARGIN_PRESETS[preset];
      if (presetValues) {
        this.pageSettings.marginTop = presetValues.top;
        this.pageSettings.marginRight = presetValues.right;
        this.pageSettings.marginBottom = presetValues.bottom;
        this.pageSettings.marginLeft = presetValues.left;
      }
    }
  }

  onCustomMarginChange(): void {
    this.pageSettings.marginPreset = 'custom';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Page background
  // ═══════════════════════════════════════════════════════════════════════

  onBgColorChange(): void {
    // pageSettings.backgroundColor bound via ngModel
  }

  onWatermarkChange(): void {
    // pageSettings.watermarkText / watermarkOpacity bound via ngModel
  }

  uploadWatermarkImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.ngZone.run(() => {
          this.pageSettings.watermarkImageUrl = reader.result as string;
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Rulers (horizontal + vertical)
  // ═══════════════════════════════════════════════════════════════════════

  drawRulers(): void {
    this.drawHorizontalRuler();
    this.drawVerticalRuler();
  }

  private drawHorizontalRuler(): void {
    const canvas = this.rulerHCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const totalPx = this.artboardWidth * this.zoom;
    canvas.width = totalPx + 40;
    canvas.height = 24;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 0.5);
    ctx.lineTo(canvas.width, canvas.height - 0.5);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';

    const stepMm = this.zoom >= 0.7 ? 10 : 20;
    const pageDef = PAGE_SIZES[this.pageSettings.size] || PAGE_SIZES['a4'];
    const totalMm = this.pageSettings.orientation === 'landscape' ? pageDef.h : pageDef.w;

    for (let mm = 0; mm <= totalMm; mm += stepMm) {
      const xPx = mm * this.PX_PER_MM * this.zoom;
      const isCm = mm % 10 === 0;
      const tickH = isCm ? 12 : 6;
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(xPx + 0.5, canvas.height);
      ctx.lineTo(xPx + 0.5, canvas.height - tickH);
      ctx.stroke();
      if (isCm && mm > 0) {
        ctx.fillText(`${mm / 10}`, xPx, canvas.height - 13);
      }
    }
  }

  private drawVerticalRuler(): void {
    const canvas = this.rulerVCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const totalPx = this.artboardHeight * this.zoom;
    canvas.width = 24;
    canvas.height = totalPx + 40;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 0.5, 0);
    ctx.lineTo(canvas.width - 0.5, canvas.height);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '9px Inter, sans-serif';

    const stepMm = this.zoom >= 0.7 ? 10 : 20;
    const pageDef = PAGE_SIZES[this.pageSettings.size] || PAGE_SIZES['a4'];
    const totalMm = this.pageSettings.orientation === 'landscape' ? pageDef.w : pageDef.h;

    for (let mm = 0; mm <= totalMm; mm += stepMm) {
      const yPx = mm * this.PX_PER_MM * this.zoom;
      const isCm = mm % 10 === 0;
      const tickW = isCm ? 12 : 6;
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(canvas.width, yPx + 0.5);
      ctx.lineTo(canvas.width - tickW, yPx + 0.5);
      ctx.stroke();
      if (isCm && mm > 0) {
        ctx.save();
        ctx.translate(canvas.width - 14, yPx);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(`${mm / 10}`, 0, 0);
        ctx.restore();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Zoom / Pan
  // ═══════════════════════════════════════════════════════════════════════

  zoomIn(): void {
    this.zoom = Math.min(3, +(this.zoom + 0.1).toFixed(2));
    this.drawRulers();
  }

  zoomOut(): void {
    this.zoom = Math.max(0.2, +(this.zoom - 0.1).toFixed(2));
    this.drawRulers();
  }

  zoomFit(): void {
    const viewportW = window.innerWidth - 600;
    const viewportH = window.innerHeight - 100;
    const scaleX = viewportW / this.artboardWidth;
    const scaleY = viewportH / this.artboardHeight;
    this.zoom = Math.min(scaleX, scaleY, 1);
    this.zoom = Math.max(0.2, +this.zoom.toFixed(2));
    this.panX = 0;
    this.panY = 0;
    this.drawRulers();
  }

  zoomReset(): void {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.drawRulers();
  }

  onCanvasWheel(event: WheelEvent): void {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.05 : 0.05;
      this.zoom = Math.max(0.2, Math.min(3, +(this.zoom + delta).toFixed(2)));
      this.drawRulers();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Undo / Redo
  // ═══════════════════════════════════════════════════════════════════════

  saveHistory(): void {
    const snapshot = JSON.stringify(this.elements);

    // Trim forward entries when not at end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(snapshot);

    // Cap at 50
    if (this.history.length > 50) {
      this.history.shift();
    }
    this.historyIndex = this.history.length - 1;
  }

  undo(): void {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    this.restoreHistory();
  }

  redo(): void {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex++;
    this.restoreHistory();
  }

  private restoreHistory(): void {
    const snapshot = this.history[this.historyIndex];
    if (!snapshot) return;
    this.elements = JSON.parse(snapshot);
    const maxId = this.elements.reduce((max, el) => Math.max(max, el.id), 0);
    this.nextElementId = maxId + 1;
    this.selectedElement = null;
    this.editingElementId = null;
    this.editingCell = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Save
  // ═══════════════════════════════════════════════════════════════════════

  serializeElements(): ArtboardElement[] {
    return JSON.parse(JSON.stringify(this.elements));
  }

  onTemplateSaved(event: any): void {
    this.showSaveDialog = false;
    this.toast.success('Template saved successfully!');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Keyboard shortcuts
  // ═══════════════════════════════════════════════════════════════════════

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Don't handle shortcuts when editing text or table cells
    if (this.editingElementId !== null || this.editingCell !== null) {
      if (event.key === 'Escape') {
        this.editingElementId = null;
        this.editingCell = null;
      }
      return;
    }

    // Don't intercept when user is typing in an input/textarea/select
    const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const ctrl = event.ctrlKey || event.metaKey;

    // Delete / Backspace
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (this.selectedElement) {
        event.preventDefault();
        this.deleteElement();
      }
      return;
    }

    // Ctrl+Z = undo
    if (ctrl && event.key === 'z') {
      event.preventDefault();
      this.undo();
      return;
    }

    // Ctrl+Y = redo
    if (ctrl && event.key === 'y') {
      event.preventDefault();
      this.redo();
      return;
    }

    // Ctrl+D = duplicate
    if (ctrl && event.key === 'd') {
      event.preventDefault();
      this.duplicateElement();
      return;
    }

    // Arrow keys: nudge
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      if (!this.selectedElement) return;
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      switch (event.key) {
        case 'ArrowUp': this.selectedElement.y -= step; break;
        case 'ArrowDown': this.selectedElement.y += step; break;
        case 'ArrowLeft': this.selectedElement.x -= step; break;
        case 'ArrowRight': this.selectedElement.x += step; break;
      }
      this.propX = this.selectedElement.x;
      this.propY = this.selectedElement.y;
      this.saveHistory();
      return;
    }

    // Escape: deselect
    if (event.key === 'Escape') {
      this.deselectAll();
      this.closeDrawer();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Canvas click-away to deselect
  // ═══════════════════════════════════════════════════════════════════════

  onArtboardClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('artboard-surface')) {
      this.deselectAll();
    }
  }

  onArtboardMouseDown(event: MouseEvent): void {
    // Deselect when clicking directly on the artboard background (not on a child element)
    if (event.target === event.currentTarget) {
      this.deselectAll();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Helper methods
  // ═══════════════════════════════════════════════════════════════════════

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  getElementStyle(el: ArtboardElement): Record<string, string> {
    const style: Record<string, string> = {
      position: 'absolute',
      left: `${el.x}px`,
      top: `${el.y}px`,
      width: `${el.width}px`,
      height: `${el.height}px`,
      transform: `rotate(${el.rotation}deg)`,
      opacity: `${(el.opacity ?? 100) / 100}`,
      'z-index': `${el.zIndex}`,
      'border-radius': `${el.borderRadius}px`,
    };

    // For shapes that are SVG-rendered, the fill/stroke are inside the SVG element —
    // do NOT apply background-color or CSS border to the container div.
    const isSvgShape = el.type === 'shape';

    // Stroke / border — only for non-shape elements (columns, table)
    if (!isSvgShape) {
      if (el.strokeWidth && el.strokeWidth > 0 && el.strokeColor) {
        const sw = el.strokeWidth;
        const sc = this.getColorWithOpacity(el.strokeColor, el.strokeOpacity ?? 100);
        const dashStyle = el.strokeStyle === 'dashed' ? 'dashed' : el.strokeStyle === 'dotted' ? 'dotted' : 'solid';
        const alignment = el.strokeAlignment || 'center';

        switch (alignment) {
          case 'inside':
            style['box-shadow'] = `inset 0 0 0 ${sw}px ${sc}`;
            style['border'] = 'none';
            break;
          case 'outside':
            style['outline'] = `${sw}px ${dashStyle} ${sc}`;
            style['outline-offset'] = '0px';
            style['border'] = 'none';
            break;
          default: // center
            style['border'] = `${sw}px ${dashStyle} ${sc}`;
            break;
        }
      }
    }

    // Fill — apply fillOpacity using rgba for non-shape elements
    if (el.type === 'columns' || el.type === 'table') {
      if (el.fillColor) {
        style['background-color'] = this.getColorWithOpacity(el.fillColor, el.fillOpacity ?? 100);
      }
    }

    // Fill for text elements
    if (el.type === 'text' && el.fillColor) {
      style['background-color'] = this.getColorWithOpacity(el.fillColor, el.fillOpacity ?? 100);
    }

    // Shadow — combine with any existing inset box-shadow from stroke alignment
    if (el.hasShadow) {
      const sx = el.shadowOffsetX ?? 2;
      const sy = el.shadowOffsetY ?? 2;
      const sb = el.shadowBlur ?? 4;
      const ss = el.shadowSpread ?? 0;
      const sc = el.shadowColor ?? '#00000040';
      const dropShadow = `${sx}px ${sy}px ${sb}px ${ss}px ${sc}`;
      if (style['box-shadow']) {
        // prepend drop shadow before existing inset shadow
        style['box-shadow'] = `${dropShadow}, ${style['box-shadow']}`;
      } else {
        style['box-shadow'] = dropShadow;
      }
    }

    // Text styling
    if (el.type === 'text') {
      style['font-family'] = el.fontFamily || 'Inter, sans-serif';
      style['font-size'] = `${el.fontSize || 14}px`;
      style['font-weight'] = el.fontWeight || 'normal';
      style['font-style'] = el.fontStyle || 'normal';
      style['text-decoration'] = el.textDecoration || 'none';
      style['text-align'] = el.textAlign || 'left';
      style['color'] = el.textColor || '#26282b';
      style['line-height'] = el.lineHeight || '1.5';
      style['letter-spacing'] = `${el.letterSpacing || 0}px`;
      style['text-transform'] = el.textTransform || 'none';
      style['direction'] = 'ltr';
      style['unicode-bidi'] = 'plaintext';
      style['overflow'] = 'hidden';
      style['word-wrap'] = 'break-word';
    }

    // Image
    if (el.type === 'image') {
      style['overflow'] = 'hidden';
    }

    // Icon
    if (el.type === 'icon' && el.fillColor) {
      style['color'] = el.fillColor;
    }

    return style;
  }

  private hexToRgba(hex: string, alpha: number): string {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length >= 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }

  getColorWithOpacity(hex: string, opacity: number): string {
    if (!hex || hex === 'none' || hex === 'transparent') return hex || 'transparent';
    if (!hex.startsWith('#')) return hex; // Not a hex color, return as-is
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length >= 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${(opacity ?? 100) / 100})`;
  }

  getSafeIconHtml(svgStr: string, color: string): SafeHtml {
    if (!svgStr) return '';
    const colored = svgStr.replace(/currentColor/g, color || '#000000');
    return this.sanitizer.bypassSecurityTrustHtml(colored);
  }

  getFieldLabel(field: string): string {
    return this.RESUME_FIELD_BINDINGS.find(b => b.value === field)?.label || field;
  }

  getShapeSvgPath(shapeType: string, w: number, h: number, radius?: number, cornerCount?: number, cornerRatio?: number): string {
    switch (shapeType) {
      case 'rectangle':
      case 'square': {
        const r = Math.min(radius || 0, w / 2, h / 2);
        if (r > 0) {
          return `M ${r},0 H ${w - r} Q ${w},0 ${w},${r} V ${h - r} Q ${w},${h} ${w - r},${h} H ${r} Q 0,${h} 0,${h - r} V ${r} Q 0,0 ${r},0 Z`;
        }
        return `M 0,0 H ${w} V ${h} H 0 Z`;
      }
      case 'circle':
      case 'oval': {
        const cx = w / 2;
        const cy = h / 2;
        const rx = w / 2;
        const ry = h / 2;
        return `M ${cx},${cy - ry} A ${rx},${ry} 0 1,1 ${cx},${cy + ry} A ${rx},${ry} 0 1,1 ${cx},${cy - ry} Z`;
      }
      case 'triangle':
        return `M ${w / 2},0 L ${w},${h} L 0,${h} Z`;
      case 'star': {
        const points = cornerCount || 5;
        const outerR = Math.min(w, h) / 2;
        const innerR = outerR * (cornerRatio ?? 0.5);
        const cx = w / 2;
        const cy = h / 2;
        let path = '';
        for (let i = 0; i < points * 2; i++) {
          const angle = (Math.PI * i) / points - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          path += (i === 0 ? 'M ' : 'L ') + `${x.toFixed(2)},${y.toFixed(2)} `;
        }
        return path + 'Z';
      }
      case 'arrow': {
        const midY = h / 2;
        const arrowHeadW = Math.min(h, w * 0.3);
        const shaftH = h * 0.35;
        return `M 0,${midY - shaftH} H ${w - arrowHeadW} V 0 L ${w},${midY} L ${w - arrowHeadW},${h} V ${midY + shaftH} H 0 Z`;
      }
      case 'line':
        return `M 0,${h / 2} L ${w},${h / 2}`;
      case 'hexagon': {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) / 2;
        let path = '';
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          path += (i === 0 ? 'M ' : 'L ') + `${x.toFixed(2)},${y.toFixed(2)} `;
        }
        return path + 'Z';
      }
      case 'pentagon': {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) / 2;
        let path = '';
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          path += (i === 0 ? 'M ' : 'L ') + `${x.toFixed(2)},${y.toFixed(2)} `;
        }
        return path + 'Z';
      }
      default:
        return `M 0,0 H ${w} V ${h} H 0 Z`;
    }
  }

  getElementClipPath(el: ArtboardElement): string {
    if (el.type !== 'shape' || !el.shapeType) return '';
    const st = el.shapeType;

    switch (st) {
      case 'circle':
      case 'oval':
        return 'ellipse(50% 50% at 50% 50%)';
      case 'triangle':
        return 'polygon(50% 0%, 100% 100%, 0% 100%)';
      case 'pentagon': {
        const pts: string[] = [];
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = 50 + 50 * Math.cos(angle);
          const y = 50 + 50 * Math.sin(angle);
          pts.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
        }
        return `polygon(${pts.join(', ')})`;
      }
      case 'hexagon': {
        const pts: string[] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const x = 50 + 50 * Math.cos(angle);
          const y = 50 + 50 * Math.sin(angle);
          pts.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
        }
        return `polygon(${pts.join(', ')})`;
      }
      case 'star': {
        const count = el.cornerCount || 5;
        const ratio = el.cornerRatio ?? 0.5;
        const pts: string[] = [];
        for (let i = 0; i < count * 2; i++) {
          const angle = (Math.PI * i) / count - Math.PI / 2;
          const r = i % 2 === 0 ? 50 : 50 * ratio;
          const x = 50 + r * Math.cos(angle);
          const y = 50 + r * Math.sin(angle);
          pts.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
        }
        return `polygon(${pts.join(', ')})`;
      }
      case 'arrow':
        return 'polygon(0% 30%, 65% 30%, 65% 0%, 100% 50%, 65% 100%, 65% 70%, 0% 70%)';
      default:
        return '';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Missing methods referenced by template
  // ═══════════════════════════════════════════════════════════════════════

  getMarginPreset(preset: string): any {
    return MARGIN_PRESETS[preset];
  }

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.ngZone.run(() => {
        this.addElement('image', {
          width: 200,
          height: 200,
          imageUrl: reader.result as string,
          imageFit: 'cover',
          borderRadius: 0,
        });
        this.closeDrawer();
      });
    };
    reader.readAsDataURL(file);
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.ngZone.run(() => {
        this.addElement('image', {
          width: 200,
          height: 200,
          imageUrl: reader.result as string,
          imageFit: 'cover',
          borderRadius: 0,
        });
        this.closeDrawer();
      });
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    input.value = '';
  }

  addColumnsElement(count: number): void {
    this.addColumnElement(count);
  }

  addQrElement(foreground?: string, background?: string): void {
    this.addElement('qrcode', {
      width: 150,
      height: 150,
      qrContent: this.newQrContent || 'https://example.com',
      qrForeground: foreground || '#000000',
      qrBackground: background || '#ffffff',
      qrMargin: 4,
      qrErrorCorrection: 'M',
    });
    this.newQrContent = '';
    this.closeDrawer();
  }

  onPageSettingChange(): void {
    this.updateArtboardSize();
    this.saveHistory();
  }

  onViewportMouseDown(event: MouseEvent): void {
    // Deselect if clicking on the empty viewport area (not on an element)
    const target = event.target as HTMLElement;
    if (target.classList.contains('viewport') || target.classList.contains('viewport-scroll')) {
      this.deselectAll();
    }
  }

  onViewportMouseMove(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.mouseX = Math.round((event.clientX - rect.left) / this.zoom);
    this.mouseY = Math.round((event.clientY - rect.top) / this.zoom);
  }

  onViewportWheel(event: WheelEvent): void {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.05 : 0.05;
      this.zoom = Math.max(0.2, Math.min(3, +(this.zoom + delta).toFixed(2)));
      this.drawRulers();
    }
  }

  onWatermarkImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.ngZone.run(() => {
        this.pageSettings.watermarkImageUrl = reader.result as string;
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  replaceImage(el?: ArtboardElement): void {
    const target = el || this.selectedElement;
    if (!target || target.type !== 'image') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.ngZone.run(() => {
          target.imageUrl = reader.result as string;
          this.saveHistory();
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  insertImageIntoShape(el?: ArtboardElement): void {
    const target = el || this.selectedElement;
    if (!target || target.type !== 'shape') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.ngZone.run(() => {
          target.imageUrl = reader.result as string;
          target.imageFit = 'cover';
          this.saveHistory();
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  onColumnCountChange(): void {
    if (!this.selectedElement || this.selectedElement.type !== 'columns') return;
    const count = this.selectedElement.columnCount || 2;
    this.selectedElement.columnWidths = Array(count).fill(Math.round(100 / count));
    this.selectedElement.children = Array.from({ length: count }, () => []);
    this.saveHistory();
  }

  onColumnWidthChange(index: number, newWidth?: number): void {
    if (!this.selectedElement || !this.selectedElement.columnWidths) return;
    const widths = this.selectedElement.columnWidths;
    if (newWidth !== undefined) {
      widths[index] = newWidth;
    }
    // Ensure widths sum to ~100
    const total = widths.reduce((sum: number, w: number) => sum + w, 0);
    if (total !== 100 && widths.length > 1) {
      const diff = 100 - total;
      const otherIdx = index === widths.length - 1 ? 0 : widths.length - 1;
      widths[otherIdx] = Math.max(5, widths[otherIdx] + diff);
    }
    this.saveHistory();
  }

  onDefaultFontChange(): void {
    // Apply default font settings — new elements will use these defaults
  }

  onSvgFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.ngZone.run(() => {
        this.addElement('icon', {
          width: 24,
          height: 24,
          text: reader.result as string,
          fillColor: '#26282b',
          name: 'icon-custom',
        });
        this.closeDrawer();
      });
    };
    reader.readAsText(file);
    input.value = '';
  }

  onTableStructureChange(): void {
    if (!this.selectedElement || this.selectedElement.type !== 'table') return;
    const el = this.selectedElement;
    const rows = el.tableRows || 3;
    const cols = el.tableCols || 3;
    // Resize tableData to match new dimensions
    const oldData = el.tableData || [];
    const newData: string[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) =>
        oldData[r]?.[c] ?? ''
      )
    );
    el.tableData = newData;
    this.saveHistory();
  }

  toggleFontWeight(): void {
    if (!this.selectedElement) return;
    this.selectedElement.fontWeight = this.selectedElement.fontWeight === 'bold' ? 'normal' : 'bold';
    this.propFontWeight = this.selectedElement.fontWeight;
    this.saveHistory();
  }

  toggleFontStyle(): void {
    if (!this.selectedElement) return;
    this.selectedElement.fontStyle = this.selectedElement.fontStyle === 'italic' ? 'normal' : 'italic';
    this.propFontStyle = this.selectedElement.fontStyle;
    this.saveHistory();
  }

  toggleTextDecoration(value: string): void {
    if (!this.selectedElement) return;
    this.selectedElement.textDecoration = this.selectedElement.textDecoration === value ? 'none' : value;
    this.propTextDecoration = this.selectedElement.textDecoration;
    this.saveHistory();
  }
}
