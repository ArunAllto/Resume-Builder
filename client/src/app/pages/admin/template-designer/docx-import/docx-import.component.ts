import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as fabric from 'fabric';
import mammoth from 'mammoth';

interface ParsedElement {
  type: 'heading' | 'paragraph' | 'list-item' | 'table' | 'image';
  tag: string;
  text: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  rows?: string[][];
  imageSrc?: string;
}

@Component({
  selector: 'app-docx-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './docx-import.component.html',
  styleUrls: ['./docx-import.component.scss'],
})
export class DocxImportComponent {
  @Input() canvas: fabric.Canvas | null = null;
  @Output() importComplete = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  rawText = '';
  htmlContent = '';
  parsedElements: ParsedElement[] = [];
  isLoading = false;
  isDragOver = false;
  isParsed = false;
  errorMessage = '';

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  openFilePicker(): void {
    this.fileInput.nativeElement.click();
  }

  private handleFile(file: File): void {
    if (
      !file.name.endsWith('.docx') &&
      file.type !==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      this.errorMessage = 'Please select a valid .docx file.';
      return;
    }

    this.errorMessage = '';
    this.selectedFile = file;
    this.parseDocx(file);
  }

  private async parseDocx(file: File): Promise<void> {
    this.isLoading = true;
    this.isParsed = false;
    this.errorMessage = '';

    try {
      const arrayBuffer = await file.arrayBuffer();

      const [textResult, htmlResult] = await Promise.all([
        mammoth.extractRawText({ arrayBuffer }),
        mammoth.convertToHtml({ arrayBuffer }),
      ]);

      this.rawText = textResult.value;
      this.htmlContent = htmlResult.value;
      this.parsedElements = this.parseHtmlToElements(this.htmlContent);
      this.isParsed = true;
    } catch (err) {
      this.errorMessage =
        'Failed to parse the document. Please ensure it is a valid .docx file.';
      console.error('DOCX parse error:', err);
    } finally {
      this.isLoading = false;
    }
  }

  private parseHtmlToElements(html: string): ParsedElement[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements: ParsedElement[] = [];

    const walk = (node: Element): void => {
      const tag = node.tagName.toLowerCase();

      switch (tag) {
        case 'h1':
          elements.push({
            type: 'heading',
            tag: 'h1',
            text: node.textContent?.trim() || '',
            fontSize: 28,
            fontWeight: 'bold',
            fontStyle: 'normal',
          });
          break;

        case 'h2':
          elements.push({
            type: 'heading',
            tag: 'h2',
            text: node.textContent?.trim() || '',
            fontSize: 22,
            fontWeight: 'bold',
            fontStyle: 'normal',
          });
          break;

        case 'h3':
          elements.push({
            type: 'heading',
            tag: 'h3',
            text: node.textContent?.trim() || '',
            fontSize: 18,
            fontWeight: 'bold',
            fontStyle: 'normal',
          });
          break;

        case 'p': {
          const text = node.textContent?.trim() || '';
          if (!text) break;

          let fontWeight = 'normal';
          let fontStyle = 'normal';

          if (node.querySelector('strong') || node.querySelector('b')) {
            fontWeight = 'bold';
          }
          if (node.querySelector('em') || node.querySelector('i')) {
            fontStyle = 'italic';
          }

          elements.push({
            type: 'paragraph',
            tag: 'p',
            text,
            fontSize: 12,
            fontWeight,
            fontStyle,
          });
          break;
        }

        case 'ul':
        case 'ol': {
          const listItems = node.querySelectorAll(':scope > li');
          listItems.forEach((li) => {
            const prefix = tag === 'ul' ? '\u2022 ' : '';
            elements.push({
              type: 'list-item',
              tag: 'li',
              text: prefix + (li.textContent?.trim() || ''),
              fontSize: 12,
              fontWeight: 'normal',
              fontStyle: 'normal',
            });
          });
          break;
        }

        case 'table': {
          const rows: string[][] = [];
          node.querySelectorAll('tr').forEach((tr) => {
            const cells: string[] = [];
            tr.querySelectorAll('td, th').forEach((cell) => {
              cells.push(cell.textContent?.trim() || '');
            });
            if (cells.length > 0) {
              rows.push(cells);
            }
          });
          if (rows.length > 0) {
            elements.push({
              type: 'table',
              tag: 'table',
              text: `Table (${rows.length} rows)`,
              fontSize: 12,
              fontWeight: 'normal',
              fontStyle: 'normal',
              rows,
            });
          }
          break;
        }

        case 'img': {
          const src = node.getAttribute('src') || '';
          if (src) {
            elements.push({
              type: 'image',
              tag: 'img',
              text: node.getAttribute('alt') || 'Image',
              fontSize: 12,
              fontWeight: 'normal',
              fontStyle: 'normal',
              imageSrc: src,
            });
          }
          break;
        }

        default: {
          for (let i = 0; i < node.children.length; i++) {
            walk(node.children[i]);
          }
          break;
        }
      }
    };

    const body = doc.body;
    for (let i = 0; i < body.children.length; i++) {
      walk(body.children[i]);
    }

    return elements;
  }

  async importToCanvas(): Promise<void> {
    if (!this.canvas || this.parsedElements.length === 0) return;

    this.isLoading = true;

    try {
      const canvasWidth = this.canvas.getWidth();
      const padding = 40;
      const elementWidth = canvasWidth - padding * 2;
      let currentY = padding;
      const spacing = 10;

      for (const el of this.parsedElements) {
        switch (el.type) {
          case 'heading':
          case 'paragraph':
          case 'list-item': {
            const textbox = new fabric.Textbox(el.text, {
              left: padding,
              top: currentY,
              width: elementWidth,
              fontSize: el.fontSize,
              fontWeight: el.fontWeight as string,
              fontStyle: el.fontStyle as 'normal' | 'italic',
              fontFamily: 'Arial',
              fill: '#333333',
              splitByGrapheme: false,
            });
            this.canvas.add(textbox);
            currentY += textbox.getBoundingRect().height + spacing;
            break;
          }

          case 'table': {
            if (!el.rows || el.rows.length === 0) break;

            const numCols = Math.max(...el.rows.map((r) => r.length));
            const cellWidth = elementWidth / numCols;
            const cellHeight = 30;
            const tableObjects: fabric.FabricObject[] = [];

            for (let rowIdx = 0; rowIdx < el.rows.length; rowIdx++) {
              for (let colIdx = 0; colIdx < numCols; colIdx++) {
                const cellX = colIdx * cellWidth;
                const cellY = rowIdx * cellHeight;
                const cellText =
                  el.rows[rowIdx]?.[colIdx] || '';

                const rect = new fabric.Rect({
                  left: cellX,
                  top: cellY,
                  width: cellWidth,
                  height: cellHeight,
                  fill: rowIdx === 0 ? '#f0f0f0' : '#ffffff',
                  stroke: '#cccccc',
                  strokeWidth: 1,
                });

                const text = new fabric.Textbox(cellText, {
                  left: cellX + 5,
                  top: cellY + 7,
                  width: cellWidth - 10,
                  fontSize: 10,
                  fontWeight: rowIdx === 0 ? 'bold' : 'normal',
                  fontFamily: 'Arial',
                  fill: '#333333',
                });

                tableObjects.push(rect, text);
              }
            }

            const group = new fabric.Group(tableObjects, {
              left: padding,
              top: currentY,
            });

            this.canvas.add(group);
            currentY +=
              el.rows.length * cellHeight + spacing;
            break;
          }

          case 'image': {
            if (!el.imageSrc) break;
            try {
              const img = await fabric.FabricImage.fromURL(el.imageSrc);
              const scale = Math.min(
                elementWidth / (img.width || 1),
                300 / (img.height || 1),
                1
              );
              img.set({
                left: padding,
                top: currentY,
                scaleX: scale,
                scaleY: scale,
              });
              this.canvas.add(img);
              currentY +=
                (img.height || 0) * scale + spacing;
            } catch {
              const placeholder = new fabric.Textbox(
                `[Image: ${el.text}]`,
                {
                  left: padding,
                  top: currentY,
                  width: elementWidth,
                  fontSize: 12,
                  fontStyle: 'italic',
                  fontFamily: 'Arial',
                  fill: '#999999',
                }
              );
              this.canvas.add(placeholder);
              currentY +=
                placeholder.getBoundingRect().height + spacing;
            }
            break;
          }
        }
      }

      this.canvas.renderAll();
      this.importComplete.emit();
    } catch (err) {
      this.errorMessage = 'Failed to import elements to canvas.';
      console.error('Canvas import error:', err);
    } finally {
      this.isLoading = false;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.rawText = '';
    this.htmlContent = '';
    this.parsedElements = [];
    this.isParsed = false;
    this.errorMessage = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
