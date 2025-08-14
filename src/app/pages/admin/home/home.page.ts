import { Component, OnInit } from '@angular/core';
import { CountriesService } from 'src/app/services/countries/countries.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { CountryInteface } from '../../../interfaces/country-interface';
import { AlertController, PopoverController } from '@ionic/angular';
import { CountryPopoverComponent } from 'src/app/components/country-popover/country-popover.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    standalone: true,
})
export class HomePage implements OnInit {

  protected countries;



  constructor(private _CountriesService: CountriesService, private _countryStorage: CountryStorageService, private alertCtrl: AlertController, private popoverController: PopoverController) { }

  ngOnInit() {


  }

  ionViewWillEnter() {
    this.getCountriesFromDB();
  }

  private getCountriesFromDB() {

    this._CountriesService.getAll().subscribe(
      data => {
        this.countries = data
        const countriesPrueba = this.countries.filter(country => country.isActive !== false)
        console.log(countriesPrueba);
        this.countries = countriesPrueba
      }
    )

  }

  saveCountryLocalStorage(country: CountryInteface){
    this._countryStorage.saveCountry(country);
  }

  handleCustomClick() {
    this.ionViewWillEnter();
    console.log("se actualiza");
  }

  

  
  async openPopover(country, ev: any) {
    const popover = await this.popoverController.create({
      component: CountryPopoverComponent, // Ajusta el componente del popover
      event: ev,
      translucent: true,
      componentProps: {
        country: country
      }
    });

    popover.onDidDismiss().then(() => {
      this.ionViewWillEnter();
    });
    
    return await popover.present();
  }


  
}
