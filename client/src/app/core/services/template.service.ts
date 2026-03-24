import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Template } from '../models/template.model';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  constructor(private api: ApiService) {}

  getTemplates(all: boolean = false): Observable<Template[]> {
    const params = all ? new HttpParams().set('all', 'true') : undefined;
    return this.api.get<Template[]>('/templates', params);
  }

  getTemplate(id: string): Observable<Template> {
    return this.api.get<Template>(`/templates/${id}`);
  }

  createTemplate(data: Partial<Template>): Observable<Template> {
    return this.api.post<Template>('/templates', data);
  }

  updateTemplate(id: string, data: Partial<Template>): Observable<Template> {
    return this.api.put<Template>(`/templates/${id}`, data);
  }

  deleteTemplate(id: string): Observable<void> {
    return this.api.delete<void>(`/templates/${id}`);
  }
}
