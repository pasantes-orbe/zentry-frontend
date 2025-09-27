// src/app/pipes/filter-by.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy',
  standalone: true,
  pure: true, // solo recalcula cuando cambian items o searchText
})
export class FilterByPipe implements PipeTransform {
  transform(items: any[] | null | undefined, searchText: any): any[] {
    if (!items || items.length === 0) return [];
    const q = (searchText ?? '').toString().trim().toLowerCase();
    if (!q) return items;

    return items.filter(item => this.matches(item, q));
  }

  private matches(item: any, q: string): boolean {
    // Aplana de forma segura (profundidad baja) y compara
    const text = this.flattenToString(item, 2).toLowerCase();
    return text.includes(q);
  }

  /**
   * Convierte un objeto/array/primitivo a texto de búsqueda,
   * evitando JSON.stringify (ciclos) y limitando profundidad.
   */
  private flattenToString(value: any, depth: number): string {
    if (value == null) return '';
    if (depth <= 0) return '';

    const t = typeof value;

    // Primitivos
    if (t === 'string' || t === 'number' || t === 'boolean' || t === 'bigint') {
      return value.toString();
    }

    // Fecha
    if (value instanceof Date) return value.toISOString();

    // Array
    if (Array.isArray(value)) {
      try {
        return value.map(v => this.flattenToString(v, depth - 1)).join(' ');
      } catch {
        return '';
      }
    }

    // Objeto plano: toma valores de primer nivel
    if (t === 'object') {
      try {
        return Object.values(value)
          .map(v => this.flattenToString(v, depth - 1))
          .join(' ');
      } catch {
        return '';
      }
    }

    // Fallback
    try {
      return String(value);
    } catch {
      return '';
    }
  }
}
