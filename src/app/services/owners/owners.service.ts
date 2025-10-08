// src/app/services/owners/owners.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Observable, from, switchMap, catchError, of, lastValueFrom } from 'rxjs';

import { AlertService } from '../helpers/alert.service';
import { CountryStorageService } from '../storage/country-storage.service';
import { AuthStorageService } from '../storage/auth-storage.service';

import { OwnerResponse } from '../../interfaces/ownerResponse-interface';
import { OwnerInterface } from '../../interfaces/owner-interface';
import { Owner_CountryInterface } from 'src/app/interfaces/owner_country-interface';

@Injectable({ providedIn: 'root' })
export class OwnersService {
  constructor(
    private _http: HttpClient,
    private _alert: AlertService,
    private _router: Router,
    private _countryStorage: CountryStorageService,
    private _auth: AuthStorageService,
  ) {}

  /** Todos los propietarios (sin filtro) */
  public getAll(): Observable<OwnerResponse[]> {
    return this._http.get<OwnerResponse[]>(`${environment.URL}/api/owners`);
  }

  /**
   * Propietarios por country actual (intenta dos endpoints conocidos).
   * 1) /api/owners/country/get_by_id/:id
   * 2) /api/users/owners/get_by_country/:id
   */
  public getAllByCountry(): Observable<Owner_CountryInterface[]> {
    return from(this._countryStorage.getCountry()).pipe(
      switchMap(country => {
        const id = country?.id;
        if (!id) return of<Owner_CountryInterface[]>([]);
        const url1 = `${environment.URL}/api/owners/country/get_by_id/${id}`;
        const url2 = `${environment.URL}/api/users/owners/get_by_country/${id}`;
        return this._http.get<Owner_CountryInterface[]>(url1).pipe(
          catchError(() => this._http.get<Owner_CountryInterface[]>(url2))
        );
      })
    );
  }

  /** Alternativa por id (mismo patrón que arriba, tipado OwnerResponse[]) */
  public getAllByCountryID(): Observable<OwnerResponse[]> {
    return from(this._countryStorage.getCountry()).pipe(
      switchMap(country => {
        const id = country?.id;
        if (!id) return of<OwnerResponse[]>([]);
        return this._http.get<OwnerResponse[]>(`${environment.URL}/api/owners/country/get_by_id/${id}`);
      })
    );
  }

  /** Usuarios con rol propietario */
  public getAllByRole(): Observable<OwnerInterface[]> {
    return this._http.get<OwnerInterface[]>(`${environment.URL}/api/users?role=propietario`);
  }

  /** Propietario por ID */
  public getByID(id: number | string): Observable<OwnerResponse> {
    return this._http.get<OwnerResponse>(`${environment.URL}/api/owners/${id}`);
  }

  /**
   * Relacionar usuario (propietario) con propiedad.
   * No cambia la API, solo asegura números y añade logs útiles.
   */
  public async relationWithProperty(user_id: number, property_id: number): Promise<void> {
    const token = await this._auth.getJWT();
    const httpOptions = { headers: new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    })};

    // Asegurar enteros
    const body = {
      id_user: Math.floor(Number(user_id)),
      id_property: Math.floor(Number(property_id))
    };

    await this._alert.setLoading('Asignando propiedad…');

    try {
      await lastValueFrom(this._http.post(`${environment.URL}/api/owners`, body, httpOptions));
      await this._alert.removeLoading();
      await this._alert.showAlert('¡Listo!', 'La propiedad se asignó con éxito.');

      const country = await this._countryStorage.getCountry();
      const countryId = country?.id;
      if (countryId) {
        await this._alert.setLoading('Redirigiendo al Dashboard…');
        this._router.navigate(['/admin/country-dashboard', countryId]).then(() => {
          setTimeout(() => { this._alert.removeLoading(); }, 300);
        });
      } else {
        this._router.navigate(['/admin/home']);
      }
    } catch (err: any) {
      await this._alert.removeLoading();
      const msg = err?.error?.msg
        ? err.error.msg
        : (err?.status === 400
            ? 'La propiedad ya está asignada o los datos son inválidos.'
            : 'Error al asignar propiedad.');
      await this._alert.showAlert('¡Ooops!', msg);
    }
  }
}
