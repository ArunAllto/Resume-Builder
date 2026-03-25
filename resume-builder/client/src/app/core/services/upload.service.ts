import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ResumeData } from '../models/resume.model';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private api: ApiService) {}

  uploadResume(file: File): Observable<ResumeData> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.upload<ResumeData>('/upload', formData);
  }
}
