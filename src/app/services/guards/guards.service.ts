import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { GuardInterface } from '../../interfaces/guard-interface';
import { Observable } from 'rxjs';
import { CountryStorageService } from '../storage/country-storage.service';

@Injectable({
  providedIn: 'root'
})
export class GuardsService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _countryStorageService: CountryStorageService) { }

  public getAll(): Observable<GuardInterface[]>{
    return this._http.get<GuardInterface[]>(`${environment.URL}/api/users?role=vigilador`);
  }

  public async getAllByCountryID(): Promise<Observable<GuardInterface[]>>{
    const country = await this._countryStorageService.getCountry()
    const countryID = country.id 
    return this._http.get<GuardInterface[]>(`${environment.URL}/api/guards/get_by_country/${countryID}`);
  }
}
