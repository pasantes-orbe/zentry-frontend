import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { InvitationsComponent } from 'src/app/components/invitations/invitations/invitations.component';
import { AmenitieInterface } from 'src/app/interfaces/amenitie-interface';
import { ReservationsInterface } from 'src/app/interfaces/reservations-interface';
import { ReservationsService } from 'src/app/services/amenities/reservations.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.page.html',
  styleUrls: ['./view-events.page.scss'],
})

export class ViewEventsPage implements OnInit {

  protected reservations: any[]

  constructor(private modalCtrl: ModalController,
              private reservationService: ReservationsService,
              private _countryStorage: CountryStorageService) { }

  async ngOnInit() {

    const id_country = await (await this._countryStorage.getCountry()).id

    this.reservationService.getAllByCountryAndStatus(id_country, "aprobado").subscribe(
      reservations => {
        this.reservations = reservations
      }
    )

  }

  

  async openModal(reservation, index) {
    console.log(reservation, index);
    const id_reservation = reservation.id

    this.reservationService.reservationGuests(id_reservation).subscribe(
      async guests => {

        console.log(guests);

        const modal = await this.modalCtrl.create({
          component: InvitationsComponent,
          mode: 'ios',
          componentProps: {
            guests: guests,
          }
        });
        modal.present();
    
        const { data, role } = await modal.onWillDismiss();

      } 
    )
    
  }

  



}
