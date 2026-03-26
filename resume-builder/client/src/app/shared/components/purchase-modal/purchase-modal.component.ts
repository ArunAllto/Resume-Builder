import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseService } from '../../../core/services/purchase.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-purchase-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-modal.component.html',
  styleUrls: ['./purchase-modal.component.scss']
})
export class PurchaseModalComponent {
  @Input() visible = false;
  @Input() template: any = null;
  @Output() purchased = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  loading = false;

  constructor(private purchaseService: PurchaseService, private toast: ToastService) {}

  get discount(): number {
    if (!this.template?.originalPrice || !this.template?.offerPrice) return 0;
    return Math.round((1 - this.template.offerPrice / this.template.originalPrice) * 100);
  }

  close(): void { this.closed.emit(); }

  onPurchase(): void {
    if (!this.template) return;
    this.loading = true;
    this.purchaseService.purchaseTemplate(this.template.id).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Template purchased successfully!');
        this.purchased.emit();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.error || 'Purchase failed');
      }
    });
  }
}
