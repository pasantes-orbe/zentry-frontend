import { filter, map, first } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../helpers/alert.service';
import { RolsService } from './rols.service';
import { Rols } from 'src/app/interfaces/rols-interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private _authStorageService: any;

  constructor(private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _rols: RolsService, ) { }

    private id;
  
  public register(name: string,
                        lastName: string,
                        dni: any,
                        email: any,
                        password: any,
                        phone: any,
                        birthdate: any,
                        avatar: File,
                        rol: any)
{

  console.log(name);
  console.log(lastName);
  console.log(dni);
  console.log(email);
  console.log(password);
  console.log(phone);
  console.log(birthdate);
  console.log(avatar);

  
  this._rols.filtrarPorRol(rol).subscribe((data)=>{
    console.log(data);
    this.id = data[0].id
    const formData = new FormData();
    formData.append('avatar', avatar);
    formData.append('name', name);
    formData.append('lastname', lastName);
    formData.append('dni', dni);
    formData.append('phone', phone);
    formData.append('birthday', birthdate);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role_id', this.id);

    this._alertService.setLoading();
    
    this._http.post(`${environment.URL}/api/users`, formData)
      .subscribe(res => {
        console.log(res)
        this._alertService.removeLoading();
        this._alertService.showAlert("¡Listo!", `El usuario ${rol} fue creado con éxito`);
        this._router.navigate(['/admin/country-dashboard']);
      });
  }
  )

 // const token = await this._authStorageService.getJWT();

    

    //const httpOptions = {
     // headers: new HttpHeaders({
      //  'Authorization': 'Token' + token, No funciona con Token, por error
     // }),
    //};
  }

}