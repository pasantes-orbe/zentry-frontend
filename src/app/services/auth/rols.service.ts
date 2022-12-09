import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Rols } from 'src/app/interfaces/rols-interface';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { filter } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class RolsService {

  constructor(private http: HttpClient) { }

     getRoles(): Observable<Rols[]>{

      return this.http.get<Rols[]>(`${environment.URL}/api/roles`);
  }

  filtrarPorRol(nombreDeRol){
   const respuesta = this.getRoles().pipe(
      map( data =>
     data.filter(data => data.name == nombreDeRol)
    )
    )
    return respuesta
  }


}
