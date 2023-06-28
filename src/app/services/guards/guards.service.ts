import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { GuardInterface } from '../../interfaces/guard-interface';
import { Observable } from 'rxjs';
import { CountryStorageService } from '../storage/country-storage.service';
import { OwnerStorageService } from '../storage/owner-interface-storage.service';

@Injectable({
  providedIn: 'root'
})
export class GuardsService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _countryStorageService: CountryStorageService, private _ownerStorage: OwnerStorageService) { }

  public getAll(): Observable<GuardInterface[]>{
    return this._http.get<GuardInterface[]>(`${environment.URL}/api/users?role=vigilador`);
  }

  public async getAllByCountryID(): Promise<Observable<GuardInterface[]>>{
    const country = await this._countryStorageService.getCountry()
    const countryID = country.id 
    return this._http.get<GuardInterface[]>(`${environment.URL}/api/guards/schedule/all/${countryID}`);
  }

  async getAllByCountryIdSinceOwner(): Promise<Observable<any[]>>{
    const owner = await this._ownerStorage.getOwner();
    const countryID = owner.property.id_country
    return this._http.get<any[]>(`${environment.URL}/api/guards/schedule/all/${countryID}`);
  }

  public getGuardByCountryId(id:any){
    const userID = id;
    return this._http.get(`${environment.URL}/api/guards/get_country/${userID}`);
  }

}
