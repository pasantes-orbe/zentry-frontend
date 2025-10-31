//src/app/services/auth/register.service.ts
import { filter, map, first } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../helpers/alert.service';
import { RolsService } from './rols.service';

import { environment } from 'src/environments/environment';
import { CountryStorageService } from '../storage/country-storage.service';
import { AuthStorageService } from '../storage/auth-storage.service';
import { UserInterface } from '../../interfaces/user-interface';
import { UserService } from '../user/user.service';
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
    private _countryStorageService: CountryStorageService,
    private _auth: AuthStorageService,
    private _userSvc: UserService
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
      this.id = data[0].id;

      /* 
      // 🔴 CÓDIGO ORIGINAL (JSON plano)
      // Crear usuario con JSON puro (sin multipart) para evitar 413 en create
      const body = {
        name: String(name ?? ''),
        lastname: String(lastName ?? ''),
        dni: String(dni ?? ''),
        phone: String(phone ?? ''),
        birthday: String(birthdate ?? ''),
        email: String(email ?? '').toLowerCase(),
        password: String(password ?? ''),
        role_id: String(this.id ?? '')
      } as any;
      */

      // ✅ NUEVO CÓDIGO: usamos FormData para enviar el avatar y los campos
      const formData = new FormData();
      formData.append('name', String(name ?? ''));
      formData.append('lastname', String(lastName ?? ''));
      formData.append('dni', String(dni ?? ''));
      formData.append('phone', String(phone ?? ''));
      formData.append('birthday', String(birthdate ?? ''));
      formData.append('email', String(email ?? '').toLowerCase());
      formData.append('password', String(password ?? ''));
      formData.append('role_id', String(this.id ?? ''));

      if (avatar instanceof File) {
        formData.append('avatar', avatar, avatar.name);
      }

      await this._alertService.setLoading();

      /* 
      // 🔴 CÓDIGO ORIGINAL: envío JSON
      this._http.post(`${environment.URL}/api/users`, body)
      */
      // ✅ NUEVO CÓDIGO: envío multipart con FormData
      this._http.post(`${environment.URL}/api/users`, formData)
        .subscribe(
          async (res) => {
            await this._alertService.removeLoading();
            this._alertService.showAlert("¡Listo!", `El usuario ${rol} fue creado con éxito`);

            /* 
            // 🔴 ORIGINAL: Subida de avatar después
            // Siempre intentar subir avatar post-registro si se proporcionó un archivo
            try {
              const createdUserId = res && res['user'] && res['user']['id'];
              if (createdUserId && avatar instanceof File) {
                await this.uploadAvatarAfterRegister(createdUserId, avatar);
              }
            } catch (e) {
              console.warn('No se pudo subir el avatar post-registro (se puede subir luego desde edición de perfil):', e);
            }
            */

            // ✅ NUEVO: avatar ya se subió en la misma request, no hace falta subirlo después

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

            const serverMsg = err?.error?.msg
              || err?.error?.message
              || (Array.isArray(err?.error?.errors) && err.error.errors.length > 0 && err.error.errors[0]?.msg)
              || (typeof err?.message === 'string' ? err.message : '')
              || 'Error al crear el usuario.';

            if (err?.status === 0) {
              await this._alertService.showAlert('Conexión rechazada', 'Verificá tu conexión a internet o el servidor.');
            } else {
              await this._alertService.showAlert('Oops ha ocurrido un error!', serverMsg);
            }

            this._router.navigate(['/admin/home']);
          }
        )
    });
  }

  // Intento de subida de avatar inmediatamente post-registro, por si el endpoint de create no lo procesó
  private async uploadAvatarAfterRegister(userId: number, file: File): Promise<void> {
    // 🔸 Ya no se usa porque ahora se sube junto al registro
    // Subida única en multipart con compresión previa (sin reintentos)
    // await this._userSvc.uploadAvatar(userId, file).toPromise();
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

  // 🔸 registerWithCallback se deja igual (ya usa FormData correctamente)
  public registerWithCallback(
    name: string,
    lastName: string,
    dni: any,
    email: any,
    password: any,
    phone: any,
    birthdate: any,
    avatar: File,
    rol: any,
    onSuccess?: (userId: number) => Promise<void>
  ) {
    this._rols.filtrarPorRol(rol).subscribe(async (data) => {
      this.id = data[0].id;
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

      this._http.post(`${environment.URL}/api/users`, formData)
        .subscribe(
          async (res) => {
            const userId = res['user']['id'];
            
            // Ejecutar el callback si existe (para crear horarios, etc.)
            if (onSuccess) {
              await onSuccess(userId);
            }

            await this._alertService.removeLoading();
            this._alertService.showAlert("¡Listo!", `El usuario ${rol} fue creado con éxito`);

            if (rol === 'propietario') {
              this.asignarCountry(userId, 'owners');
              await this.goToDashboardWithSpinner();
            } else if (rol == 'vigilador') {
              this._guardStorageService.saveGuard(userId);
              this.asignarCountry(userId, 'guards');
              await this.goToDashboardWithSpinner();
            } else {
              await this.goToDashboardWithSpinner();
            }
          },
          async (err: any) => {
            await this._alertService.removeLoading();
            console.log(err.error?.errors?.[0]?.["msg"]);
            console.log(err);

            if (err['status'] == 0) {
              await this._alertService.showAlert("Por favor subí una foto desde tu galería o archivos!", ``);
            } else if (err.error?.errors?.[0]?.["msg"] != '' || err.error?.errors?.[0]?.["msg"] != undefined || err.error?.errors?.[0]?.["msg"] != null) {
              await this._alertService.showAlert("Oops ha ocurrido un error!", `${err.error.errors[0]["msg"]}`);
              this._router.navigate(['/admin/home']);
            } else {
              this._router.navigate(['/admin/home']);
              await this._alertService.showAlert("¡Ooops!", ` Ha ocurrido un error `);
            }
          }
        );
    });
  }
  
}
