import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { AuthStorageService } from '../storage/auth-storage.service';
import { CountryStorageService } from '../storage/country-storage.service';
import { PropertyInterface } from '../../interfaces/property-interface';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PropertiesService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _authStorageService: AuthStorageService, private _countryStorageService: CountryStorageService) { }
  
  public async addCountry(avatar: File, name: string, address: string, propertyNumber: any){
    const token = await this._authStorageService.getJWT();
    const country = await this._countryStorageService.getCountry(); 
    const countryID = country.id;
    const formData = new FormData();
    formData.append('avatar', avatar);
    formData.append('name', name);
    formData.append('address', address);
    formData.append('number', propertyNumber);
    formData.append('id_country', countryID.toString());

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': token,
      }),
    };

    this._alertService.setLoading();
    this._http.post(`${environment.URL}/api/properties`, formData, httpOptions)
      .subscribe(res => {
        console.log(res);
        this._alertService.removeLoading();
        this._alertService.showAlert("¡Listo!", "La propiedad se agregó con éxito");
        this._router.navigate([`/admin/ver-propiedades`]);
  },

  );

};

public async getAll(): Promise<Observable<PropertyInterface[]>> {
  const token = await this._authStorageService.getJWT();
  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': token,
    }),
  };
  return this._http.get<PropertyInterface[]>(`${environment.URL}/api/properties`, httpOptions);

}

public async getAllById(): Promise<Observable<PropertyInterface[]>> {
  const token = await this._authStorageService.getJWT();
  const country = await this._countryStorageService.getCountry()
  const countryID = country.id
  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': token,
    }),
  };
  return this._http.get<PropertyInterface[]>(`${environment.URL}/api/properties/country/get_by_id/${countryID}`, httpOptions);

}

public async getBySearchTerm(searchTerm) : Promise<Observable<PropertyInterface[]>> {
  const token = await this._authStorageService.getJWT();
  const country = await this._countryStorageService.getCountry()
  const countryID = country.id;

  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': token,
    }),
  };
  return this._http.get<PropertyInterface[]>(`${environment.URL}/api/properties/${countryID}/${searchTerm}`, httpOptions);
}

}
