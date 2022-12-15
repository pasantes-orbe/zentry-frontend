import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { OwnerResponse } from '../../interfaces/ownerResponse-interface';
import { Observable } from 'rxjs';
import { OwnerInterface } from '../../interfaces/owner-interface';
import { AlertService } from '../helpers/alert.service';



@Injectable({
  providedIn: 'root'
})
export class OwnersService {

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router,) { }

  public getAll(): Observable<OwnerResponse[]>{
    return this._http.get<OwnerResponse[]>(`${environment.URL}/api/owners`)
  }

  public getAllByRole(): Observable<OwnerInterface[]>{
    return this._http.get<OwnerInterface[]>(`${environment.URL}/api/users?role=propietario`)
  }

  public getByID(id): Observable<OwnerResponse>{

    return this._http.get<OwnerResponse>(`${environment.URL}/api/owners/${id}`)

  }

  public relationWithProperty(user_id, property_id){
    const formData = new FormData();
    formData.append('id_user', user_id);
    formData.append('id_property', property_id);
    this._alertService.setLoading();

    

    this._http.post(`${environment.URL}/api/owners`, formData).subscribe(
      res => {
        this._alertService.removeLoading()
        this._alertService.showAlert("¡Listo!", "La propiedad se asignó con éxito al usuario");
        this._router.navigate(['/admin/ver-propietarios']); 
      },
      (err) => {
        console.log(err)
        this._alertService.removeLoading();
        this._alertService.showAlert("¡Ooops!", "Ocurrió un error Inesperado");
        this._router.navigate(['/admin/ver-propietarios']);
      }
    )
  }
}
