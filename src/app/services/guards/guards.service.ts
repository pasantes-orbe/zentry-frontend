import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { GuardInterface } from '../../interfaces/guard-interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuardsService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router,) { }

  public getAll(): Observable<GuardInterface[]>{
    return this._http.get<GuardInterface[]>(`${environment.URL}/api/users?role=vigilador`);
  }
}
