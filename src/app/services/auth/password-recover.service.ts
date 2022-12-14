import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { PasswordRecoverInterface } from '../../interfaces/Password-requests-interface';
import { AuthStorageService } from '../storage/auth-storage.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordRecoverService {

  constructor(
    private http: HttpClient, private _alertService: AlertService, private _router: Router, private _authStorageService: AuthStorageService
  ) { }

  public requestNewPassword(email){
    const formData = new FormData();
    formData.append('email', email);

    this.http.post(`${environment.URL}/api/users/request-change-password`, formData).subscribe(
      res => console.log(res)
    )
  }

  public pendientsPasswordRequests(): Observable<PasswordRecoverInterface[]>{

    return this.http.get<PasswordRecoverInterface[]>(`${environment.URL}/api/users/requests/password-changes?pendient=true`)
  }

  public async patchStatusRequest(id){
    const token = await this._authStorageService.getJWT()
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': token,
      }),
    }
    return this.http.patch(`${environment.URL}/api/users/change-password/${id}`,
    {
      status: true
    },
    httpOptions
    )

  }
}

