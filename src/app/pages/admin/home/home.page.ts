import { Component, OnInit } from '@angular/core';
import { CountriesService } from 'src/app/services/countries/countries.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  private countries;



  constructor(private _CountriesService: CountriesService, private _countryStorage: CountryStorageService) { }

  ngOnInit() {

    this.ionViewWillEnter();

  }

  ionViewWillEnter() {
    this.getCountriesFromDB();
  }

  private getCountriesFromDB() {

    this._CountriesService.getAll().subscribe(
      data => {
        this.countries = data;
      }
    )

  }

  public getCountries(): undefined {
    return this.countries;
  }

  public setCountries(countries: undefined): void {
    this.countries = countries;
  }

  saveIdLocalStorage(id){
    this._countryStorage.saveCountryID(id);
  }

}
