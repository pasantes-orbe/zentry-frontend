import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../helpers/alert.service';
import { Router } from '@angular/router';
import { CountryStorageService } from '../storage/country-storage.service';
import { environment } from 'src/environments/environment';
import { GuardStorageService } from '../storage/guard-storage.service';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  

  constructor(private _guardStorageService: GuardStorageService, private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _countryStorageService: CountryStorageService) { }

  public async saveSchedule(day: any, start: any, exit: any){
    const country = await this._countryStorageService.getCountry()
    const countryID = country.id;

    const guardID = await this._guardStorageService.getGuard()
    console.log(guardID)
    const formData = new FormData();
    formData.append('id_country', countryID.toString());
    formData.append('id_user', guardID);
    formData.append('week_day', day);
    formData.append('start', start);
    formData.append('exit', exit);


    this._http.post(`${environment.URL}/api/guards/schedule`, formData).subscribe(
      res =>{
        console.log(res)
      }
    )


  }

  public getScheduleById(id:any): Observable<any[]>{

   return this._http.get<any[]>(`${environment.URL}/api/guards/schedule/${id}`)

  }
}
