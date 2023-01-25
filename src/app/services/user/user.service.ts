import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { environment } from 'src/environments/environment';
import { UserStorageService } from '../storage/user-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private _htpp :HttpClient,
    private _userStorage: UserStorageService
  ) { }

    getUserByID(id){

      return this._htpp.get<any>(`${environment.URL}/api/users/${id}`)

    }

    updateUser(id, name, lastname, birthday, email, phone){
      console.log(birthday, name, lastname, email, phone );
      return this._htpp.patch<UserInterface>(`${environment.URL}/api/users/update-user/${id}`, {
        name,
        birthday,
        lastname, 
        email, 
        phone
      }).subscribe(res => 
        {
          this._userStorage.saveUser(res['user'])
        } )
    }

}
