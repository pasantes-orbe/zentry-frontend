import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { CountriesService } from '../../../services/countries/countries.service';
import { CountryInteface } from '../../../interfaces/country-interface';

@Component({
  selector: 'app-country-dashboard',
  templateUrl: './country-dashboard.page.html',
  styleUrls: ['./country-dashboard.page.scss'],
})
export class CountryDashboardPage implements OnInit{

  type = "propiedades";

  country!: CountryInteface;

  constructor(private _countriesService: CountriesService, private activatedRoute: ActivatedRoute, ) { }

  ngOnInit():void {
 //   this.ionViewWillEnter();
  }

  //ionViewWillEnter(){
    //this.activatedRoute.params
      //.pipe(
     //   switchMap( ({ id }) => this._countriesService.getByID(id) )
    //  )
   //   .subscribe( (country) => this.country = country );
}
   // .subscribe(country => this.country = country)

 //  this._countriesService.getByID(this.id).subscribe(data => console.log(data)); con estatico me retorna bien lo que quiero
  




