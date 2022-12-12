import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { CountriesService } from '../../../services/countries/countries.service';
import { CountryInteface } from '../../../interfaces/country-interface';
import { CountryStorageService } from '../../../services/storage/country-storage.service';
import { NavbarAdminComponent } from 'src/app/components/navbars/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-country-dashboard',
  templateUrl: './country-dashboard.page.html',
  styleUrls: ['./country-dashboard.page.scss'],
})
export class CountryDashboardPage implements OnInit{

  @ViewChild(NavbarAdminComponent) navbar: NavbarAdminComponent;

  type = "propiedades";

  public country

  constructor(private _countriesService: CountriesService, private activatedRoute: ActivatedRoute, private _countryStorageService: CountryStorageService ) { }

  ngOnInit():void {
 //   this.ionViewWillEnter()
  }

  async ionViewWillEnter(){
    await this.navbar.ngOnInit();
  }
  

  //public async getCountryFromStorage(){
   // const countryPromise = await this._countryStorageService.getCountry();df
  //}







}






 // ionViewWillEnter(){
  //  this.activatedRoute.params
   //   .pipe(
    //    switchMap( ({ id }) => this._countriesService.getByID(id) )
     // )
     // .subscribe( (country) => {console.log(this.country)});
//}

 
























//  this._countriesService.getByID(this.id).subscribe(data => console.log(data) en estatico buien me funciona




