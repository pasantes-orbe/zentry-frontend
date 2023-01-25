import { Component, OnInit } from '@angular/core';
import { AntipanicService } from 'src/app/services/antipanic/antipanic.service';
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
    private _countryStorage: CountryStorageService
  ) { }

  async ngOnInit() {
    const country = await this._countryStorage.getCountry()
    const id_country = country.id
    this._antipanicService.getAllAntipanicByCountry(id_country).subscribe(
      antipanics => this.antipanics = antipanics
    )
  }

}
