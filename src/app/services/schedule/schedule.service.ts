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

  public async saveSchedule(
    day: any, 
    start: any, 
    exit: any,       
    explicitGuardId?: string | number, 
    explicitCountryId?: string | number
    ){

    // Obtener CountryID: usa el explícito (URL) si existe, sino usa Storage
    let countryID: string;
    if (explicitCountryId) {
        countryID = String(explicitCountryId);
    } else {
        // ✅ CORRECCIÓN: Leer el CountryID del CountryStorageService
        const country = await this._countryStorageService.getCountry();
        countryID = country.id.toString();
    }

    // Obtener GuardID: usa el explícito (URL) si existe, sino usa Storage
    let guardID: string;
    if (explicitGuardId) {
        guardID = String(explicitGuardId);
    } else {
        // El ID del vigilador siempre debe venir del Storage si no viene de la URL (flujo de registro)
        guardID = await this._guardStorageService.getGuard();
    }
    
    console.log("GuardID a usar:", guardID);
    // Aseguramos que countryID se use como string para FormData
    console.log("CountryID a usar:", countryID);


    const formData = new FormData();
    formData.append('id_country', countryID); // Usar directamente countryID (que ya es string)
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


  public editSchedule(id, newStart, newExit, week_day){

    
    console.log("ENTRADA", newStart, " Salida", newExit);

   return this._http.put(`${environment.URL}/api/guards/schedule/${id}`, 
    {
      newStart,
      newExit,
      week_day
    })
    
  }


  public deleteScheduleById(id){

    return this._http.delete(`${environment.URL}/api/guards/delete-schedule/${id}`)
  }

  public newHourOnSchedule(id_user, id_country, week_day, start, exit){

    return this._http.post(`${environment.URL}/api/guards/new-schedule`, 
    {
      id_user,
      id_country,
      week_day,
      start,
      exit
    })

  }

}