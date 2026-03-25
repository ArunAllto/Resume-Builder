import { Component, EventEmitter, Input, Output } from '@angular/core';

interface ToolItem {
  name: string;
  label: string;
  icon: string;
  group: string;
}

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  @Input() currentTool = 'select';
  @Output() toolSelected = new EventEmitter<string>();

  toolGroups: { group: string; tools: ToolItem[] }[] = [
    {
      group: 'selection',
      tools: [
        {
          name: 'select',
          label: 'Select / Move (V)',
          group: 'selection',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>`,
        },
        {
          name: 'pan',
          label: 'Pan / Hand (H)',
          group: 'selection',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-4 0v1"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,
        },
      ],
    },
    {
      group: 'shapes',
      tools: [
        {
          name: 'rectangle',
          label: 'Rectangle (R)',
          group: 'shapes',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
        },
        {
          name: 'circle',
          label: 'Circle / Ellipse (O)',
          group: 'shapes',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
        },
        {
          name: 'triangle',
          label: 'Triangle',
          group: 'shapes',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 22h20L12 2z"/></svg>`,
        },
        {
          name: 'line',
          label: 'Line (L)',
          group: 'shapes',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="19" x2="19" y2="5"/></svg>`,
        },
        {
          name: 'arrow',
          label: 'Arrow',
          group: 'shapes',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
        },
        {
          name: 'polygon',
          label: 'Star / Polygon',
          group: 'shapes',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        },
      ],
    },
    {
      group: 'content',
      tools: [
        {
          name: 'text',
          label: 'Text (T)',
          group: 'content',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
        },
        {
          name: 'heading',
          label: 'Heading',
          group: 'content',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/></svg>`,
        },
        {
          name: 'image',
          label: 'Image Upload',
          group: 'content',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
        },
        {
          name: 'table',
          label: 'Table',
          group: 'content',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
        },
      ],
    },
    {
      group: 'drawing',
      tools: [
        {
          name: 'pen',
          label: 'Pen / Freehand (P)',
          group: 'drawing',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
        },
        {
          name: 'eraser',
          label: 'Eraser',
          group: 'drawing',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20H7L3 16l9-9 8 8-4 4"/><path d="M6.5 13.5L12 8"/><line x1="16" y1="20" x2="20" y2="20"/></svg>`,
        },
      ],
    },
  ];

  selectTool(toolName: string): void {
    this.toolSelected.emit(toolName);
  }
}
