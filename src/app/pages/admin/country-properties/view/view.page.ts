import { Component, OnInit } from '@angular/core';
import { PropertiesService } from '../../../../services/properties/properties.service';
import { PropertyInterface } from '../../../../interfaces/property-interface';
import { Property_OwnerInterface } from 'src/app/interfaces/property_owner-interface';

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

  constructor(private _propertiesService: PropertiesService) { }

  ngOnInit() {
    this._propertiesService.getAllProperty_OwnerByCountryID().then(data => data.subscribe((property) => {
      this.properties = property;
      console.log(property)
    }))
  }

  ionViewWillEnter(){
    this.ngOnInit()
  }


}
