import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { AuthStorageService } from '../storage/auth-storage.service';
import { CountryStorageService } from '../storage/country-storage.service';
import { PropertyInterface } from '../../interfaces/property-interface';
import { Observable } from 'rxjs';
import { Property_OwnerInterface } from '../../interfaces/property_owner-interface';


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

    await this._alertService.setLoading();
    this._http.post(`${environment.URL}/api/properties`, formData, httpOptions)
      .subscribe(async (res) => {
        console.log(res);
        await this._alertService.removeLoading();
        this._alertService.showAlert("¡Listo!", "La propiedad se agregó con éxito");
        this._router.navigate([`/admin/ver-propiedades`]);
  },
  async (err) => {
    console.log(err);
    await this._alertService.removeLoading();
    if(err['status'] == 0){
      await this._alertService.showAlert("Por favor subí una foto desde tu galería o archivos!", ``);
    } else {
      await this._router.navigate([`/admin/ver-propiedades`]);
      await this._alertService.showAlert("¡Ooops!", `${err['error']}`);
  }
    }
  
  

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


public async getAllProperty_OwnerByCountryID():Promise<Observable<Property_OwnerInterface[]>> {
  const token = await this._authStorageService.getJWT();
  const country = await this._countryStorageService.getCountry()
  const countryID = country.id
  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': token,
    }),
  };
  return this._http.get<Property_OwnerInterface[]>(`${environment.URL}/api/properties/country/get_by_id/${countryID}`, httpOptions);
}


async getOneProperty(id: number){

  const token = await this._authStorageService.getJWT()

  const httpOptions = {
    headers: new HttpHeaders({
      'Authorization': token,
    }),
  };

  return this._http.get(`${environment.URL}/api/properties/${id}`, httpOptions)

  }


   editProperty(token, id, name, number, address){

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': token,
      }),
    };

   return this._http.patch(`${environment.URL}/api/properties/${id}`, {
      name,
      number,
      address
    }, httpOptions)

  }

  deleteProperty(id, token){
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': token,
      }),
    };
   return this._http.delete(`${environment.URL}/api/properties/${id}`, httpOptions)

  }


}
