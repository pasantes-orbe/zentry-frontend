//src/app/services/countries/countries.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { AuthStorageService } from '../storage/auth-storage.service';
import { CountryInteface } from '../../interfaces/country-interface';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _authStorageService: AuthStorageService) { }


  public getAll(){

    return this._http.get(`${environment.URL}/api/countries`);

  }

  public async addCountry(
  avatar: File,
  name: string,
  latitude: string,
  longitude: string,
  address: string,
  locality: string,
  phone: string,
  perimeterPoints: string
): Promise<void> {
  const formData = new FormData();
  formData.append('avatar', avatar);
  formData.append('name', name);
  formData.append('latitude', latitude);
  formData.append('longitude', longitude);
  formData.append('address', address);
  formData.append('locality', locality);
  formData.append('phone', phone);
  formData.append('perimeterPoints', perimeterPoints);

  await this._alertService.setLoading();

  this._http.post(`${environment.URL}/api/countries`, formData).subscribe(
    async (res) => {
      console.log(res);
      await this._alertService.removeLoading();
      this._alertService.showAlert('¡Listo!', 'El country se agregó con éxito');
      this._router.navigate(['/admin/home']);
    },
    async (err) => {
      console.error(err);
      await this._alertService.removeLoading();
      this._alertService.showAlert('¡Ooops!', 'No se pudo agregar el country. Inténtalo de nuevo.');
    }
  );
}

  public getByID(id:number): Observable<CountryInteface> {
    return this._http.get<CountryInteface>(`${environment.URL}/api/countries/${ id }`);
  }
  
  public deleteById(id){
    return this._http.patch(`${environment.URL}/api/countries/delete-country/${ id }`, {})
  }
}
