import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { RecurrentsInterface } from '../../interfaces/recurrents-interface';
import { Observable } from 'rxjs';
import { CountryStorageService } from '../storage/country-storage.service';

@Injectable({
  providedIn: 'root'
})
export class RecurrentsService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _countryStorageService: CountryStorageService) { }

  public async addRecurrent(id_property, name, lastname, dni, role){


    const formData = new FormData();
    formData.append('id_property', id_property);
    formData.append('guest_name', name);
    formData.append('guest_lastname', lastname);
    formData.append('dni', dni);
    await this._alertService.setLoading();
    

    this._http.post(`${environment.URL}/api/recurrents`, formData)
      .subscribe(
        async (res) => {
        console.log(res);
        await this._alertService.removeLoading();
        if(role == "admin"){
          this._router.navigate([`/admin/invitados-recurrentes`])
        } else {
          this._router.navigate([`/home/tabs/tab1`])
        }
        this._alertService.showAlert("¡Listo!", "El Invitado se agregó con éxito");
      },
      async (err) => {
        console.log(err);
        await this._alertService.removeLoading();
        this._alertService.showAlert("¡Ooops!", `${err['error']['msg']}`);
    });

  }

  public async getRecurrentsByCountry(): Promise<Observable<RecurrentsInterface[]>> {
    const country = await this._countryStorageService.getCountry();
    const countryID = country.id;

    return this._http.get<RecurrentsInterface[]>(`${environment.URL}/api/recurrents/get-by-country/${countryID}`);
  
  }

  public getAll(): Observable<RecurrentsInterface[]> {

    return this._http.get<RecurrentsInterface[]>(`${environment.URL}/api/recurrents`);
  
    }

    public getByPropertyID(id){

      return this._http.get<any[]>(`${environment.URL}/api/recurrents/get-by-property/${id}`)
    }

  public patchStatus(id_property, recurrentStatus){
    const recurrentStatusNew = !recurrentStatus
    return this._http.patch(`${environment.URL}/api/recurrents/${id_property}`,
    {
      status: recurrentStatusNew
    })
  }
}
