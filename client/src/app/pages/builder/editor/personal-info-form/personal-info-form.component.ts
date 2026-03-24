import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalInfo } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-personal-info-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-info-form.component.html',
  styleUrls: ['./personal-info-form.component.scss'],
})
export class PersonalInfoFormComponent {
  @Input() data: PersonalInfo = {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    photo: '',
  };

  @Output() dataChange = new EventEmitter<PersonalInfo>();

  onFieldChange(): void {
    this.dataChange.emit({ ...this.data });
  }
}
