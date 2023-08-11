import { Component, OnInit } from '@angular/core';
import { AntipanicService } from 'src/app/services/antipanic/antipanic.service';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

@Component({
  selector: 'app-antipanic-historial',
  templateUrl: './antipanic-historial.page.html',
  styleUrls: ['./antipanic-historial.page.scss'],
})
export class AntipanicHistorialPage implements OnInit {

  protected antipanics: any[]

  constructor(
    private _antipanicService: AntipanicService,
    private _countryStorage: CountryStorageService,
    private _alertService: AlertService
  ) { }

  async ngOnInit() {
    const country = await this._countryStorage.getCountry()
    const id_country = country.id
    this._antipanicService.getAllAntipanicByCountry(id_country).subscribe(
      antipanics => {
        this.antipanics = antipanics
        console.log(this.antipanics);
        
        this.antipanics.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        
        console.log(this.antipanics);

      } 
    )
  }

  showDetails(details){
    console.log(details);
    if(details == null || details == '' || details == ' ') {
      this._alertService.showAlert("Oops!", `Este evento antipanico no cuenta con detalles`);
    } else {
      this._alertService.showAlert("Detalles", `${details}`);
    }

  }

}
