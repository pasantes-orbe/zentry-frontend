import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private alertController: AlertController
    ) { }

  public async presentAlert(){
    const alert = await this.alertController.create({
      header: 'Solicitud de Ingreso',
      message: 'Chicala, Alejandro <br> Ingreso 22/08/2019 Hora 10:23 <br> Salida 22/08/2019 Hora 18:00',
      backdropDismiss: false,
      buttons: [        
        {
          text: 'Autorizar',
          role: 'confirm',
          handler: () => {
            console.log("Autorizhed");
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log("Cancelled");
          },
        }
      ],
    });

    await alert.present();
  }

}
