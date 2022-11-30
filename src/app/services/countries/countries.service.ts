import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router) { }


  public getAll(){

    return this._http.get(`${environment.URL}/api/countries`);

  }

  public addCountry(avatar: File, name: string, latitude: string, longitude: string){

    const formData = new FormData();
    formData.append('avatar', avatar);
    formData.append('name', name);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);

    this._alertService.setLoading();

    this._http.post(`${environment.URL}/api/countries`, formData)
      .subscribe(res => {
        console.log(res);
        this._alertService.removeLoading();
        this._alertService.showAlert("¡Listo!", "El country se agregó con éxito");
        this._router.navigate(['/admin/home']);
      });


  }

}
