import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

// Interfaces
import { CheckInInterfaceResponse } from 'src/app/interfaces/checkIn-interface';
import { CheckInOrOut } from '../../interfaces/checkInOrOut-interface';

// Servicios
import { CheckInService } from 'src/app/services/check-in/check-in.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

@Component({
    selector: 'app-incomes-guards',
    templateUrl: './incomes-guards.component.html',
    styleUrls: ['./incomes-guards.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ]
})
export class IncomesGuardsComponent implements OnInit {

    protected checkIn: CheckInOrOut[] = [];
    protected id_country: any;

    constructor(
        private _checkInService: CheckInService, 
        private _countryStorage: CountryStorageService, 
        protected alertController: AlertController, 
        protected _socketService: WebSocketService
    ) { }

    async ngOnInit() {
        const country = await this._countryStorage.getCountry();
        this.id_country = country.id;
        this._checkInService.getAllCheckInConfirmedByOwner(this.id_country).subscribe(res => {
            console.log(res);
            this.checkIn = res;
        });
    }

    ionViewWillEnter() {
        this.ngOnInit();
    }

    public async checkInSelected(e: any, index: number) {
        console.log(index);
        const alert = await this.alertController.create({
            header: 'Confirmar Check In',
            message: `Persona: ${e.guest_name}<br>DNI: ${e.DNI}`,
            buttons: [
                {
                    text: 'Check In',
                    handler: () => {
                        this._checkInService.updateCheckInTrue(e.id);
                        this.checkIn.splice(index, 1);
                    }
                }, 
                'Cancelar'
            ],
        });

        await alert.present();
    }

    actualizarListaCheckIn() {
        setTimeout(() => {
            this._checkInService.getAllCheckInConfirmedByOwner(this.id_country).subscribe(
                res => {
                    console.log(res);
                    this.checkIn = res;
                }
            );
        }, 1000);
    }
}