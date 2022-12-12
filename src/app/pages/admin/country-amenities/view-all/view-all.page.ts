import { Component, OnInit } from '@angular/core';
import { AmenitieService } from '../../../../services/amenities/amenitie.service';

@Component({
  selector: 'app-view-all',
  templateUrl: './view-all.page.html',
  styleUrls: ['./view-all.page.scss'],
})
export class ViewAllPage implements OnInit {

  private amenities;

  constructor(private _amenitiesService: AmenitieService) { }

  ngOnInit() {
   this.ionViewWillEnter();
  }

  ionViewWillEnter() {
    this.getCountriesFromDB();
  }

  private getCountriesFromDB() {

    this._amenitiesService.getAll().then(data => data.subscribe(amenities => {this.amenities = amenities
    console.log(amenities)}))

  }

  public getAmenities(): undefined {
    return this.amenities;
  }

  public setCountries(amenities: undefined): void {
    this.amenities = amenities;
  }
}
