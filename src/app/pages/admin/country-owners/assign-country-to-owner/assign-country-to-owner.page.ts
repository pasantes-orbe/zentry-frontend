import { Component, OnInit } from '@angular/core';
import { OwnerStorageService } from '../../../../services/storage/owner-created-storage.service';

@Component({
  selector: 'app-assign-country-to-owner',
  templateUrl: './assign-country-to-owner.page.html',
  styleUrls: ['./assign-country-to-owner.page.scss'],
})

export class AssignCountryToOwnerPage implements OnInit {

  private userID; 


  constructor(private _ownerStorage: OwnerStorageService) { }

  ngOnInit() {
    this.obtenerToken();
  }

  async obtenerToken(){
    this.userID =  await this._ownerStorage.getCountryID();
  }
  
  mostrarUserID(){
    console.log(this.userID);
  }
}
