// services/properties/properties.service.ts
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

  // Subir avatar de propiedad (multipart) al endpoint dedicado
  public async uploadPropertyAvatar(id: number, file: File) {
    const token = await this._authStorageService.getJWT();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const form = new FormData();
    form.append('file', file);
    return this._http.post(`${environment.URL}/api/properties/${id}/avatar`, form, { headers });
  }

  // Editar propiedad enviando archivo de imagen (multipart)
// [INICIO CORRECCION] Modificado para recibir 'isActive' opcionalmente y retornar Observable
  public editPropertyMultipart(
    token: string,
    id: number,
    name: string,
    number: any,
    address: string,
    avatarFile: File,
    isActive?: boolean // Nuevo parámetro opcional para el estado
  ) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const formData = new FormData();
    formData.append('name', String(name ?? ''));
    formData.append('number', String(number ?? ''));
    formData.append('address', String(address ?? ''));
    if (avatarFile) {
      // Asegurar que el campo se llame 'avatar' como espera el backend
      formData.append('avatar', avatarFile); 
    }
    // Agregar isActive si se proporciona (para actualizar estado junto con los datos)
    if (typeof isActive === 'boolean') {
      formData.append('isActive', String(isActive));
    }
    return this._http.patch(`${environment.URL}/api/properties/${id}`, formData, { headers });
  }
// [FIN CORRECCION]

  // Trae propiedades por country incluyendo activas e inactivas (sin filtrar isActive)
  public async getByCountryAllStatuses(): Promise<Observable<any[]>> {
    const token = await this._authStorageService.getJWT();
    const country = await this._countryStorageService.getCountry();
    const countryID = country?.id;

    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };

    // Preferir endpoint con includeInactive para traer activas e inactivas
    const url1 = `${environment.URL}/api/properties/country/get_by_id/${countryID}?includeInactive=true`;
    const url2 = `${environment.URL}/api/properties?country_id=${countryID}`;
    const urlAll = `${environment.URL}/api/properties`;

    return this._http.get<any[]>(url1, httpOptions).pipe(
      catchError(() => this._http.get<any[]>(url2, httpOptions)),
      catchError(() => this._http.get<any[]>(urlAll, httpOptions)),
      map(list => {
        if (!Array.isArray(list)) return [];
        // Filtrar solo por id_country; NO filtrar por isActive
        return list.filter((p: any) => {
          const prop = p?.property ?? p;
          return Number(prop?.id_country) === Number(countryID);
        });
      })
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
        // Normaliza y filtra por id_country (soporta property plano o anidado) y solo activos
        return list.filter((p: any) => {
          const prop = p?.property ?? p;
          const inCountry = Number(prop?.id_country) === Number(countryID);
          const isActive = prop?.isActive === true; // si no viene el campo, no lo consideramos activo
          return inCountry && isActive;
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

// [INICIO CORRECCION] Modificado para recibir 'isActive' opcionalmente
  public editProperty(token: string, id: number, name: string, number: any, address: string, isActive?: boolean) {
    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
    const body: any = { name, number, address };
    // Agregar isActive si se proporciona
    if (typeof isActive === 'boolean') {
      body.isActive = isActive;
    }
    return this._http.patch(`${environment.URL}/api/properties/${id}`, body, httpOptions);
  }
// [FIN CORRECCION]

  public deleteProperty(id: number, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
    return this._http.delete(`${environment.URL}/api/properties/${id}`, httpOptions);
  }

  // Actualizar estado activo/inactivo de una propiedad (soft-delete / restaurar)
  public updatePropertyStatus(id: number, token: string, isActive: boolean) {
    const httpOptions = {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
    const urlStatus = `${environment.URL}/api/properties/${id}/status`;
    const urlPatch = `${environment.URL}/api/properties/${id}`;
    return this._http.patch(urlStatus, { isActive }, httpOptions).pipe(
      catchError((err) => {
        if (err?.status === 404) {
          console.warn('[properties] /status 404, intentando PATCH directo en /:id con isActive');
          return this._http.patch(urlPatch, { isActive }, httpOptions);
        }
        throw err;
      })
    );
  }
}