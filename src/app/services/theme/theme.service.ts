import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';
export type RoleKey = 'owner' | 'guard' | 'admin';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = (role: RoleKey) => `theme:${role}`;

  /** Carga tema persistido para el rol y lo aplica ANTES del render */
  init(role: RoleKey) {
    const saved = (localStorage.getItem(this.key(role)) as Theme) || 'light';
    this.apply(saved);
  }

  /** Setea tema explícito para el rol */
  set(role: RoleKey, theme: Theme) {
    localStorage.setItem(this.key(role), theme);
    this.apply(theme);
  }

  /** Toggle dark/light para el rol */
  toggle(role: RoleKey) {
    const current = (localStorage.getItem(this.key(role)) as Theme) || 'light';
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    this.set(role, next);
  }

  /** Estado actual (true si dark) */
  isDark(): boolean {
    return document.body.getAttribute('data-theme') === 'dark';
  }

  /** Getter del tema actual */
  current(): Theme {
    return this.isDark() ? 'dark' : 'light';
  }

  /** Aplica data-theme en <body> - SINCRÓNICO para init temprano */
  private apply(theme: Theme) {
    document.body.setAttribute('data-theme', theme);
  }
}