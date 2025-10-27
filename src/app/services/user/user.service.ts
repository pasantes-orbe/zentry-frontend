import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { environment } from 'src/environments/environment';
import { UserStorageService } from '../storage/user-storage.service';
import { ToastController } from '@ionic/angular';
import { AuthStorageService } from '../storage/auth-storage.service';
import { from, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private _htpp :HttpClient,
    private _userStorage: UserStorageService,
    private toastController: ToastController,
    private _auth: AuthStorageService
  ) { }

    getUserByID(id){

      return this._htpp.get<any>(`${environment.URL}/api/users/${id}`)

    }

    updateMyUser(id, name, lastname, birthday, email, phone){
      console.log(birthday, name, lastname, email, phone );


      return this._htpp.patch<UserInterface>(`${environment.URL}/api/users/update-user/${id}`, {
        name,
        birthday,
        lastname, 
        email, 
        phone
      }).subscribe(res => 
        {
          console.log(res);
          this._userStorage.saveUser(res['user'])
        } )
    }

    updateUser(id, name, lastname, birthday, email, phone){
      console.log(birthday, name, lastname, email, phone );


      return this._htpp.patch<UserInterface>(`${environment.URL}/api/users/update-user/${id}`, {
        name,
        birthday,
        lastname, 
        email, 
        phone
      }).subscribe(async res => 
        {
          await this.correctlyToast()
          console.log(res);
        },
        async err => {
          await this.errorToast()
        } 
        )
    }

    
    async correctlyToast() {
      const toast = await this.toastController.create({
        message: 'Cambios guardados correctamente!',
        duration: 2000,
        position: 'bottom'
      });
  
      await toast.present();
    }
  
    async errorToast() {
      const toast = await this.toastController.create({
        header: 'Ha ocurrido un error al cambiar los horarios!',
        message: 'Por favor intente nuevamente',
        duration: 2000,
        position: 'bottom'
      });
  
      await toast.present();
    }

    // Subir avatar del usuario (multipart/form-data)
    uploadAvatar(id: number, file: File){
      const formData = new FormData();
      formData.append('avatar', file);
      return this._htpp.patch<any>(`${environment.URL}/api/users/avatar/${id}`, formData);
    }

    deleteUserById(id: number){
      return from(this._auth.getJWT()).pipe(
        switchMap(token => {
          const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
          return this._htpp.delete(`${environment.URL}/api/users/${id}`, { headers });
        })
      );
    }

}
