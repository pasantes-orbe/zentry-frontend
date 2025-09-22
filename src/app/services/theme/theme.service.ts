import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';
export type RoleKey = 'owner' | 'guard' | 'admin';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = (role: RoleKey) => `theme:${role}`;

  /** Carga el tema guardado para el rol y lo aplica */
  init(role: RoleKey) {
    const saved = (localStorage.getItem(this.key(role)) as Theme) || 'light';
    this.apply(saved);
  }

  /** Fija explícitamente el tema para el rol */
  set(role: RoleKey, theme: Theme) {
    localStorage.setItem(this.key(role), theme);
    this.apply(theme);
  }

  /** Toggle rápido para el rol - MEJORADO */
  toggle(role: RoleKey) {
    const currentTheme = (localStorage.getItem(this.key(role)) as Theme) || 'light';
    const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
    this.set(role, newTheme);
  }

  /** Estado actual */
  isDark() {
    return document.documentElement.classList.contains('dark-theme');
  }

  /** Aplica la clase en <html> */
  private apply(theme: Theme) {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
  }
}
