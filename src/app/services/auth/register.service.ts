import { filter, map, first } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../helpers/alert.service';
import { RolsService } from './rols.service';

import { environment } from 'src/environments/environment';
import { CountryStorageService } from '../storage/country-storage.service';
import { UserInterface } from '../../interfaces/user-interface';
import { GuardResponseInterface } from '../../interfaces/guard-response-interface';
import { GuardStorageService } from '../storage/guard-storage.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private _authStorageService: any;
  private id;
  private guard: GuardResponseInterface

  constructor(private _guardStorageService: GuardStorageService, private _http: HttpClient, private _alertService: AlertService, private _router: Router, private _rols: RolsService, private _countryStorageService: CountryStorageService) { }

  public register(
    name: string,
    lastName: string,
    dni: any,
    email: any,
    password: any,
    phone: any,
    birthdate: any,
    avatar: File,
    rol: any) {

    console.log(name);
    console.log(lastName);
    console.log(dni);
    console.log(email);
    console.log(password);
    console.log(phone);
    console.log(birthdate);
    console.log(avatar);


    this._rols.filtrarPorRol(rol).subscribe(async (data) => {
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

      await this._alertService.setLoading();

      this._http.post(`${environment.URL}/api/users`, formData)
        .subscribe( async (res) => {
          await this._alertService.removeLoading();
            this._alertService.showAlert("¡Listo!", `El usuario ${rol} fue creado con éxito`);
          if (rol === 'propietario') {
            this.asignarCountry(res['user']['id'], 'owners')
            this._router.navigate(['/admin/asignar-propiedad'])
          } else if (rol == 'vigilador') {
            this._guardStorageService.saveGuard(res['user']['id'])
            this.asignarCountry(res['user']['id'], 'guards')
            this._router.navigate(['/admin/agregar-horario-laboral']);
          } else {
            this._router.navigate(['/admin/country-dashboard']);
          }
        },
          async (err) => {
            console.log(err);
            await  this._alertService.removeLoading();
            this._alertService.showAlert("¡Ooops!", `${err['error']}`);
            this._router.navigate([`/admin/country-dashboard`]);
          }

        );
    })


  }

  public async asignarCountry(idUser, rol) {
    const country = await this._countryStorageService.getCountry()
    const countryID = country.id;
    const formData = new FormData();
    formData.append('id_user', idUser);
    formData.append('id_country', countryID.toString());

    this._http.post(`${environment.URL}/api/${rol}/assign`, formData).subscribe(res => console.log(res))
  }


}