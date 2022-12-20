import { AlertService } from 'src/app/services/helpers/alert.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { Injectable } from '@angular/core';
import { GuardStorageService } from '../storage/guard-storage.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private _guardStorageService: GuardStorageService, private _countryStorageService : CountryStorageService, private _alertService: AlertService, private _http: HttpClient ) { }


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
}
