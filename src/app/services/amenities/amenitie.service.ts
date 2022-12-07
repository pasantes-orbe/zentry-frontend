import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';

@Injectable({
  providedIn: 'root'
})
export class AmenitieService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router) {
   }

   addAmenitiy(name: string, address: string, avatar: File){
    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    formData.append('avatar', avatar);

    this._alertService.setLoading();

    this._http.post(`${environment.URL}/api/amenities`, formData)
      .subscribe(res => {
        console.log(res);
        this._alertService.removeLoading();
        this._alertService.showAlert("¡Listo!", "El country se agregó con éxito");
        this._router.navigate(['/admin/home']);
      });
   }
}
