import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as fabric from 'fabric';

interface LayerItem {
  id: number;
  object: fabric.FabricObject;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  selected: boolean;
  editing: boolean;
}

interface ContextMenuItem {
  label: string;
  icon: string;
  action: string;
  separator?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-layers-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './layers-panel.component.html',
  styleUrl: './layers-panel.component.scss',
})
export class LayersPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() canvas: fabric.Canvas | null = null;

  @ViewChild('layerList') layerListRef!: ElementRef<HTMLDivElement>;

  layers: LayerItem[] = [];
  contextMenu: { visible: boolean; x: number; y: number; layerId: number | null } = {
    visible: false,
    x: 0,
    y: 0,
    layerId: null,
  };

  contextMenuItems: ContextMenuItem[] = [
    { label: 'Duplicate', icon: 'duplicate', action: 'duplicate' },
    { label: 'Delete', icon: 'delete', action: 'delete' },
    { label: '', icon: '', action: '', separator: true },
    { label: 'Lock', icon: 'lock', action: 'lock' },
    { label: '', icon: '', action: '', separator: true },
    { label: 'Bring to Front', icon: 'front', action: 'bringToFront' },
    { label: 'Send to Back', icon: 'back', action: 'sendToBack' },
  ];

  // Drag state
  private dragIndex: number | null = null;
  private dragOverIndex: number | null = null;
  private isDragging = false;
  private canvasEventsBound = false;

  get layerCount(): number {
    return this.layers.length;
  }

  get selectedCount(): number {
    return this.layers.filter((l) => l.selected).length;
  }

  ngOnInit(): void {
    this.bindCanvasEvents();
    this.refreshLayers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['canvas']) {
      this.bindCanvasEvents();
      this.refreshLayers();
    }
  }

  ngOnDestroy(): void {
    this.unbindCanvasEvents();
  }

  // ── Layer list management ──────────────────────────────────────────

  refreshLayers(): void {
    if (!this.canvas) {
      this.layers = [];
      return;
    }

    const objects = this.canvas.getObjects();
    const activeObjects = this.canvas.getActiveObjects();

    // Reverse order: top layer first
    this.layers = objects
      .filter((obj) => !(obj as any).__gridLine)
      .map((obj, index) => ({
        id: index,
        object: obj,
        name: (obj as any).name || this.getDefaultName(obj, index),
        type: obj.type ?? 'object',
        visible: obj.visible !== false,
        locked: !obj.selectable,
        selected: activeObjects.includes(obj),
        editing: false,
      }))
      .reverse();
  }

  private getDefaultName(obj: fabric.FabricObject, index: number): string {
    const type = obj.type ?? 'object';
    switch (type) {
      case 'rect':
        return `Rectangle ${index + 1}`;
      case 'circle':
        return `Circle ${index + 1}`;
      case 'ellipse':
        return `Ellipse ${index + 1}`;
      case 'triangle':
        return `Triangle ${index + 1}`;
      case 'line':
        return `Line ${index + 1}`;
      case 'polyline':
        return `Polyline ${index + 1}`;
      case 'polygon':
        return `Polygon ${index + 1}`;
      case 'path':
        return `Path ${index + 1}`;
      case 'text':
      case 'i-text':
      case 'textbox':
        const text = (obj as fabric.Textbox).text ?? '';
        return text.substring(0, 20) || `Text ${index + 1}`;
      case 'image':
        return `Image ${index + 1}`;
      case 'group':
        return `Group ${index + 1}`;
      default:
        return `Object ${index + 1}`;
    }
  }

  getLayerIcon(type: string): string {
    switch (type) {
      case 'rect':
        return `<svg width="14" height="14" viewBox="0 0 14 14"><rect x="1.5" y="2.5" width="11" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
      case 'circle':
      case 'ellipse':
        return `<svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
      case 'triangle':
        return `<svg width="14" height="14" viewBox="0 0 14 14"><polygon points="7,1.5 13,12.5 1,12.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
      case 'text':
      case 'i-text':
      case 'textbox':
        return `<svg width="14" height="14" viewBox="0 0 14 14"><text x="3" y="11" font-size="11" font-weight="bold" fill="currentColor">T</text></svg>`;
      case 'image':
        return `<svg width="14" height="14" viewBox="0 0 14 14"><rect x="1.5" y="2.5" width="11" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="4.5" cy="5.5" r="1" fill="currentColor"/><path d="M1.5 10l3-3 2 2 2.5-3 3.5 4" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
      case 'line':
        return `<svg width="14" height="14" viewBox="0 0 14 14"><line x1="2" y1="12" x2="12" y2="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
      case 'group':
        return `<svg width="14" height="14" viewBox="0 0 14 14"><rect x="1" y="1" width="6" height="6" fill="none" stroke="currentColor" stroke-width="1"/><rect x="7" y="7" width="6" height="6" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
      case 'path':
        return `<svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 10 Q7 2 12 10" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
      default:
        return `<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="2" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
    }
  }

  // ── Selection ──────────────────────────────────────────────────────

  selectLayer(layer: LayerItem, event: MouseEvent): void {
    if (!this.canvas || layer.editing) return;

    if (event.ctrlKey || event.metaKey) {
      // Multi-select toggle
      layer.selected = !layer.selected;
      this.syncSelectionToCanvas();
    } else {
      // Single select
      this.layers.forEach((l) => (l.selected = false));
      layer.selected = true;
      this.canvas.setActiveObject(layer.object);
      this.canvas.renderAll();
    }
  }

  private syncSelectionToCanvas(): void {
    if (!this.canvas) return;

    const selectedObjects = this.layers
      .filter((l) => l.selected)
      .map((l) => l.object);

    this.canvas.discardActiveObject();

    if (selectedObjects.length === 0) {
      this.canvas.renderAll();
      return;
    }

    if (selectedObjects.length === 1) {
      this.canvas.setActiveObject(selectedObjects[0]);
    } else {
      const sel = new fabric.ActiveSelection(selectedObjects, {
        canvas: this.canvas,
      });
      this.canvas.setActiveObject(sel);
    }

    this.canvas.renderAll();
  }

  // ── Layer Name Editing ─────────────────────────────────────────────

  startEditing(layer: LayerItem, event: MouseEvent): void {
    event.stopPropagation();
    this.layers.forEach((l) => (l.editing = false));
    layer.editing = true;
  }

  finishEditing(layer: LayerItem, newName: string): void {
    layer.editing = false;
    layer.name = newName.trim() || layer.name;
    (layer.object as any).name = layer.name;
  }

  onEditKeydown(event: KeyboardEvent, layer: LayerItem, inputEl: HTMLInputElement): void {
    if (event.key === 'Enter') {
      this.finishEditing(layer, inputEl.value);
    } else if (event.key === 'Escape') {
      layer.editing = false;
    }
  }

  // ── Visibility & Lock ──────────────────────────────────────────────

  toggleVisibility(layer: LayerItem, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.canvas) return;
    layer.visible = !layer.visible;
    layer.object.set('visible', layer.visible);
    this.canvas.renderAll();
  }

  toggleLock(layer: LayerItem, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.canvas) return;
    layer.locked = !layer.locked;
    layer.object.set('selectable', !layer.locked);
    layer.object.set('evented', !layer.locked);
    this.canvas.renderAll();
  }

  // ── Context Menu ───────────────────────────────────────────────────

  onContextMenu(event: MouseEvent, layer: LayerItem): void {
    event.preventDefault();
    event.stopPropagation();

    // Update lock label
    const lockItem = this.contextMenuItems.find((i) => i.action === 'lock');
    if (lockItem) {
      lockItem.label = layer.locked ? 'Unlock' : 'Lock';
    }

    this.contextMenu = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      layerId: layer.id,
    };
  }

  @HostListener('document:click')
  closeContextMenu(): void {
    this.contextMenu.visible = false;
  }

  onContextAction(action: string): void {
    if (!this.canvas) return;

    const layer = this.layers.find((l) => l.id === this.contextMenu.layerId);
    if (!layer) return;

    switch (action) {
      case 'duplicate':
        this.duplicateLayer(layer);
        break;
      case 'delete':
        this.deleteLayer(layer);
        break;
      case 'lock':
        layer.locked = !layer.locked;
        layer.object.set('selectable', !layer.locked);
        layer.object.set('evented', !layer.locked);
        this.canvas.renderAll();
        break;
      case 'bringToFront':
        this.canvas.bringObjectToFront(layer.object);
        this.canvas.renderAll();
        this.refreshLayers();
        break;
      case 'sendToBack':
        this.canvas.sendObjectToBack(layer.object);
        this.canvas.renderAll();
        this.refreshLayers();
        break;
    }

    this.contextMenu.visible = false;
  }

  // ── Layer Actions ──────────────────────────────────────────────────

  private duplicateLayer(layer: LayerItem): void {
    if (!this.canvas) return;
    const obj = layer.object;

    obj.clone().then((cloned: fabric.FabricObject) => {
      cloned.set({
        left: (cloned.left ?? 0) + 20,
        top: (cloned.top ?? 0) + 20,
      });
      (cloned as any).name = layer.name + ' copy';
      this.canvas!.add(cloned);
      this.canvas!.setActiveObject(cloned);
      this.canvas!.renderAll();
      this.refreshLayers();
    });
  }

  private deleteLayer(layer: LayerItem): void {
    if (!this.canvas) return;
    this.canvas.remove(layer.object);
    this.canvas.renderAll();
    this.refreshLayers();
  }

  deleteSelectedLayers(): void {
    if (!this.canvas) return;
    const selectedLayers = this.layers.filter((l) => l.selected);
    selectedLayers.forEach((layer) => {
      this.canvas!.remove(layer.object);
    });
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
    this.refreshLayers();
  }

  // ── Drag & Drop Reorder ────────────────────────────────────────────

  onDragStart(event: MouseEvent, index: number): void {
    event.preventDefault();
    this.isDragging = true;
    this.dragIndex = index;
    this.dragOverIndex = index;

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging || !this.layerListRef) return;

      const listEl = this.layerListRef.nativeElement;
      const rect = listEl.getBoundingClientRect();
      const y = e.clientY - rect.top + listEl.scrollTop;
      const rowHeight = 32;
      let overIndex = Math.floor(y / rowHeight);
      overIndex = Math.max(0, Math.min(overIndex, this.layers.length - 1));
      this.dragOverIndex = overIndex;
    };

    const onMouseUp = () => {
      if (this.isDragging && this.dragIndex !== null && this.dragOverIndex !== null && this.dragIndex !== this.dragOverIndex) {
        this.reorderLayer(this.dragIndex, this.dragOverIndex);
      }
      this.isDragging = false;
      this.dragIndex = null;
      this.dragOverIndex = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  private reorderLayer(fromIndex: number, toIndex: number): void {
    if (!this.canvas) return;

    // layers are in reverse z-order, so convert to canvas indices
    const totalObjects = this.layers.length;
    const fromCanvasIndex = totalObjects - 1 - fromIndex;
    const toCanvasIndex = totalObjects - 1 - toIndex;

    const objects = this.canvas.getObjects().filter((o) => !(o as any).__gridLine);
    const obj = objects[fromCanvasIndex];
    if (!obj) return;

    // Move the object to the new z-index
    this.canvas.remove(obj);
    const allObjects = this.canvas.getObjects();
    const gridLines = allObjects.filter((o) => (o as any).__gridLine);
    const nonGridObjects = allObjects.filter((o) => !(o as any).__gridLine);

    nonGridObjects.splice(toCanvasIndex, 0, obj);

    // Clear and re-add in order
    const allNonGrid = this.canvas.getObjects().filter((o) => !(o as any).__gridLine);
    allNonGrid.forEach((o) => this.canvas!.remove(o));
    nonGridObjects.forEach((o) => this.canvas!.add(o));

    this.canvas.renderAll();
    this.refreshLayers();
  }

  isDragOver(index: number): boolean {
    return this.isDragging && this.dragOverIndex === index && this.dragIndex !== index;
  }

  isDragSource(index: number): boolean {
    return this.isDragging && this.dragIndex === index;
  }

  // ── Canvas Event Binding ───────────────────────────────────────────

  private bindCanvasEvents(): void {
    if (!this.canvas || this.canvasEventsBound) return;

    this.canvas.on('object:added', () => this.refreshLayers());
    this.canvas.on('object:removed', () => this.refreshLayers());
    this.canvas.on('selection:created', () => this.syncSelectionFromCanvas());
    this.canvas.on('selection:updated', () => this.syncSelectionFromCanvas());
    this.canvas.on('selection:cleared', () => {
      this.layers.forEach((l) => (l.selected = false));
    });

    this.canvasEventsBound = true;
  }

  private unbindCanvasEvents(): void {
    if (!this.canvas) return;
    this.canvas.off('object:added');
    this.canvas.off('object:removed');
    this.canvas.off('selection:created');
    this.canvas.off('selection:updated');
    this.canvas.off('selection:cleared');
    this.canvasEventsBound = false;
  }

  private syncSelectionFromCanvas(): void {
    if (!this.canvas) return;
    const activeObjects = this.canvas.getActiveObjects();
    this.layers.forEach((layer) => {
      layer.selected = activeObjects.includes(layer.object);
    });
  }
}
