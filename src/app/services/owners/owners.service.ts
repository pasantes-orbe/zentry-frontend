import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { OwnerResponse } from '../../interfaces/ownerResponse-interface';
import { Observable } from 'rxjs';
import { OwnerInterface } from '../../interfaces/owner-interface';
import { AlertService } from '../helpers/alert.service';
import { CountryStorageService } from '../storage/country-storage.service';
import { Owner_CountryInterface } from 'src/app/interfaces/owner_country-interface';

@Injectable({
  providedIn: 'root'
})
export class OwnersService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _countryStorageService: CountryStorageService) { }

  public getAll(): Observable<OwnerResponse[]>{
    return this._http.get<OwnerResponse[]>(`${environment.URL}/api/owners`)
  }

  public async getAllByCountryID(): Promise<Observable<OwnerResponse[]>>{
    const country = await this._countryStorageService.getCountry()
    const countryID = country.id

    console.log(country.id);
    return this._http.get<OwnerResponse[]>(`${environment.URL}/api/owners/country/get_by_id/${countryID}`)
  }

  public async getAllByCountry(): Promise<Observable<Owner_CountryInterface[]>>{
    const country = await this._countryStorageService.getCountry()
    const countryID = country.id
    return this._http.get<Owner_CountryInterface[]>(`${environment.URL}/api/users/owners/get_by_country/${countryID}`)
  }

  public getAllByRole(): Observable<OwnerInterface[]>{
    return this._http.get<OwnerInterface[]>(`${environment.URL}/api/users?role=propietario`)
  }

  public getByID(id): Observable<OwnerResponse>{

    return this._http.get<OwnerResponse>(`${environment.URL}/api/owners/${id}`)

  }

  public async relationWithProperty(user_id, property_id){
    const formData = new FormData();
    formData.append('id_user', user_id);
    formData.append('id_property', property_id);
     await this._alertService.setLoading();

    

    this._http.post(`${environment.URL}/api/owners`, formData).subscribe(
      async (res) => {
        console.log(res)
        await this._alertService.removeLoading()
        this._alertService.showAlert("¡Listo!", "La propiedad se asignó con éxito al usuario");
        this._router.navigate(['/admin/ver-propietarios']); 
      },
      async (err) => {
        console.log(err);
        await this._alertService.removeLoading();
        this._alertService.showAlert("¡Ooops!", `${err['error']['msg']}`);
        this._router.navigate([`/admin/ver-propietarios`]);
    }
    )
  }
}