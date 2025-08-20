import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, PopoverController } from '@ionic/angular';

// Se importan los componentes de Ionic necesarios
import { IonList, IonItem, IonIcon, IonLabel } from '@ionic/angular/standalone';

// Se importan los íconos
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

// Servicios
import { CountriesService } from 'src/app/services/countries/countries.service';

@Component({
    selector: 'app-country-popover',
    templateUrl: './country-popover.component.html',
    styleUrls: ['./country-popover.component.scss'],
    standalone: true,
    // Se agregan las importaciones que faltaban
    imports: [
        CommonModule,
        IonList,
        IonItem,
        IonIcon,
        IonLabel
    ]
})
export class CountryPopoverComponent implements OnInit {

    @Input() country: any;
    @Output() customClick: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private popoverController: PopoverController,
        private _countriesService: CountriesService,
        private alertCtrl: AlertController
    ) {
        addIcons({ trashOutline }); // Se registra el ícono
    }

    ngOnInit() { }

    async deleteCountry() {
        const alerta = await this.alertCtrl.create({
            header: `¿Estás seguro de borrar ${this.country.name} ?`,
            message: 'El mismo no volverá a estar disponible.',
            buttons: [
                {
                    text: 'Confirmar',
                    cssClass: 'red',
                    role: 'confirm',
                    handler: () => {
                        this._countriesService.deleteById(this.country.id).subscribe(res => {
                            console.log(res);
                            this.popoverController.dismiss({ deleted: true }); // Se envía un dato al cerrar
                        });
                    },
                }
            ],
        });

        alerta.present();
    }
}
// Este componente CountryPopoverComponent se utiliza para mostrar un menú emergente con opciones relacionadas con un barrio privado , como eliminarlo.