import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Title, Language } from '../../services/api.service';

@Component({
  selector: 'app-title-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="page">
      <!-- Header -->
      <div class="section-header">
        <h2>{{ language }}
          <span class="count-tag" *ngIf="!loading">{{ titles.length }}</span>
        </h2>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div> Loading…
      </div>

      <!-- Title List -->
      <div class="title-list" *ngIf="!loading">
        <div class="title-card" *ngFor="let t of titles" [id]="'title-card-' + t.id">
          <button
            class="delete-btn"
            (click)="deleteTitle(t.id)"
            [id]="'delete-btn-' + t.id"
            [attr.aria-label]="'Delete ' + t.name"
            title="Remove"
          >×</button>
          <p class="title-name">{{ t.name }}</p>
          <p class="title-year" *ngIf="t.year">{{ t.year }}</p>
          <dl *ngIf="t.director || t.actor || t.actress">
            <ng-container *ngIf="t.director"><dt>Dir.</dt><dd>{{ t.director }}</dd></ng-container>
            <ng-container *ngIf="t.actor"><dt>Actor</dt><dd>{{ t.actor }}</dd></ng-container>
            <ng-container *ngIf="t.actress"><dt>Actress</dt><dd>{{ t.actress }}</dd></ng-container>
          </dl>
        </div>

        <!-- Empty state -->
        <div class="empty-state" *ngIf="titles.length === 0">
          <span class="empty-icon">🎞️</span>
          <p>No {{ entryLabel }}s logged yet.<br>Tap <strong>+</strong> to add one.</p>
        </div>
      </div>

      <!-- FAB -->
      <button class="fab" (click)="openModal()" id="add-title-fab" [attr.aria-label]="'Add ' + entryLabel">+</button>

      <!-- Add Title Modal (bottom sheet) -->
      <div class="modal-overlay" *ngIf="showModal" (click)="onOverlayClick($event)" id="add-title-modal">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="title-modal-heading">
          <div class="modal-handle"></div>
          <h3 id="title-modal-heading">Add {{ entryLabel }}</h3>

          <div class="form-group">
            <label for="t-name">Title *</label>
            <input id="t-name" type="text" [(ngModel)]="form.name"
              [placeholder]="category === 'movie' ? 'e.g. Vikram, Interstellar…' : 'e.g. Breaking Bad…'"
              autocomplete="off" />
            <span class="form-error" *ngIf="formError">{{ formError }}</span>
          </div>

          <div class="form-group">
            <label for="t-language">Language *</label>
            <select id="t-language" [(ngModel)]="form.language">
              <option value="" disabled>Select language</option>
              <option *ngFor="let l of allLanguages" [value]="l.name">{{ l.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="t-year">Year</label>
            <input id="t-year" type="number" [(ngModel)]="form.year" placeholder="e.g. 2022" inputmode="numeric" />
          </div>

          <div class="form-group">
            <label for="t-director">Director</label>
            <input id="t-director" type="text" [(ngModel)]="form.director" placeholder="e.g. Lokesh Kanagaraj" autocomplete="off" />
          </div>

          <div class="form-group">
            <label for="t-actor">Actor</label>
            <input id="t-actor" type="text" [(ngModel)]="form.actor" placeholder="e.g. Kamal Haasan" autocomplete="off" />
          </div>

          <div class="form-group">
            <label for="t-actress">Actress</label>
            <input id="t-actress" type="text" [(ngModel)]="form.actress" placeholder="e.g. Trisha" autocomplete="off" />
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeModal()" id="title-modal-cancel">Cancel</button>
            <button class="btn-pill" (click)="submit()" id="title-modal-submit" [disabled]="submitting">
              {{ submitting ? 'Adding…' : 'Add' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  `,
})
export class TitleListComponent implements OnInit {
  category = '';
  language = '';
  entryLabel = '';
  titles: Title[] = [];
  allLanguages: Language[] = [];
  loading = true;
  showModal = false;
  submitting = false;
  formError = '';

  form = { name: '', language: '', year: '', director: '', actor: '', actress: '' };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.category = params['category'];
      this.language = decodeURIComponent(params['language']);
      if (this.category !== 'movie' && this.category !== 'series') {
        this.router.navigate(['/']);
        return;
      }
      this.entryLabel = this.category === 'movie' ? 'movie' : 'show';
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.api.getTitles(this.category, this.language).subscribe({
      next: (data) => { this.titles = data; this.loading = false; },
      error: () => (this.loading = false),
    });
    this.api.getLanguages(this.category).subscribe({
      next: (langs) => (this.allLanguages = langs),
    });
  }

  openModal(): void {
    this.form = { name: '', language: this.language, year: '', director: '', actor: '', actress: '' };
    this.formError = '';
    this.showModal = true;
    setTimeout(() => {
      (document.getElementById('t-name') as HTMLInputElement)?.focus();
    }, 80);
  }

  closeModal(): void { this.showModal = false; }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.closeModal();
  }

  submit(): void {
    if (!this.form.name.trim()) { this.formError = 'Title name is required.'; return; }
    if (!this.form.language) { this.formError = 'Please select a language.'; return; }
    this.submitting = true;
    this.formError = '';
    this.api.addTitle({
      category: this.category,
      language: this.form.language,
      name: this.form.name.trim(),
      year: this.form.year || undefined,
      director: this.form.director || undefined,
      actor: this.form.actor || undefined,
      actress: this.form.actress || undefined,
    }).subscribe({
      next: (title) => {
        if (this.form.language === this.language) {
          this.titles = [title, ...this.titles];
        }
        this.submitting = false;
        this.closeModal();
      },
      error: (err) => {
        this.formError = err?.error?.error || 'Failed to add. Please try again.';
        this.submitting = false;
      },
    });
  }

  deleteTitle(id: number): void {
    if (!confirm('Remove this title?')) return;
    this.api.deleteTitle(id).subscribe({
      next: () => { this.titles = this.titles.filter((t) => t.id !== id); },
      error: () => alert('Could not delete. Please try again.'),
    });
  }
}
