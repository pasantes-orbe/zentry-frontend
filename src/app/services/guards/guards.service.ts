import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { GuardInterface } from '../../interfaces/guard-interface';
import { Observable } from 'rxjs';
import { CountryStorageService } from '../storage/country-storage.service';
import { OwnerStorageService } from '../storage/owner-interface-storage.service';

/** Interfaz base para las autorizaciones */
export interface AuthorizationInterface {
  id: number | string;
  guest_name?: string;
  DNI?: string;
  type?: string;
  authorization_type?: string;
  authorized_by?: string | Record<string, any>;
  owner?: { name?: string; family_name?: string; lot?: string | number };
  lot?: string | number;
  created_at?: string;
  date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GuardsService {

  constructor(
    private _http: HttpClient,
    private _alertService: AlertService,
    private _router: Router,
    private _countryStorageService: CountryStorageService,
    private _ownerStorage: OwnerStorageService
  ) {}

  /** Todos los guardias globales */
  public getAll(): Observable<GuardInterface[]> {
    return this._http.get<GuardInterface[]>(`${environment.URL}/api/users?role=vigilador`);
  }

  /** Guardias por country */
  public getAllByCountryID(countryId: string | null): Observable<any[]> {
    return this._http.get<GuardInterface[]>(`${environment.URL}/api/guards/schedule/all/${countryId}`);
  }

  /** Guardias del country según el propietario logueado */
  async getAllByCountryIdSinceOwner(): Promise<Observable<any[]>> {
    const owner = await this._ownerStorage.getOwner();
    const countryID = owner.property.id_country;
    return this._http.get<any[]>(`${environment.URL}/api/guards/schedule/all/${countryID}`);
  }

  /** Obtiene el country asignado a un guardia */
  public getGuardByCountryId(id: any) {
    const userID = id;
    return this._http.get(`${environment.URL}/api/guards/get_country/${userID}`);
  }

  // ============================================================
  // ✅ NUEVO — endpoint estable para la página de Autorizaciones de vista vigilador, trae los datos de vista propietario
  // ============================================================
  public getAuthorizationsByCountryId(countryId: string | number): Observable<AuthorizationInterface[]> {
    //return this._http.get<AuthorizationInterface[]>(`${environment.URL}/api/authorizations/pending/${countryId}`);
    return this._http.get<AuthorizationInterface[]>(`${environment.URL}/api/checkin/confirmed/${countryId}`);
  }
}
