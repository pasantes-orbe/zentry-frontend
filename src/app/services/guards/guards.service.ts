// src/app/services/guards/guards.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CountryStorageService } from '../storage/country-storage.service';
import { OwnerStorageService } from '../storage/owner-interface-storage.service';

@Injectable({ providedIn: 'root' })
export class GuardsService {
  private base = environment.URL;

  constructor(
    private http: HttpClient,
    private countryStorage: CountryStorageService,
    private ownerStorage: OwnerStorageService
  ) {}

  // ====== MÉTODOS HISTÓRICOS (compatibilidad) ======

  /** GET /api/users?role=vigilador */
  public getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/users?role=vigilador`);
  }

  /** GET /api/guards/schedule/all/:countryId */
  public getAllByCountryID(countryId: string | number | null): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/guards/schedule/all/${countryId}`);
  }

  /** Mantiene la firma original usada en guards-schedule.page.ts */
  public async getAllByCountryIdSinceOwner(): Promise<Observable<any[]>> {
    const owner = await this.ownerStorage.getOwner();
    const countryID = owner?.property?.id_country;
    return this.http.get<any[]>(`${this.base}/api/guards/schedule/all/${countryID}`);
  }

  /** GET /api/guards/get_country/:userId (compatibilidad con login.page.ts) */
  public getGuardByCountryId(userId: string | number) {
    return this.http.get(`${this.base}/api/guards/get_country/${userId}`);
  }

  // ====== NUEVOS MÉTODOS PARA AUTORIZACIONES ======

  /** Autorizaciones confirmadas por propietario para guardias
   *  GET /api/checkin/confirmed/:id_country
   */
  public getConfirmedAuthorizations(idCountry: string | number): Observable<any[]> {
    console.log(`[GuardsService] GET confirmed authorizations for country: ${idCountry}`);
    return this.http.get<any[]>(`${this.base}/api/checkin/confirmed/${idCountry}`);
  }

  /** Recurrentes por country
   *  GET /api/recurrents/get-by-country/:id_country
   */
  public getRecurrentsByCountry(idCountry: string | number): Observable<any[]> {
    console.log(`[GuardsService] GET recurrents for country: ${idCountry}`);
    return this.http.get<any[]>(`${this.base}/api/recurrents/get-by-country/${idCountry}`);
  }

  /** Combo (opcional) */
  public getGuardAuthorizationFeed(idCountry: string | number): Observable<{ confirmed: any[]; recurrents: any[] }> {
    return forkJoin({
      confirmed: this.getConfirmedAuthorizations(idCountry),
      recurrents: this.getRecurrentsByCountry(idCountry),
    }).pipe(map(res => res));
  }
}
