import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private loading;

  constructor(
    private alertController: AlertController,
    private _loadingCtrl: LoadingController
  ) { }


  public async setLoading(msg: string = "Aguarde un momento...") {
    this.loading = await this._loadingCtrl.create({
      message: msg,
      spinner: "crescent"
    });

    this.loading.present();
  }

  public removeLoading() {

    this.loading.dismiss();
  }

  public async showAlert(header: string = "", message: string = "", buttons: [] = []){

    const alert = await this.alertController.create({
      header,
      message,
      backdropDismiss: true
    });

    await alert.present();


  }


  public async presentAlert() {
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
