import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// ====== DTOs (request) ======
export interface AntipanicCreateDto {
  id_owner: string | number;
  address: string;
  id_country: string | number;
  propertyNumber: string | number;
  latitude: number;
  longitude: number;
}

// ====== Modelos (response) ======
export interface Antipanic {
  id: number | string;
  id_owner: number | string;
  id_country: number | string;
  address?: string;
  propertyNumber?: string | number;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'finished' | 'cancelled';
  details?: string;
  // agregá campos extras si tu API los devuelve
}

export interface AntipanicStatus {
  id: number | string;
  status: 'none' | 'active' | 'finished' | 'cancelled';
  startedAt?: string;
  finishedAt?: string;
  antipanic?: Antipanic;
}

@Injectable({ providedIn: 'root' })
export class AntipanicService {
  private readonly base = `${environment.URL}/api/antipanic`;
  private readonly jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  /**
   * Crear/activar un evento de antipánico (JSON)
   * POST /api/antipanic
   */
  activateAntipanic(payload: AntipanicCreateDto): Observable<Antipanic | any> {
    // Log de control (opcional)
    console.log('[AntipanicService] POST activate', payload);
    return this.http.post<Antipanic | any>(this.base, payload, {
      headers: this.jsonHeaders,
      // withCredentials: true, // si tu backend usa cookies/sesión
    });
  }

  /**
   * Desactivar/Finalizar un evento por ID
   * PATCH /api/antipanic/:id
   * (En tu backend puede ser "cancel" / "finish"; acá usamos PATCH vacío)
   */
  desactivateAntipanic(id: string | number): Observable<Antipanic | any> {
    console.log('[AntipanicService] PATCH desactivate', id);
    return this.http.patch<Antipanic | any>(`${this.base}/${id}`, {}, {
      headers: this.jsonHeaders,
    });
  }

  /**
   * Alias más “inglés correcto” por si después querés migrar el nombre
   */
  deactivateAntipanic(id: string | number): Observable<Antipanic | any> {
    return this.desactivateAntipanic(id);
  }

  /**
   * (Opcional) Endpoint explícito para “finish” si tu API lo tiene
   * PATCH /api/antipanic/:id/finish
   */
  finishAntipanic(id: string | number, body: Record<string, any> = {}): Observable<Antipanic | any> {
    console.log('[AntipanicService] PATCH finish', id);
    return this.http.patch<Antipanic | any>(`${this.base}/${id}/finish`, body, {
      headers: this.jsonHeaders,
    });
  }

  /**
   * Obtener todos los antipánicos de un country
   * GET /api/antipanic/:id_country
   */
  getAllAntipanicByCountry(id_country: string | number, params?: Record<string, any>): Observable<Antipanic[]> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v != null) httpParams = httpParams.set(k, String(v)); });
    return this.http.get<Antipanic[]>(`${this.base}/${id_country}`, { params: httpParams });
  }

  /**
   * Estado por ID de antipánico
   * GET /api/antipanic/status/:id
   */
  getAntipanicStatus(id: string | number): Observable<AntipanicStatus> {
    return this.http.get<AntipanicStatus>(`${this.base}/status/${id}`);
  }

  /**
   * Activos por Owner
   * GET /api/antipanic/owner/:ownerId/active
   */
  getActiveAlertsByOwner(ownerId: string | number): Observable<Antipanic[]> {
    return this.http.get<Antipanic[]>(`${this.base}/owner/${ownerId}/active`);
  }

  /**
   * (Opcional) Traer uno por ID
   * GET /api/antipanic/item/:id
   * (Usá la ruta que tenga tu backend; la dejo separada de /status/)
   */
  getById(id: string | number): Observable<Antipanic> {
    return this.http.get<Antipanic>(`${this.base}/item/${id}`);
  }
}
