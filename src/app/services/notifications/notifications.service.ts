import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private _http: HttpClient) { }


  getAllByUser(id){
    return this._http.get<any[]>(`${environment.URL}/api/notifications/${id}`)
  }

}
