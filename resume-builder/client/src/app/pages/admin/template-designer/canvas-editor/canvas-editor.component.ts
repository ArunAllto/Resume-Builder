import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
  NgZone,
} from '@angular/core';
import * as fabric from 'fabric';

@Component({
  selector: 'app-canvas-editor',
  standalone: true,
  imports: [],
  templateUrl: './canvas-editor.component.html',
  styleUrl: './canvas-editor.component.scss',
})
export class CanvasEditorComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('fabricCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrapper') wrapperRef!: ElementRef<HTMLDivElement>;

  @Input() currentTool = 'select';
  @Input() showGrid = true;
  @Input() snapToGrid = false;
  @Input() gridSize = 20;
  @Input() canvasWidth = 595;
  @Input() canvasHeight = 842;

  @Output() canvasReady = new EventEmitter<fabric.Canvas>();
  @Output() selectionChanged = new EventEmitter<fabric.FabricObject[]>();
  @Output() canvasModified = new EventEmitter<void>();

  canvas!: fabric.Canvas;
  private gridLines: fabric.FabricObject[] = [];
  private isDrawing = false;
  private drawStartX = 0;
  private drawStartY = 0;
  private activeShape: fabric.FabricObject | null = null;
  private clipboard: fabric.FabricObject[] = [];
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private destroyed = false;

  private readonly WORKSPACE_PADDING = 100;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initCanvas();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.canvas) return;

    if (changes['currentTool']) {
      this.onToolChanged();
    }
    if (changes['showGrid']) {
      if (this.showGrid) {
        this.drawGrid();
      } else {
        this.clearGrid();
      }
    }
    if (changes['gridSize']) {
      if (this.showGrid) {
        this.clearGrid();
        this.drawGrid();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.canvas) {
      this.canvas.dispose();
    }
  }

  private initCanvas(): void {
    const wrapper = this.wrapperRef.nativeElement;
    const wrapperWidth = wrapper.clientWidth;
    const wrapperHeight = wrapper.clientHeight;

    this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
      width: wrapperWidth,
      height: wrapperHeight,
      backgroundColor: '#2d2d3d',
      selection: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    this.addA4Background();
    if (this.showGrid) {
      this.drawGrid();
    }
    this.centerCanvas();
    this.setupEventHandlers();

    this.ngZone.run(() => {
      this.canvasReady.emit(this.canvas);
    });
  }

  private addA4Background(): void {
    const page = new fabric.Rect({
      left: 0,
      top: 0,
      width: this.canvasWidth,
      height: this.canvasHeight,
      fill: '#ffffff',
      selectable: false,
      evented: false,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.25)',
        blur: 20,
        offsetX: 4,
        offsetY: 4,
      }),
      name: '__page_background',
    });
    (page as fabric.FabricObject & { excludeFromExport: boolean }).excludeFromExport = false;
    this.canvas.add(page);
    this.canvas.sendObjectToBack(page);
  }

  private centerCanvas(): void {
    const wrapper = this.wrapperRef.nativeElement;
    const ww = wrapper.clientWidth;
    const wh = wrapper.clientHeight;
    const zoom = Math.min(
      (ww - this.WORKSPACE_PADDING * 2) / this.canvasWidth,
      (wh - this.WORKSPACE_PADDING * 2) / this.canvasHeight,
      1
    );
    const vpCenter = new fabric.Point(ww / 2, wh / 2);
    const pageCenter = new fabric.Point(this.canvasWidth / 2, this.canvasHeight / 2);

    this.canvas.setZoom(zoom);
    this.canvas.setViewportTransform([
      zoom, 0, 0, zoom,
      vpCenter.x - pageCenter.x * zoom,
      vpCenter.y - pageCenter.y * zoom,
    ]);
    this.canvas.requestRenderAll();
  }

  drawGrid(): void {
    this.clearGrid();

    const gridColor = 'rgba(255,255,255,0.06)';

    for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
      const line = new fabric.Line([x, 0, x, this.canvasHeight], {
        stroke: gridColor,
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        name: '__grid',
      });
      (line as fabric.FabricObject & { excludeFromExport: boolean }).excludeFromExport = true;
      this.canvas.add(line);
      this.canvas.sendObjectToBack(line);
      this.gridLines.push(line);
    }

    for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
      const line = new fabric.Line([0, y, this.canvasWidth, y], {
        stroke: gridColor,
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        name: '__grid',
      });
      (line as fabric.FabricObject & { excludeFromExport: boolean }).excludeFromExport = true;
      this.canvas.add(line);
      this.canvas.sendObjectToBack(line);
      this.gridLines.push(line);
    }

    // Keep page background at very bottom
    const bg = this.canvas.getObjects().find(o => (o as fabric.FabricObject & { name?: string }).name === '__page_background');
    if (bg) {
      this.canvas.sendObjectToBack(bg);
    }

    this.canvas.requestRenderAll();
  }

  private clearGrid(): void {
    for (const line of this.gridLines) {
      this.canvas.remove(line);
    }
    this.gridLines = [];
    this.canvas.requestRenderAll();
  }

  private setupEventHandlers(): void {
    this.canvas.on('selection:created', (e) => {
      this.ngZone.run(() => {
        this.selectionChanged.emit(this.getSelectedEditableObjects());
      });
    });

    this.canvas.on('selection:updated', (e) => {
      this.ngZone.run(() => {
        this.selectionChanged.emit(this.getSelectedEditableObjects());
      });
    });

    this.canvas.on('selection:cleared', () => {
      this.ngZone.run(() => {
        this.selectionChanged.emit([]);
      });
    });

    this.canvas.on('object:modified', () => {
      this.ngZone.run(() => {
        this.canvasModified.emit();
      });
    });

    this.canvas.on('object:added', (e) => {
      const obj = e.target as fabric.FabricObject & { name?: string };
      if (obj && obj.name !== '__grid' && obj.name !== '__page_background') {
        this.ngZone.run(() => {
          this.canvasModified.emit();
        });
      }
    });

    this.canvas.on('object:removed', (e) => {
      const obj = e.target as fabric.FabricObject & { name?: string };
      if (obj && obj.name !== '__grid' && obj.name !== '__page_background') {
        this.ngZone.run(() => {
          this.canvasModified.emit();
        });
      }
    });

    this.canvas.on('mouse:down', (opt) => this.onMouseDown(opt));
    this.canvas.on('mouse:move', (opt) => this.onMouseMove(opt));
    this.canvas.on('mouse:up', (opt) => this.onMouseUp(opt));

    // Snap to grid on object moving
    this.canvas.on('object:moving', (e) => {
      if (this.snapToGrid && e.target) {
        const obj = e.target;
        const left = Math.round((obj.left ?? 0) / this.gridSize) * this.gridSize;
        const top = Math.round((obj.top ?? 0) / this.gridSize) * this.gridSize;
        obj.set({ left, top });
      }
    });
  }

  private getSelectedEditableObjects(): fabric.FabricObject[] {
    const active = this.canvas.getActiveObjects();
    return active.filter(o => {
      const named = o as fabric.FabricObject & { name?: string };
      return named.name !== '__grid' && named.name !== '__page_background';
    });
  }

  private onToolChanged(): void {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.canvas.defaultCursor = 'default';
    this.canvas.hoverCursor = 'move';
    this.isDrawing = false;
    this.activeShape = null;

    const drawingTools = ['rectangle', 'circle', 'triangle', 'line', 'arrow', 'polygon'];
    const contentTools = ['text', 'heading', 'image', 'table'];

    if (this.currentTool === 'select') {
      this.canvas.defaultCursor = 'default';
      this.canvas.forEachObject(o => {
        const named = o as fabric.FabricObject & { name?: string };
        if (named.name !== '__grid' && named.name !== '__page_background') {
          o.selectable = true;
          o.evented = true;
        }
      });
    } else if (this.currentTool === 'pan') {
      this.canvas.defaultCursor = 'grab';
      this.canvas.selection = false;
      this.canvas.forEachObject(o => {
        o.selectable = false;
        o.evented = false;
      });
    } else if (this.currentTool === 'pen') {
      this.canvas.isDrawingMode = true;
      this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
      this.canvas.freeDrawingBrush.color = '#333333';
      this.canvas.freeDrawingBrush.width = 2;
    } else if (this.currentTool === 'eraser') {
      this.canvas.defaultCursor = 'crosshair';
      this.canvas.selection = false;
    } else if (drawingTools.includes(this.currentTool)) {
      this.canvas.defaultCursor = 'crosshair';
      this.canvas.selection = false;
    } else if (contentTools.includes(this.currentTool)) {
      this.canvas.defaultCursor = 'crosshair';
      this.canvas.selection = false;
    }
  }

  private onMouseDown(opt: fabric.TPointerEventInfo): void {
    const pointer = this.canvas.getScenePoint(opt.e);

    if (this.currentTool === 'pan') {
      this.isPanning = true;
      this.panStartX = (opt.e as MouseEvent).clientX;
      this.panStartY = (opt.e as MouseEvent).clientY;
      this.canvas.defaultCursor = 'grabbing';
      return;
    }

    if (this.currentTool === 'eraser') {
      const target = this.canvas.findTarget(opt.e);
      if (target) {
        const named = target as fabric.FabricObject & { name?: string };
        if (named.name !== '__grid' && named.name !== '__page_background') {
          this.canvas.remove(target);
          this.canvas.requestRenderAll();
        }
      }
      return;
    }

    if (this.currentTool === 'text') {
      this.addText(pointer.x, pointer.y, 'Click to edit', 16);
      return;
    }

    if (this.currentTool === 'heading') {
      this.addText(pointer.x, pointer.y, 'Heading', 28);
      return;
    }

    if (this.currentTool === 'image') {
      this.openImagePicker();
      return;
    }

    if (this.currentTool === 'table') {
      this.addTable(pointer.x, pointer.y, 3, 3);
      return;
    }

    const shapeTools = ['rectangle', 'circle', 'triangle', 'line', 'arrow', 'polygon'];
    if (shapeTools.includes(this.currentTool)) {
      this.isDrawing = true;
      this.drawStartX = pointer.x;
      this.drawStartY = pointer.y;

      switch (this.currentTool) {
        case 'rectangle':
          this.activeShape = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: 'rgba(124,106,240,0.15)',
            stroke: '#7c6af0',
            strokeWidth: 2,
            strokeUniform: true,
          });
          break;
        case 'circle':
          this.activeShape = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 0,
            ry: 0,
            fill: 'rgba(124,106,240,0.15)',
            stroke: '#7c6af0',
            strokeWidth: 2,
            strokeUniform: true,
          });
          break;
        case 'triangle':
          this.activeShape = new fabric.Triangle({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: 'rgba(124,106,240,0.15)',
            stroke: '#7c6af0',
            strokeWidth: 2,
            strokeUniform: true,
          });
          break;
        case 'line':
          this.activeShape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: '#333333',
            strokeWidth: 2,
            strokeUniform: true,
          });
          break;
        case 'arrow':
          this.activeShape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: '#333333',
            strokeWidth: 2,
            strokeUniform: true,
          });
          break;
        case 'polygon':
          this.activeShape = this.createStar(pointer.x, pointer.y, 5, 0, 0);
          break;
      }

      if (this.activeShape) {
        this.canvas.add(this.activeShape);
        this.canvas.requestRenderAll();
      }
    }
  }

  private onMouseMove(opt: fabric.TPointerEventInfo): void {
    if (this.isPanning && this.currentTool === 'pan') {
      const vpt = this.canvas.viewportTransform;
      if (vpt) {
        vpt[4] += (opt.e as MouseEvent).clientX - this.panStartX;
        vpt[5] += (opt.e as MouseEvent).clientY - this.panStartY;
        this.panStartX = (opt.e as MouseEvent).clientX;
        this.panStartY = (opt.e as MouseEvent).clientY;
        this.canvas.setViewportTransform(vpt);
        this.canvas.requestRenderAll();
      }
      return;
    }

    if (!this.isDrawing || !this.activeShape) return;

    const pointer = this.canvas.getScenePoint(opt.e);
    const dx = pointer.x - this.drawStartX;
    const dy = pointer.y - this.drawStartY;

    switch (this.currentTool) {
      case 'rectangle': {
        const rect = this.activeShape as fabric.Rect;
        const left = dx >= 0 ? this.drawStartX : pointer.x;
        const top = dy >= 0 ? this.drawStartY : pointer.y;
        rect.set({
          left,
          top,
          width: Math.abs(dx),
          height: Math.abs(dy),
        });
        break;
      }
      case 'circle': {
        const ellipse = this.activeShape as fabric.Ellipse;
        const left = dx >= 0 ? this.drawStartX : pointer.x;
        const top = dy >= 0 ? this.drawStartY : pointer.y;
        ellipse.set({
          left,
          top,
          rx: Math.abs(dx) / 2,
          ry: Math.abs(dy) / 2,
        });
        break;
      }
      case 'triangle': {
        const tri = this.activeShape as fabric.Triangle;
        const left = dx >= 0 ? this.drawStartX : pointer.x;
        const top = dy >= 0 ? this.drawStartY : pointer.y;
        tri.set({
          left,
          top,
          width: Math.abs(dx),
          height: Math.abs(dy),
        });
        break;
      }
      case 'line':
      case 'arrow': {
        const line = this.activeShape as fabric.Line;
        line.set({ x2: pointer.x, y2: pointer.y });
        break;
      }
      case 'polygon': {
        this.canvas.remove(this.activeShape);
        const radius = Math.sqrt(dx * dx + dy * dy);
        this.activeShape = this.createStar(
          this.drawStartX,
          this.drawStartY,
          5,
          radius,
          radius / 2
        );
        this.canvas.add(this.activeShape);
        break;
      }
    }

    this.canvas.requestRenderAll();
  }

  private onMouseUp(opt: fabric.TPointerEventInfo): void {
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.defaultCursor = 'grab';
      return;
    }

    if (!this.isDrawing || !this.activeShape) return;

    this.isDrawing = false;

    // If arrow tool, add arrowhead
    if (this.currentTool === 'arrow' && this.activeShape instanceof fabric.Line) {
      const line = this.activeShape as fabric.Line;
      const x1 = line.x1 ?? 0;
      const y1 = line.y1 ?? 0;
      const x2 = line.x2 ?? 0;
      const y2 = line.y2 ?? 0;

      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headLen = 15;

      const head = new fabric.Polygon(
        [
          { x: x2, y: y2 },
          {
            x: x2 - headLen * Math.cos(angle - Math.PI / 6),
            y: y2 - headLen * Math.sin(angle - Math.PI / 6),
          },
          {
            x: x2 - headLen * Math.cos(angle + Math.PI / 6),
            y: y2 - headLen * Math.sin(angle + Math.PI / 6),
          },
        ],
        {
          fill: '#333333',
          selectable: false,
          evented: false,
        }
      );

      this.canvas.remove(this.activeShape);
      const group = new fabric.Group([line, head], {
        selectable: true,
        evented: true,
      });
      this.canvas.add(group);
    }

    // Discard shapes that are too small (accidental clicks)
    if (this.activeShape) {
      const w = (this.activeShape as fabric.FabricObject & { width?: number }).width ?? 0;
      const h = (this.activeShape as fabric.FabricObject & { height?: number }).height ?? 0;
      if (this.currentTool !== 'line' && this.currentTool !== 'arrow' && w < 3 && h < 3) {
        this.canvas.remove(this.activeShape);
      }
    }

    this.activeShape = null;
    this.canvas.requestRenderAll();
  }

  private addText(x: number, y: number, text: string, fontSize: number): void {
    const textObj = new fabric.IText(text, {
      left: x,
      top: y,
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize,
      fill: '#1a1a2e',
      editable: true,
    });
    this.canvas.add(textObj);
    this.canvas.setActiveObject(textObj);
    textObj.enterEditing();
    this.canvas.requestRenderAll();
  }

  private openImagePicker(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        const imgEl = new Image();
        imgEl.onload = () => {
          const fabricImg = new fabric.FabricImage(imgEl, {
            left: 50,
            top: 50,
          });
          // Scale to fit within the page
          const maxW = this.canvasWidth * 0.8;
          const maxH = this.canvasHeight * 0.5;
          const scale = Math.min(maxW / imgEl.width, maxH / imgEl.height, 1);
          fabricImg.scale(scale);
          this.canvas.add(fabricImg);
          this.canvas.setActiveObject(fabricImg);
          this.canvas.requestRenderAll();
        };
        imgEl.src = dataUrl;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  addTable(x: number, y: number, rows: number, cols: number): void {
    const cellW = 100;
    const cellH = 32;
    const objects: fabric.FabricObject[] = [];

    for (let r = 0; r <= rows; r++) {
      const line = new fabric.Line(
        [0, r * cellH, cols * cellW, r * cellH],
        {
          stroke: '#cccccc',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        }
      );
      objects.push(line);
    }

    for (let c = 0; c <= cols; c++) {
      const line = new fabric.Line(
        [c * cellW, 0, c * cellW, rows * cellH],
        {
          stroke: '#cccccc',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        }
      );
      objects.push(line);
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellText = new fabric.IText(r === 0 ? `Header ${c + 1}` : `Cell ${r},${c + 1}`, {
          left: c * cellW + 8,
          top: r * cellH + 8,
          fontSize: r === 0 ? 12 : 11,
          fontFamily: 'Inter, Arial, sans-serif',
          fontWeight: r === 0 ? 'bold' : 'normal',
          fill: '#333333',
          selectable: false,
          evented: false,
        });
        objects.push(cellText);
      }
    }

    const tableGroup = new fabric.Group(objects, {
      left: x,
      top: y,
      selectable: true,
      evented: true,
      subTargetCheck: false,
    });

    this.canvas.add(tableGroup);
    this.canvas.setActiveObject(tableGroup);
    this.canvas.requestRenderAll();
  }

  private createStar(
    cx: number,
    cy: number,
    points: number,
    outerR: number,
    innerR: number
  ): fabric.Polygon {
    const starPoints: { x: number; y: number }[] = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      starPoints.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      });
    }
    return new fabric.Polygon(starPoints, {
      fill: 'rgba(124,106,240,0.15)',
      stroke: '#7c6af0',
      strokeWidth: 2,
      strokeUniform: true,
    });
  }

  // --- Public API called from parent ---

  deleteSelected(): void {
    const active = this.canvas.getActiveObjects();
    if (!active.length) return;
    active.forEach(obj => {
      const named = obj as fabric.FabricObject & { name?: string };
      if (named.name !== '__grid' && named.name !== '__page_background') {
        this.canvas.remove(obj);
      }
    });
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  copySelected(): void {
    const active = this.canvas.getActiveObjects();
    if (!active.length) return;
    this.clipboard = [];
    const promises = active.map(obj => obj.clone());
    Promise.all(promises).then(clones => {
      this.clipboard = clones;
    });
  }

  paste(): void {
    if (!this.clipboard.length) return;
    this.canvas.discardActiveObject();

    const pastePromises = this.clipboard.map(obj => obj.clone());
    Promise.all(pastePromises).then(clones => {
      clones.forEach(clone => {
        clone.set({
          left: (clone.left ?? 0) + 20,
          top: (clone.top ?? 0) + 20,
          evented: true,
          selectable: true,
        });
        this.canvas.add(clone);
      });

      if (clones.length === 1) {
        this.canvas.setActiveObject(clones[0]);
      } else {
        const sel = new fabric.ActiveSelection(clones, { canvas: this.canvas });
        this.canvas.setActiveObject(sel);
      }

      // Update clipboard offset for next paste
      this.clipboard = clones;
      this.canvas.requestRenderAll();
    });
  }

  duplicateSelected(): void {
    this.copySelected();
    setTimeout(() => this.paste(), 50);
  }

  selectAll(): void {
    const objs = this.canvas.getObjects().filter(o => {
      const named = o as fabric.FabricObject & { name?: string };
      return named.name !== '__grid' && named.name !== '__page_background';
    });
    if (!objs.length) return;
    const sel = new fabric.ActiveSelection(objs, { canvas: this.canvas });
    this.canvas.setActiveObject(sel);
    this.canvas.requestRenderAll();
  }

  groupSelected(): void {
    const active = this.canvas.getActiveObject();
    if (!active || !(active instanceof fabric.ActiveSelection)) return;

    const objects = (active as fabric.ActiveSelection).getObjects();
    const group = new fabric.Group(objects);
    objects.forEach(obj => this.canvas.remove(obj));
    this.canvas.discardActiveObject();
    this.canvas.add(group);
    this.canvas.setActiveObject(group);
    this.canvas.requestRenderAll();
    this.ngZone.run(() => {
      this.selectionChanged.emit([group]);
    });
  }

  ungroupSelected(): void {
    const active = this.canvas.getActiveObject();
    if (!active || !(active instanceof fabric.Group)) return;

    const items = (active as fabric.Group).getObjects();
    const groupLeft = active.left || 0;
    const groupTop = active.top || 0;
    items.forEach(obj => {
      obj.set({ left: (obj.left || 0) + groupLeft, top: (obj.top || 0) + groupTop });
      this.canvas.add(obj);
    });
    this.canvas.remove(active);
    this.canvas.requestRenderAll();
    this.ngZone.run(() => {
      this.selectionChanged.emit(this.getSelectedEditableObjects());
    });
  }

  alignObjects(alignment: string): void {
    const active = this.canvas.getActiveObject();
    if (!active) return;

    if (active instanceof fabric.ActiveSelection) {
      const objects = (active as fabric.ActiveSelection).getObjects();
      const bound = active.getBoundingRect();

      switch (alignment) {
        case 'left':
          objects.forEach(o => o.set({ left: bound.left }));
          break;
        case 'right':
          objects.forEach(o => o.set({ left: bound.left + bound.width - (o.width ?? 0) * (o.scaleX ?? 1) }));
          break;
        case 'top':
          objects.forEach(o => o.set({ top: bound.top }));
          break;
        case 'bottom':
          objects.forEach(o => o.set({ top: bound.top + bound.height - (o.height ?? 0) * (o.scaleY ?? 1) }));
          break;
        case 'centerH':
          objects.forEach(o => o.set({
            left: bound.left + (bound.width - (o.width ?? 0) * (o.scaleX ?? 1)) / 2,
          }));
          break;
        case 'centerV':
          objects.forEach(o => o.set({
            top: bound.top + (bound.height - (o.height ?? 0) * (o.scaleY ?? 1)) / 2,
          }));
          break;
      }

      this.canvas.requestRenderAll();
      this.canvasModified.emit();
    } else {
      // Single object - center on page
      switch (alignment) {
        case 'centerH':
          active.set({
            left: (this.canvasWidth - (active.width ?? 0) * (active.scaleX ?? 1)) / 2,
          });
          break;
        case 'centerV':
          active.set({
            top: (this.canvasHeight - (active.height ?? 0) * (active.scaleY ?? 1)) / 2,
          });
          break;
      }
      active.setCoords();
      this.canvas.requestRenderAll();
      this.canvasModified.emit();
    }
  }

  setZoom(zoom: number): void {
    const center = new fabric.Point(
      (this.canvas.width ?? 800) / 2,
      (this.canvas.height ?? 600) / 2
    );
    this.canvas.zoomToPoint(center, zoom);
    this.canvas.requestRenderAll();
  }

  zoomToFit(): void {
    this.centerCanvas();
  }

  getCanvasJSON(): string {
    return JSON.stringify(
      (this.canvas as any).toJSON(['name', 'selectable', 'evented'])
    );
  }

  loadCanvasJSON(json: string): void {
    this.canvas.loadFromJSON(json).then(() => {
      this.canvas.requestRenderAll();
    });
  }

  exportToPNG(): void {
    const objects = this.canvas.getObjects().filter(o => {
      const named = o as fabric.FabricObject & { name?: string };
      return named.name !== '__grid';
    });

    // Find the page background to determine export bounds
    const pageBg = objects.find(o => (o as fabric.FabricObject & { name?: string }).name === '__page_background');
    if (!pageBg) return;

    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      quality: 1,
      left: 0,
      top: 0,
      width: this.canvasWidth,
      height: this.canvasHeight,
      multiplier: 2,
    });

    const link = document.createElement('a');
    link.download = 'template.png';
    link.href = dataUrl;
    link.click();
  }

  exportToPDF(): void {
    // We export a high-quality PNG for PDF workaround
    // For full PDF: integrate jsPDF library
    this.exportToPNG();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.canvas || this.destroyed) return;
    const wrapper = this.wrapperRef.nativeElement;
    this.canvas.setDimensions({
      width: wrapper.clientWidth,
      height: wrapper.clientHeight,
    });
    this.canvas.requestRenderAll();
  }
}
