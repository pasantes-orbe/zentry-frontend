import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Rols } from 'src/app/interfaces/rols-interface';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RolsService {

  constructor(private http: HttpClient) { }

     getRole(): Observable<Rols[]>{

      return this.http.get<Rols[]>(`${environment.URL}/api/roles`);
  }

}
