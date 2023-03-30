import { Component, OnInit } from '@angular/core';
import { PropertiesService } from '../../../../services/properties/properties.service';
import { PropertyInterface } from '../../../../interfaces/property-interface';
import { Property_OwnerInterface } from 'src/app/interfaces/property_owner-interface';
import { PropertyPage } from 'src/app/modals/properties/property/property.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {

  protected properties: Property_OwnerInterface[]
  protected propertyName: string;
  protected propertyObservable: any
  searchKey: string;

  constructor(private _propertiesService: PropertiesService, private modalCtrl: ModalController) { }

  ngOnInit() {
    this._propertiesService.getAllProperty_OwnerByCountryID().then(data => data.subscribe((property) => {
      this.properties = property;
      console.log(property)
    }))
  }


  async editProperty(id:any) {

    console.log(id);
  
    const modal = await this.modalCtrl.create({
      component:  PropertyPage,
      componentProps: {
        property_id: id
      }
    });
  
    modal.present();
  
    const { data, role } = await modal.onWillDismiss();
  
  }



  ionViewWillEnter(){
    this.ngOnInit()
  }


  editAmenitie(){

  }

}
