import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { CheckInService } from '../check-in/check-in.service';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private loading;
  private datePipeString: string;

  constructor(
    private alertController: AlertController,
    private _loadingCtrl: LoadingController,
      ) { }


  public async setLoading(msg: string = "Aguarde un momento...") {
    this.loading = await this._loadingCtrl.create({
      message: msg,
      spinner: "crescent"
    });

    await this.loading.present();
  }

  public async removeLoading() {
    await this.loading.dismiss();
  }

  public async showAlert(header: string = "", message: string = "", buttons: [] = []){

    const alert = await this.alertController.create({
      header,
      message, 
      backdropDismiss: true
    });

    await alert.present();


  }


  async presentAlert(e){
    this.datePipeString = formatDate(e.income_date, 'short', 'es-Ar');
    const alert = await this.alertController.create({
      header: 'Solicitud de Ingreso',
      message: `${e.guest_name} <br> ${e.guest_lastname} <br> ${this.datePipeString} <br>`,
      backdropDismiss: false,
      buttons: [        
        {
          text: 'Autorizar',
          role: 'confirm',
          handler: () => {
            console.log("Autorizado");
            
            // actualizar check-in - TIENE CIRCULAR DEPENDENCY
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


  async presentAlertPanic(e){
    const alert = await this.alertController.create({
      header: 'Alerta Antipánico activada',
      message: `El Propietario ${e.ownerName} - ${e.ownerLastName } <br>
       Activo la alarma de la dirección ${e.address} <br>`,
      backdropDismiss: false,
   
      buttons: [        
        {
          text: 'Alerta Notificada',
          role: 'confirm',
          handler: () => {
            this.presentAlertFinishAntipanic()
          },
        },
      ],
    });

    await alert.present();
    
  }


  async presentAlertFinishAntipanic(){
    const alert = await this.alertController.create({
      header: 'Antipánico detalles',
      inputs: [
        {
          name: 'details',
          placeholder: 'detalles'
        },
       
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Detalles de la situación',
          handler: data => {
            
          }
        }
      ]
    });

    await alert.present();

  }


    
}


