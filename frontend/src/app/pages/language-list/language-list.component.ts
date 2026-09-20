import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Language } from '../../services/api.service';

@Component({
  selector: 'app-language-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="page">
      <!-- Header -->
      <div class="section-header">
        <h2>{{ label }}
          <span class="count-tag" *ngIf="!loading">{{ languages.length }}</span>
        </h2>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div> Loading…
      </div>

      <!-- Language Grid -->
      <div class="lang-grid" *ngIf="!loading">
        <div
          class="lang-tile"
          *ngFor="let lang of languages"
          (click)="navigate(lang.name)"
          [id]="'lang-tile-' + lang.id"
          role="button"
          tabindex="0"
        >
          <span class="lang-name">{{ lang.name }}</span>
          <span class="lang-count">
            <strong>{{ lang.title_count }}</strong>
            {{ lang.title_count === 1 ? 'title' : 'titles' }}
          </span>
        </div>

        <!-- Empty state -->
        <div class="empty-state" style="grid-column: 1 / -1" *ngIf="languages.length === 0">
          <span class="empty-icon">🌐</span>
          <p>No languages yet.<br>Tap <strong>+</strong> to add one.</p>
        </div>
      </div>

      <!-- FAB -->
      <button class="fab" (click)="openModal()" id="add-language-fab" [attr.aria-label]="'Add ' + label + ' language'">+</button>

      <!-- Add Language Modal (bottom sheet) -->
      <div class="modal-overlay" *ngIf="showModal" (click)="onOverlayClick($event)" id="add-language-modal">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="lang-modal-title">
          <div class="modal-handle"></div>
          <h3 id="lang-modal-title">Add Language</h3>

          <div class="form-group">
            <label for="lang-input">Language name</label>
            <input
              id="lang-input"
              type="text"
              [(ngModel)]="newLangName"
              placeholder="e.g. Tamil, English, Malayalam…"
              (keydown.enter)="submit()"
              autocomplete="off"
            />
            <span class="form-error" *ngIf="formError">{{ formError }}</span>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeModal()" id="lang-modal-cancel">Cancel</button>
            <button class="btn-pill" (click)="submit()" id="lang-modal-submit" [disabled]="submitting">
              {{ submitting ? 'Adding…' : 'Add' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  `,
})
export class LanguageListComponent implements OnInit {
  category = '';
  label = '';
  languages: Language[] = [];
  loading = true;
  showModal = false;
  newLangName = '';
  formError = '';
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.category = params['category'];
      if (this.category !== 'movie' && this.category !== 'series') {
        this.router.navigate(['/']);
        return;
      }
      this.label = this.category === 'movie' ? 'Movies' : 'Series';
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.api.getLanguages(this.category).subscribe({
      next: (data) => {
        this.languages = data.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (nameA === 'tamil') return -1;
          if (nameB === 'tamil') return 1;
          if (nameA === 'english') return -1;
          if (nameB === 'english') return 1;
          return nameA.localeCompare(nameB);
        });
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  navigate(langName: string): void {
    this.router.navigate([`/${this.category}/${langName}`]);
  }

  openModal(): void {
    this.newLangName = '';
    this.formError = '';
    this.showModal = true;
    setTimeout(() => {
      (document.getElementById('lang-input') as HTMLInputElement)?.focus();
    }, 80);
  }

  closeModal(): void { this.showModal = false; }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.closeModal();
  }

  submit(): void {
    const name = this.newLangName.trim();
    if (!name) { this.formError = 'Name cannot be empty.'; return; }
    const isDupe = this.languages.some((l) => l.name.toLowerCase() === name.toLowerCase());
    if (isDupe) { this.formError = 'Already exists in this category.'; return; }
    this.submitting = true;
    this.formError = '';
    this.api.addLanguage(this.category, name).subscribe({
      next: (lang) => {
        this.languages = [...this.languages, lang];
        this.submitting = false;
        this.closeModal();
      },
      error: (err) => {
        this.formError = err?.error?.error || 'Failed. Please try again.';
        this.submitting = false;
      },
    });
  }
}
