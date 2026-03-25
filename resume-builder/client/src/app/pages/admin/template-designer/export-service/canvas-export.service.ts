import { Injectable } from '@angular/core';
import * as fabric from 'fabric';

@Injectable({ providedIn: 'root' })
export class CanvasExportService {
  /**
   * Serialize the entire canvas state to a JSON string.
   * This captures all objects, their properties, and canvas settings
   * for storage in a database.
   */
  saveAsJSON(canvas: fabric.Canvas): string {
    const json = (canvas as any).toJSON([
      'id',
      'name',
      'selectable',
      'evented',
      'lockMovementX',
      'lockMovementY',
      'lockRotation',
      'lockScalingX',
      'lockScalingY',
      'hasControls',
    ]);
    return JSON.stringify(json);
  }

  /**
   * Restore a canvas from a previously saved JSON string.
   * Clears the current canvas and loads all objects from the JSON.
   */
  loadFromJSON(canvas: fabric.Canvas, json: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const parsed = JSON.parse(json);
        canvas.loadFromJSON(parsed).then(() => {
          canvas.renderAll();
          resolve();
        }).catch((err: unknown) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Export the canvas as a PNG data URL.
   * @param canvas - The Fabric.js canvas instance
   * @param multiplier - Scale factor for higher resolution output (default: 2)
   * @returns A data URL string (data:image/png;base64,...)
   */
  exportAsPNG(canvas: fabric.Canvas, multiplier = 2): string {
    return canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier,
    });
  }

  /**
   * Export the canvas as an SVG string.
   * Produces a scalable vector graphics representation of the canvas.
   */
  exportAsSVG(canvas: fabric.Canvas): string {
    return canvas.toSVG();
  }

  /**
   * Export the canvas as a high-resolution PNG Blob suitable for download.
   * The caller can trigger a file download or send to a backend for
   * PDF conversion.
   * @param canvas - The Fabric.js canvas instance
   * @param multiplier - Scale factor (default: 3 for print quality)
   * @returns A Blob containing the PNG image data
   */
  exportAsPNGBlob(canvas: fabric.Canvas, multiplier = 3): Blob {
    const dataUrl = this.exportAsPNG(canvas, multiplier);
    return this.dataURLtoBlob(dataUrl);
  }

  /**
   * Generate a small thumbnail PNG for use in template lists.
   * Produces a lower-resolution image capped at the given max width.
   * @param canvas - The Fabric.js canvas instance
   * @param maxWidth - Maximum thumbnail width in pixels (default: 300)
   * @returns A data URL string of the thumbnail image
   */
  generateThumbnail(canvas: fabric.Canvas, maxWidth = 300): string {
    const canvasWidth = canvas.getWidth();
    const scale = Math.min(maxWidth / canvasWidth, 1);

    return canvas.toDataURL({
      format: 'png',
      quality: 0.8,
      multiplier: scale,
    });
  }

  /**
   * Trigger a file download in the browser.
   * @param dataUrl - The data URL or object URL to download
   * @param filename - The name for the downloaded file
   */
  downloadFile(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export the canvas as a PNG and trigger a browser download.
   */
  downloadAsPNG(canvas: fabric.Canvas, filename = 'canvas-export.png'): void {
    const dataUrl = this.exportAsPNG(canvas, 2);
    this.downloadFile(dataUrl, filename);
  }

  /**
   * Export the canvas as SVG and trigger a browser download.
   */
  downloadAsSVG(canvas: fabric.Canvas, filename = 'canvas-export.svg'): void {
    const svgString = this.exportAsSVG(canvas);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    this.downloadFile(url, filename);
    URL.revokeObjectURL(url);
  }

  /**
   * Convert a data URL string to a Blob.
   */
  private dataURLtoBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const byteString = atob(parts[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([uint8Array], { type: mime });
  }
}
