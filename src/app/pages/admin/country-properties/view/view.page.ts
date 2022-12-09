import { Component, OnInit } from '@angular/core';
import { PropertiesService } from '../../../../services/properties/properties.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {

  private properties
  searchKey: string;

  constructor(private _propertiesService: PropertiesService) { }

  ngOnInit() {

    this.ionViewWillEnter();

  }

  ionViewWillEnter() {
    this.getPropertiesFromDB();
  }

  private getPropertiesFromDB() {

    this._propertiesService.getAll().subscribe(
      data => {
        this.properties = data;
      }
    )

  }

  public getProperties(): undefined {
    return this.properties;
  }

  public setProperties(properties: undefined): void {
    this.properties = properties;
  }

}
