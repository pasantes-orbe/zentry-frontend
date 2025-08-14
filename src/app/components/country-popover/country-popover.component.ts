import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { CountriesService } from 'src/app/services/countries/countries.service';

@Component({
    selector: 'app-country-popover',
    templateUrl: './country-popover.component.html',
    styleUrls: ['./country-popover.component.scss'],
    standalone: true,
})
export class CountryPopoverComponent implements OnInit {

  @Input() country: any; // Ajusta el tipo de datos según tu estructura
  @Output() customClick: EventEmitter<void> = new EventEmitter<void>();


  constructor(private popoverController: PopoverController, private _countriesService: CountriesService, private alertCtrl: AlertController) { }

  ngOnInit() {}

  async deleteCountry(){

    const alerta = await this.alertCtrl.create({
      header: `¿Estás seguro de borrar ${this.country.name} ?`,
      message: 'El mismo no volverá a estar disponible.',
      buttons:[        
          {
            text: 'Confirmar',
            cssClass: 'red',
            role: 'confirm',
            handler: () => {
              this._countriesService.deleteById(this.country.id).subscribe(res => {
                console.log(res);
                this.popoverController.dismiss()
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


} 
