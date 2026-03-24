import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get baseUrl(): string {
    return this.apiUrl;
  }

  /** Raw GET — returns the full response without unwrapping */
  getRaw<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${path}`, { params });
  }

  /** GET — unwraps { success, data } envelope */
  get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.apiUrl}${path}`, { params })
      .pipe(map((res) => res.data));
  }

  /** POST — unwraps { success, data } envelope */
  post<T>(path: string, body: object = {}): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.apiUrl}${path}`, body)
      .pipe(map((res) => res.data));
  }

  /** PUT — unwraps { success, data } envelope */
  put<T>(path: string, body: object = {}): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.apiUrl}${path}`, body)
      .pipe(map((res) => res.data));
  }

  /** DELETE — unwraps { success, data } envelope */
  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.apiUrl}${path}`)
      .pipe(map((res) => res.data));
  }

  /** Upload file — unwraps { success, data } envelope */
  upload<T>(path: string, formData: FormData): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.apiUrl}${path}`, formData)
      .pipe(map((res) => res.data));
  }
}
