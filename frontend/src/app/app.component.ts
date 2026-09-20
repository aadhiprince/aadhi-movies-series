import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  isDark = true;
  activeTab: 'home' | 'movie' | 'series' = 'home';
  showBack = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Restore theme
    const saved = localStorage.getItem('aadhi-theme');
    this.isDark = saved ? saved === 'dark' : true;
    this.applyTheme();

    // Track active route for bottom nav and back button
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url: string = e.urlAfterRedirects || e.url;
        const parts = url.split('/').filter(Boolean);

        if (parts.length === 0) {
          this.activeTab = 'home';
          this.showBack = false;
        } else if (parts[0] === 'movie') {
          this.activeTab = 'movie';
          this.showBack = parts.length > 1;
        } else if (parts[0] === 'series') {
          this.activeTab = 'series';
          this.showBack = parts.length > 1;
        } else {
          this.showBack = false;
        }
      });

    // Run once for initial route
    const url = this.router.url;
    const parts = url.split('/').filter(Boolean);
    if (parts.length === 0) { this.activeTab = 'home'; this.showBack = false; }
    else if (parts[0] === 'movie') { this.activeTab = 'movie'; this.showBack = parts.length > 1; }
    else if (parts[0] === 'series') { this.activeTab = 'series'; this.showBack = parts.length > 1; }
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    localStorage.setItem('aadhi-theme', this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  navigate(path: string): void {
    this.router.navigateByUrl(path);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    const url = this.router.url;
    const parts = url.split('/').filter(Boolean);
    if (parts.length >= 2) {
      // Go up one level (e.g. /movie/Tamil → /movie)
      this.router.navigate(['/' + parts[0]]);
    } else {
      this.router.navigate(['/']);
    }
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
  }
}
