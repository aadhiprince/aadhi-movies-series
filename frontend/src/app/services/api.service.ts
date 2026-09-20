import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Language {
  id: number;
  name: string;
  title_count: number;
}

export interface Title {
  id: number;
  name: string;
  year: string | null;
  director: string | null;
  actor: string | null;
  actress: string | null;
}

export interface Stat {
  category: 'movie' | 'series';
  title_count: number;
  language_count: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private get base(): string {
    if (typeof window !== 'undefined' && (window as any).API_URL) {
      return (window as any).API_URL + '/api';
    }
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:3000/api';
    }
    return 'https://aadhi-movies-series.onrender.com/api';
  }

  constructor(private http: HttpClient) { }

  getStats(): Observable<Stat[]> {
    return this.http.get<Stat[]>(`${this.base}/stats`);
  }

  getLanguages(category: string): Observable<Language[]> {
    return this.http.get<Language[]>(`${this.base}/languages?category=${category}`);
  }

  addLanguage(category: string, name: string): Observable<Language> {
    return this.http.post<Language>(`${this.base}/languages`, { category, name });
  }

  getTitles(category: string, language: string): Observable<Title[]> {
    return this.http.get<Title[]>(
      `${this.base}/titles?category=${category}&language=${encodeURIComponent(language)}`
    );
  }

  addTitle(payload: {
    category: string;
    language: string;
    name: string;
    year?: string;
    director?: string;
    actor?: string;
    actress?: string;
  }): Observable<Title> {
    return this.http.post<Title>(`${this.base}/titles`, payload);
  }

  deleteTitle(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.base}/titles/${id}`);
  }
}
