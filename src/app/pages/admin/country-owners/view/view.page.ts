import { Component, OnInit } from '@angular/core';
import { OwnersService } from '../../../../services/owners/owners.service';
import { OwnerResponse } from '../../../../interfaces/ownerResponse-interface';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {
  protected owners : OwnerResponse[];

  constructor(private _ownersService: OwnersService, private modalCtrl: ModalController) { }

  ngOnInit() {
    console.log("ESTO SE EJECUTA");
    this._ownersService.getAllByCountryID().then(data => data.subscribe( owners => 
    {
      this.owners = owners
      console.log(owners)
    }
      ))

  }
  
  ionViewWillEnter(){
    this.ngOnInit()
  }
}
