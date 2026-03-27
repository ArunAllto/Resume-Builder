import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatarUrl: string;
  isActive: boolean;
  sortOrder: number;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent implements OnInit {
  testimonials: Testimonial[] = [];
  isLoading = true;
  errorMessage = '';

  // Form state
  showForm = false;
  isEditing = false;
  isSubmitting = false;
  editingId: string | null = null;

  formName = '';
  formRole = '';
  formCompany = '';
  formContent = '';
  formRating = 5;
  formAvatarUrl = '';
  formIsActive = true;
  formSortOrder = 0;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadTestimonials();
  }

  loadTestimonials(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.get<Testimonial[]>('/testimonials/all').subscribe({
      next: (data) => {
        this.testimonials = (data || []).sort((a, b) => a.sortOrder - b.sortOrder);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load testimonials.';
        this.isLoading = false;
        this.toast.error('Failed to load testimonials');
      },
    });
  }

  showAddForm(): void {
    this.resetForm();
    this.showForm = true;
    this.isEditing = false;
    this.formSortOrder = this.testimonials.length + 1;
  }

  showEditForm(t: Testimonial): void {
    this.resetForm();
    this.showForm = true;
    this.isEditing = true;
    this.editingId = t.id;
    this.formName = t.name;
    this.formRole = t.role;
    this.formCompany = t.company;
    this.formContent = t.content;
    this.formRating = t.rating;
    this.formAvatarUrl = t.avatarUrl;
    this.formIsActive = t.isActive;
    this.formSortOrder = t.sortOrder;
  }

  cancelForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.formName = '';
    this.formRole = '';
    this.formCompany = '';
    this.formContent = '';
    this.formRating = 5;
    this.formAvatarUrl = '';
    this.formIsActive = true;
    this.formSortOrder = 0;
    this.editingId = null;
    this.isEditing = false;
  }

  setRating(star: number): void {
    this.formRating = star;
  }

  getStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  saveTestimonial(): void {
    if (!this.formName.trim() || !this.formContent.trim()) {
      this.toast.warning('Name and content are required');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      name: this.formName.trim(),
      role: this.formRole.trim(),
      company: this.formCompany.trim(),
      content: this.formContent.trim(),
      rating: this.formRating,
      avatarUrl: this.formAvatarUrl.trim(),
      isActive: this.formIsActive,
      sortOrder: this.formSortOrder,
    };

    if (this.isEditing && this.editingId) {
      this.api.put<Testimonial>(`/testimonials/${this.editingId}`, payload).subscribe({
        next: (updated) => {
          const idx = this.testimonials.findIndex((t) => t.id === this.editingId);
          if (idx !== -1) this.testimonials[idx] = updated;
          this.testimonials.sort((a, b) => a.sortOrder - b.sortOrder);
          this.isSubmitting = false;
          this.showForm = false;
          this.resetForm();
          this.toast.success('Testimonial updated');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toast.error('Failed to update: ' + (err.error?.error || 'Unknown error'));
        },
      });
    } else {
      this.api.post<Testimonial>('/testimonials', payload).subscribe({
        next: (created) => {
          this.testimonials.push(created);
          this.testimonials.sort((a, b) => a.sortOrder - b.sortOrder);
          this.isSubmitting = false;
          this.showForm = false;
          this.resetForm();
          this.toast.success('Testimonial created');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toast.error('Failed to create: ' + (err.error?.error || 'Unknown error'));
        },
      });
    }
  }

  toggleActive(t: Testimonial): void {
    this.api.put<Testimonial>(`/testimonials/${t.id}`, { isActive: !t.isActive }).subscribe({
      next: () => {
        const idx = this.testimonials.findIndex((x) => x.id === t.id);
        if (idx !== -1) this.testimonials[idx] = { ...this.testimonials[idx], isActive: !t.isActive };
        this.toast.info(t.isActive ? 'Testimonial deactivated' : 'Testimonial activated');
      },
      error: () => this.toast.error('Failed to toggle status'),
    });
  }

  moveUp(index: number): void {
    if (index <= 0) return;
    this.swapOrder(index, index - 1);
  }

  moveDown(index: number): void {
    if (index >= this.testimonials.length - 1) return;
    this.swapOrder(index, index + 1);
  }

  private swapOrder(fromIdx: number, toIdx: number): void {
    const a = this.testimonials[fromIdx];
    const b = this.testimonials[toIdx];
    const tempOrder = a.sortOrder;
    a.sortOrder = b.sortOrder;
    b.sortOrder = tempOrder;

    this.testimonials[fromIdx] = b;
    this.testimonials[toIdx] = a;

    // Persist both
    this.api.put(`/testimonials/${a.id}`, { sortOrder: a.sortOrder }).subscribe();
    this.api.put(`/testimonials/${b.id}`, { sortOrder: b.sortOrder }).subscribe();
  }

  deleteTestimonial(t: Testimonial): void {
    if (!window.confirm(`Delete testimonial from "${t.name}"? This cannot be undone.`)) return;

    this.api.delete(`/testimonials/${t.id}`).subscribe({
      next: () => {
        this.testimonials = this.testimonials.filter((x) => x.id !== t.id);
        this.toast.success('Testimonial deleted');
      },
      error: () => this.toast.error('Failed to delete testimonial'),
    });
  }
}
