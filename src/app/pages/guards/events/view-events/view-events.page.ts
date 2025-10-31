//view-events.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
//Componenetes
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';
import { InvitationsComponent } from 'src/app/components/invitations/invitations/invitations.component';
//Interfaces y Servicios
import { AmenitieInterface } from 'src/app/interfaces/amenitie-interface';
import { ReservationsInterface } from 'src/app/interfaces/reservations-interface';
import { ReservationsService } from 'src/app/services/amenities/reservations.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.page.html',
  styleUrls: ['./view-events.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NavbarBackComponent
  ]
})

export class ViewEventsPage implements OnInit {
  protected reservations: any[] = [];
  constructor(
    private modalCtrl: ModalController,
    private reservationService: ReservationsService,
    private _countryStorage: CountryStorageService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    const id_country = await (await this._countryStorage.getCountry()).id;
    this.reservationService.getAllByCountryAndStatus(id_country, "aprobado").subscribe(
      reservations => {
        this.reservations = reservations;
        
        // Deep-link: si viene openReservationId en query params, abrir el modal
        const qpId = this.route.snapshot.queryParamMap.get('openReservationId');
        const targetId = qpId ? Number(qpId) : null;
        if (targetId && Array.isArray(this.reservations)) {
          const idx = this.reservations.findIndex(r => Number(r.id) === targetId);
          if (idx >= 0) {
            this.openModal(this.reservations[idx], idx);
          }
        }
      }
    );
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
