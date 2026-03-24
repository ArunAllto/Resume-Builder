import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ResumeService {
  constructor(private api: ApiService) {}

  saveResume(data: any): Observable<any> {
    return this.api.post('/resumes', data);
  }

  getResume(id: string): Observable<any> {
    return this.api.get(`/resumes/${id}`);
  }

  updateResume(id: string, data: any): Observable<any> {
    return this.api.put(`/resumes/${id}`, data);
  }
}
