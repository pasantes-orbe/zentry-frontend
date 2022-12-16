import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
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
  constructor(private _reservationsService: ReservationsService, private loadingCtrl: LoadingController, private toastController: ToastController ) { }

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
}
