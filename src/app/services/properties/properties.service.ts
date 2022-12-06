import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { AuthStorageService } from '../storage/auth-storage.service';


@Injectable({
  providedIn: 'root'
})
export class PropertiesService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _authStorageService: AuthStorageService) { }

  public async addCountry(avatar: File, name: string, address: string, propertyNumber: any){
    const countryID: any = 1;
    const token = await this._authStorageService.getJWT();
    const formData = new FormData();
    formData.append('avatar', avatar);
    formData.append('name', name);
    formData.append('address', address);
    formData.append('number', propertyNumber);
    formData.append('id_country', countryID);

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Token' + token,
      }),
    };

    this._http.post(`${environment.URL}/api/properties`, formData, httpOptions)
      .subscribe(res => {
        console.log(res);
  },
  (err) =>{
    console.log(err);
  }
  );

};

}
