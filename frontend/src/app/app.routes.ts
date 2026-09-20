import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: ':category',
    loadComponent: () =>
      import('./pages/language-list/language-list.component').then(
        (m) => m.LanguageListComponent
      ),
  },
  {
    path: ':category/:language',
    loadComponent: () =>
      import('./pages/title-list/title-list.component').then(
        (m) => m.TitleListComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
