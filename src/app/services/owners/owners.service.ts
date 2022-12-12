import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { OwnerResponse } from '../../interfaces/ownerResponse-interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OwnersService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router,) { }

  public getAll(): Observable<OwnerResponse[]>{
    return this._http.get<OwnerResponse[]>(`${environment.URL}/api/owners`)
  }
}
