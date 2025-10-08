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

  constructor(
    private _guardStorageService: GuardStorageService,
    private _http: HttpClient,
    private _alertService: AlertService,
    private _router: Router,
    private _rols: RolsService,
    private _countryStorageService: CountryStorageService
  ) {}

  // 👉 NUEVO: helper para spinner + ir al dashboard del country
  private async goToDashboardWithSpinner(): Promise<void> {
    const country = await this._countryStorageService.getCountry();
    const countryId = country?.id;
    if (!countryId) { // fallback si no hay country en storage
      this._router.navigate(['/admin/home']);
      return;
    }
    await this._alertService.setLoading('Redirigiendo al Dashboard…');
    this._router.navigate(['/admin/country-dashboard', countryId]).then(() => {
      setTimeout(() => { this._alertService.removeLoading(); }, 300);
    });
  }

  public register(
    name: string,
    lastName: string,
    dni: any,
    email: any,
    password: any,
    phone: any,
    birthdate: any,
    avatar: File,
    rol: any
  ) {

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
        .subscribe(
          async (res) => {
            await this._alertService.removeLoading();
            this._alertService.showAlert("¡Listo!", `El usuario ${rol} fue creado con éxito`);

            if (rol === 'propietario') {
              this.asignarCountry(res['user']['id'], 'owners');

              // ❌ Antes:
              // this._router.navigate(['/admin/assign-country-to-owner']);
              // ✅ Ahora: spinner + dashboard
              await this.goToDashboardWithSpinner();

            } else if (rol == 'vigilador') {
              this._guardStorageService.saveGuard(res['user']['id']);
              this.asignarCountry(res['user']['id'], 'guards');

              // ❌ Antes:
              // this._router.navigate(['/admin/add-laboral-schedule']);
              // ✅ Ahora:
              await this.goToDashboardWithSpinner();

            } else {
              // ❌ Antes:
              // this._router.navigate(['/admin/home']);
              // ✅ Ahora:
              await this.goToDashboardWithSpinner();
            }
          },
          async (err:any) => {
            await this._alertService.removeLoading();

            console.log(err.error?.errors?.[0]?.["msg"]);
            console.log(err);

            if (err['status'] == 0) {
              await this._alertService.showAlert("Por favor subí una foto desde tu galería o archivos!", ``);
            } else if (err.error?.errors?.[0]?.["msg"] != '' || err.error?.errors?.[0]?.["msg"] != undefined || err.error?.errors?.[0]?.["msg"] != null) {
              await this._alertService.showAlert("Oops ha ocurrido un error!", `${err.error.errors[0]["msg"]}`);

              // ❌ Antes:
              // this._router.navigate([`/admin/country-dashboard`]);
              // ✅ Seguro:
              this._router.navigate(['/admin/home']);

            } else {
              // ❌ Antes:
              // this._router.navigate([`/admin/country-dashboard`]);
              // ✅ Seguro:
              this._router.navigate(['/admin/home']);
              await this._alertService.showAlert("¡Ooops!", ` Ha ocurrido un error `);
            }
          }
        );
    });
  }

  public async asignarCountry(idUser, rol) {
    const country = await this._countryStorageService.getCountry()
    const countryID = country.id;
    const formData = new FormData();
    formData.append('id_user', idUser);
    formData.append('id_country', countryID.toString());

    this._http.post(`${environment.URL}/api/${rol}/assign`, formData)
      .subscribe(res => console.log(res));
  }
  
}
