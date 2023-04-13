import { Component, OnInit } from '@angular/core';
import { OwnersService } from '../../../../services/owners/owners.service';
import { OwnerResponse } from '../../../../interfaces/ownerResponse-interface';
import { ModalController } from '@ionic/angular';
import { EditPage } from 'src/app/modals/owners/edit/edit.page';

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

  async editUser(id_owner, index){

    console.log(id_owner, index);

    const modal = await this.modalCtrl.create({
      component:  EditPage,
      componentProps: {
        id_owner: id_owner
      }
    });
  
    modal.present();
  
    const { data, role } = await modal.onWillDismiss();


  }

}
