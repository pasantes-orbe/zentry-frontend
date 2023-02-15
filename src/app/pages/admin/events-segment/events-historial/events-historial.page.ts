import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { InvitationsComponent } from 'src/app/components/invitations/invitations/invitations.component';
import { ReservationsInterface } from 'src/app/interfaces/reservations-interface';
import { ReservationsService } from 'src/app/services/amenities/reservations.service';

@Component({
  selector: 'app-events-historial',
  templateUrl: './events-historial.page.html',
  styleUrls: ['./events-historial.page.scss'],
})
export class EventsHistorialPage implements OnInit {

  reservations: ReservationsInterface[]
  protected loading: boolean
  constructor(private modalCtrl: ModalController,private reservationService: ReservationsService ,private _reservationsService: ReservationsService, private loadingCtrl: LoadingController, private toastController: ToastController ) { }

  ngOnInit() {
    this._reservationsService.getAllByCountry().then(data => data.subscribe(reservations => this.reservations = reservations))
  }

  ionViewWillEnter(){
    this.ngOnInit()
  }
  public async resolverPeticion(status: boolean, reservationID: number){
    const loading = await this.loadingCtrl.create({
      message: 'Cambiando estado de la reserva',
    });
    const toast = await this.toastController.create({
      message: 'El Estado de la reserva se ha cambiado exitosamente!',
      duration: 3000
    })
    loading.present();
      this._reservationsService.updateStatus(status, reservationID,).subscribe((res) => {console.log(res)
      this._reservationsService.getAllByCountry().then(data => data.subscribe(reservations => this.reservations = reservations))
    })
    
    loading.dismiss()
    toast.present()
  }

  public isLoading(){
    return true
  }

  public stopLoading(){
    return false
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
