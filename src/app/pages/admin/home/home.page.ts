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

  async deleteCountry(country){
    console.log(country);

    const alerta = await this.alertCtrl.create({
      header: `¿Estás seguro de borrar ${country.name} ?`,
      message: 'El mismo no volverá a estar disponible.',
      buttons:[        
          {
            text: 'Confirmar',
            cssClass: 'red',
            role: 'confirm',
            handler: () => {
              this._CountriesService.deleteById(country.id).subscribe(res => {
                console.log(res);
                this.ionViewWillEnter()
                // var getUrl = window.location;
                // var baseUrl = getUrl .protocol + "//" + getUrl.host;
                // window.location.href = `${getUrl .protocol + "//" + getUrl.host}/admin/home`;
              })
            },
          }
          ],
    })

    alerta.present()
  }

  
  async openPopover(id, ev: any) {
    const popover = await this.popoverController.create({
      component: CountryPopoverComponent, // Ajusta el componente del popover
      event: ev,
      translucent: true,
      componentProps: {
        country: id
      }
    });

    return await popover.present();
  }

}
