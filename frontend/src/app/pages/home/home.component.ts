import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Stat } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="page">
      <section class="hero">
        <h1>Your watch shelf,<br><em>beautifully kept.</em></h1>
        <p>Track every movie and show across languages.</p>
      </section>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div> Loading…
      </div>

      <div class="cat-grid" *ngIf="!loading">
        <!-- Movies -->
        <div class="cat-card movie" (click)="navigate('movie')" id="card-movies" role="button" tabindex="0">
          <span class="cat-emoji">🎬</span>
          <div class="cat-info">
            <p class="eyebrow">Feature films</p>
            <h2>Movies</h2>
            <p class="stat" *ngIf="movieStat">
              <strong>{{ movieStat.title_count }}</strong> titles ·
              <strong>{{ movieStat.language_count }}</strong> languages
            </p>
            <p class="stat" *ngIf="!movieStat">Start logging!</p>
          </div>
          <span class="cat-arrow">›</span>
        </div>

        <!-- Series -->
        <div class="cat-card series" (click)="navigate('series')" id="card-series" role="button" tabindex="0">
          <span class="cat-emoji">📺</span>
          <div class="cat-info">
            <p class="eyebrow">Episodic</p>
            <h2>Series</h2>
            <p class="stat" *ngIf="seriesStat">
              <strong>{{ seriesStat.title_count }}</strong> titles ·
              <strong>{{ seriesStat.language_count }}</strong> languages
            </p>
            <p class="stat" *ngIf="!seriesStat">Start logging!</p>
          </div>
          <span class="cat-arrow">›</span>
        </div>
      </div>
    </main>
  `,
})
export class HomeComponent implements OnInit {
  movieStat: Stat | null = null;
  seriesStat: Stat | null = null;
  loading = true;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.getStats().subscribe({
      next: (stats) => {
        this.movieStat = stats.find((s) => s.category === 'movie') ?? null;
        this.seriesStat = stats.find((s) => s.category === 'series') ?? null;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  navigate(category: string): void {
    this.router.navigate([`/${category}`]);
  }
}
