// src/app/services/auth/password-recover.service.ts
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

  public requestNewPassword(email: string): Observable<any> {
    // Enviar JSON; Angular setea Content-Type: application/json automáticamente
    const body = { email };
    return this.http.post(`${environment.URL}/api/users/request-change-password`, body);
  }

  public pendientsPasswordRequests(): Observable<PasswordRecoverInterface[]>{

    return this.http.get<PasswordRecoverInterface[]>(`${environment.URL}/api/users/requests/password-changes?pendient=true`)
  }

  public async patchStatusRequest(id){
    const token = await this._authStorageService.getJWT()
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      }),
    }
    
    // ------------------------------------------------------------------------------------
    // Endpoint: /api/users/requests/password-changes/:id/approve
    // ------------------------------------------------------------------------------------
    const approvalUrl = `${environment.URL}/api/users/requests/password-changes/${id}/approve`;
    
    return this.http.patch(
        approvalUrl, 
        {
          status: true
        },
        httpOptions
    )

  }
}
