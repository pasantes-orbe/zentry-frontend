import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { OwnerStorageService } from '../storage/owner-interface-storage.service';
import { UserStorageService } from '../storage/user-storage.service';
import { WebSocketService } from '../websocket/web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class AntipanicService {

  constructor(
    private _ownerStorage: OwnerStorageService,
    private _userStorage: UserStorageService,
    private _http: HttpClient,
    private _socketService: WebSocketService
  ) { }


  activateAntipanic(ownerID, ownerAddress, countryID){

    
    const formData = new FormData();

    console.log(ownerID, ownerAddress, countryID)
    formData.append('id_owner', ownerID);
    formData.append('address', ownerAddress);
    formData.append('id_country', countryID);



    return this._http.post(`${environment.URL}/api/antipanic`, formData)
     
    

  }

//  async desactivateAntipanic(details: string){
  //  const user = await this._userStorage.getUser();
   // const id = user.id;
   // console.log(details)

  //}


  desactivateAntipanic(id){

    this._http.patch(`${environment.URL}/api/antipanic/${id}`, {}).subscribe(
      res => console.log(res)
    )

  }



  }
