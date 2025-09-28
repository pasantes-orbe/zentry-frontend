// src/app/services/owners/owners.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { OwnerResponse } from '../../interfaces/ownerResponse-interface';
import { Observable, from, switchMap } from 'rxjs'; 
import { OwnerInterface } from '../../interfaces/owner-interface';
import { AlertService } from '../helpers/alert.service';
import { CountryStorageService } from '../storage/country-storage.service';
import { Owner_CountryInterface } from 'src/app/interfaces/owner_country-interface';

@Injectable({
  providedIn: 'root'
})
export class OwnersService {

  constructor(
    private _http: HttpClient, 
    private _alertService: AlertService, 
    private _router: Router, 
    private _countryStorageService: CountryStorageService
  ) { }

  /**
   * Obtiene todos los propietarios sin filtrar.
   * @returns Observable<OwnerResponse[]>
   */
  public getAll(): Observable<OwnerResponse[]>{
    return this._http.get<OwnerResponse[]>(`${environment.URL}/api/owners`)
  }
  
  /**
   * Obtiene propietarios filtrados por el país almacenado, usando getCountry().
   * Usa from/switchMap para manejar la Promesa del Storage.
   * @returns Observable<Owner_CountryInterface[]>
   */
  public getAllByCountry(): Observable<Owner_CountryInterface[]>{
    return from(this._countryStorageService.getCountry()).pipe(
      // Si getCountry() retorna null, esto fallará si no manejamos el error, 
      // pero asumo que getCountry() retorna un objeto con 'id' o la lógica del componente lo maneja.
      switchMap(country => {
        const countryID = country.id;
        // Cambiamos al Observable de la petición HTTP
        return this._http.get<Owner_CountryInterface[]>(`${environment.URL}/api/users/owners/get_by_country/${countryID}`);
      })
    );
  }

  /**
   * Obtiene propietarios filtrados por el ID de país almacenado (ruta alternativa).
   * Usa from/switchMap para manejar la Promesa del Storage.
   * @returns Observable<OwnerResponse[]>
   */
  public getAllByCountryID(): Observable<OwnerResponse[]>{
    return from(this._countryStorageService.getCountry()).pipe(
      switchMap(country => {
        const countryID = country.id;
        return this._http.get<OwnerResponse[]>(`${environment.URL}/api/owners/country/get_by_id/${countryID}`)
      })
    );
  }

  /**
   * Obtiene todos los usuarios con el rol 'propietario'.
   * @returns Observable<OwnerInterface[]>
   */
  public getAllByRole(): Observable<OwnerInterface[]>{
    return this._http.get<OwnerInterface[]>(`${environment.URL}/api/users?role=propietario`)
  }

  /**
   * Obtiene un propietario por su ID.
   * @param id ID del propietario (asumo number o string)
   * @returns Observable<OwnerResponse>
   */
  public getByID(id: number | string): Observable<OwnerResponse>{
    return this._http.get<OwnerResponse>(`${environment.URL}/api/owners/${id}`)
  }

  /**
   * Relaciona un usuario (propietario) con una propiedad.
   * NOTA: Mantiene el manejo de UI (alerta/navegación) dentro del servicio.
   * @param user_id ID del usuario
   * @param property_id ID de la propiedad
   */
  public async relationWithProperty(user_id: number, property_id: number): Promise<void>{
    // Usamos el tipado para los parámetros. Asumo que son números.
    const body = {
      id_user: user_id,
      id_property: property_id
    };
      await this._alertService.setLoading();

    this._http.post(`${environment.URL}/api/owners`, body).subscribe({
      next: async (res) => {
        console.log(res)
        await this._alertService.removeLoading()
        this._alertService.showAlert("¡Listo!", "La propiedad se asignó con éxito al usuario");
        this._router.navigate(['/admin/ver-propietarios']); 
      },
      error: async (err) => {
        console.log(err);
        await this._alertService.removeLoading();
        // Usamos la notación de corchetes de forma segura por si el error no es HTTP.
        const errorMessage = err.error?.msg || 'Error desconocido al asignar propiedad.';
        this._alertService.showAlert("¡Ooops!", errorMessage);
        this._router.navigate([`/admin/ver-propietarios`]);
      }
    });
  }
}