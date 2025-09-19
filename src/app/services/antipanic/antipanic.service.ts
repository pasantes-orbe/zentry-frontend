import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AntipanicCreateDto {
  id_owner: string | number;
  address: string;
  id_country: string | number;
  propertyNumber: string | number;
  latitude: number;   // <- ahora sí en el payload
  longitude: number;  // <- ahora sí en el payload
}

@Injectable({ providedIn: 'root' })
export class AntipanicService {
  private readonly base = `${environment.URL}/api/antipanic`;
  private readonly jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  // Enviar JSON, no FormData
  activateAntipanic(payload: AntipanicCreateDto): Observable<any> {
    // Opcional: log de control
    console.log('Activando antipánico (JSON):', payload);
    return this.http.post<any>(this.base, payload, { headers: this.jsonHeaders });
  }

  // PATCH sin body (o agregá lo que el backend espere)
  desactivateAntipanic(id: string | number): Observable<any> {
    console.log('Desactivando antipánico:', id);
    return this.http.patch<any>(`${this.base}/${id}`, {}, { headers: this.jsonHeaders });
  }

  getAllAntipanicByCountry(id_country: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/${id_country}`);
  }

  getAntipanicStatus(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.base}/status/${id}`);
  }

  getActiveAlertsByOwner(ownerId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/owner/${ownerId}/active`);
  }
}