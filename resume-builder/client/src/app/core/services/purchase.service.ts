import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  constructor(private api: ApiService) {}

  checkPurchase(templateId: string): Observable<boolean> {
    return this.api.get<{ purchased: boolean }>(`/purchases/check?templateId=${templateId}`).pipe(
      map(res => res.purchased)
    );
  }
}
