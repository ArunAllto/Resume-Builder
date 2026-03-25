import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

interface AiResponse {
  enhanced: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiService {
  constructor(private api: ApiService) {}

  enhance(text: string, type: string): Observable<string> {
    return this.api.post<AiResponse>('/ai/enhance', { text, type }).pipe(
      map((res) => res.enhanced)
    );
  }
}
