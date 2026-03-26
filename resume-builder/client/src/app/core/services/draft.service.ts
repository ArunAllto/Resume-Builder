import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DraftItem } from '../models/draft.model';

@Injectable({ providedIn: 'root' })
export class DraftService {
  constructor(private api: ApiService) {}

  getMyDrafts(): Observable<DraftItem[]> {
    return this.api.get<DraftItem[]>('/resumes/my-drafts');
  }

  deleteDraft(id: string): Observable<any> {
    return this.api.delete(`/resumes/${id}`);
  }
}
