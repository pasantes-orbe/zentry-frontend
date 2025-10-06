import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { AuthStorageService } from '../storage/auth-storage.service';
import { CountryStorageService } from '../storage/country-storage.service';
import { PropertyInterface } from '../../interfaces/property-interface';
import { Observable, lastValueFrom, catchError, map, of } from 'rxjs';
import { Property_OwnerInterface } from '../../interfaces/property_owner-interface';

@Injectable({ providedIn: 'root' })
export class PropertiesService {

  constructor(
    private _http: HttpClient,
    private _alertService: AlertService,
    private _router: Router,
    private _authStorageService: AuthStorageService,
    private _countryStorageService: CountryStorageService
  ) {}

  // Crea propiedad (el caller maneja spinner/navegación/alerts)
  public async addProperty(formData: FormData): Promise<any> {
    const token = await this._authStorageService.getJWT();
    const country = await this._countryStorageService.getCountry();
    const countryID = country.id;
    formData.append('id_country', countryID.toString());

    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };

    return await lastValueFrom(
      this._http.post(`${environment.URL}/api/properties`, formData, httpOptions)
    );
  }

  public async getAll(): Promise<Observable<PropertyInterface[]>> {
    const token = await this._authStorageService.getJWT();
    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
    return this._http.get<PropertyInterface[]>(`${environment.URL}/api/properties`, httpOptions);
  }

  public async getBySearchTerm(searchTerm: string): Promise<Observable<PropertyInterface[]>> {
    const token = await this._authStorageService.getJWT();
    const country = await this._countryStorageService.getCountry();
    const countryID = country.id;

    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
    return this._http.get<PropertyInterface[]>(
      `${environment.URL}/api/properties/${countryID}/${searchTerm}`, httpOptions
    );
  }

  // Propiedades del owner logueado
  public async getOwnerProperties(): Promise<Observable<PropertyInterface[]>> {
    const token = await this._authStorageService.getJWT();
    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
    return this._http.get<PropertyInterface[]>(
      `${environment.URL}/api/properties/owner-properties`, httpOptions
    );
  }

  // Original: relaciones propiedad-owner por country (puede venir vacío si no hay asignaciones)
  public async getAllProperty_OwnerByCountryID(): Promise<Observable<Property_OwnerInterface[]>> {
    const token = await this._authStorageService.getJWT();
    const country = await this._countryStorageService.getCountry();
    const countryID = country.id;

    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
    return this._http.get<Property_OwnerInterface[]>(
      `${environment.URL}/api/properties/country/get_by_id/${countryID}`, httpOptions
    );
  }

  // NUEVO: propiedades por country con fallback a otras rutas y filtro local
  public async getByCountry(): Promise<Observable<any[]>> {
    const token = await this._authStorageService.getJWT();
    const country = await this._countryStorageService.getCountry();
    const countryID = country?.id;

    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };

    const url1 = `${environment.URL}/api/properties/country/get_by_id/${countryID}`;
    const url2 = `${environment.URL}/api/properties?country_id=${countryID}`;
    const urlAll = `${environment.URL}/api/properties`;

    return this._http.get<any[]>(url1, httpOptions).pipe(
      catchError(() => this._http.get<any[]>(url2, httpOptions)),
      catchError(() => this._http.get<any[]>(urlAll, httpOptions)),
      map(list => {
        if (!Array.isArray(list)) return [];
        // Normaliza y filtra por id_country (soporta property plano o anidado)
        return list.filter((p: any) => {
          const prop = p?.property ?? p;
          return Number(prop?.id_country) === Number(countryID);
        });
      })
    );
  }

  public async getOneProperty(id: number) {
    const token = await this._authStorageService.getJWT();
    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
    return this._http.get(`${environment.URL}/api/properties/${id}`, httpOptions);
  }

  public editProperty(token: string, id: number, name: string, number: any, address: string) {
    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
    return this._http.patch(`${environment.URL}/api/properties/${id}`, { name, number, address }, httpOptions);
  }

  public deleteProperty(id: number, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
    return this._http.delete(`${environment.URL}/api/properties/${id}`, httpOptions);
  }
}
