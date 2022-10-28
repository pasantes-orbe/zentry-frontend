import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-event-reservation',
  templateUrl: './event-reservation.page.html',
  styleUrls: ['./event-reservation.page.scss'],
})
export class EventReservationPage implements OnInit {

  constructor(private alertController: AlertController) { }

  ngOnInit() {
  }

  async reservation(){

    const alert = await this.alertController.create({
      header: 'Solicitud Enviada',
      message: 'El estado de reserva permanecerá como "Pendiente" hasta que el administrador confirme la disponibilidad.',
      buttons: ['OK'],
    });

    await alert.present();

  }

}
