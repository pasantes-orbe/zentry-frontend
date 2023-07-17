import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { environment } from 'src/environments/environment';
import { UserStorageService } from '../storage/user-storage.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private _htpp :HttpClient,
    private _userStorage: UserStorageService,
    private toastController: ToastController
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

    deleteUserById(id){
      return this._htpp.patch(`${environment.URL}/api/users/delete-user/${id}`, {})
    }

}
