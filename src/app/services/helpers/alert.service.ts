import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';
import moment from 'moment';
import { UserStorageService } from '../storage/user-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private socket: Socket;
  private loading: HTMLIonLoadingElement;
  private datePipeString: string;

  constructor(
    private alertController: AlertController,
    private _loadingCtrl: LoadingController,
    private _http: HttpClient,
    private _userStorage: UserStorageService,
    ) { 
      this.socket = io(environment.URL)
    }

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

  // Método para mostrar un alert genérico
  public async showAlert(header: string = "", message: string = "", buttons: any[] = []){
    const alert = await this.alertController.create({
      header: header,
      message: message, 
      backdropDismiss: true,
      buttons: buttons.length > 0 ? buttons : [{ text: 'Ok' }]
    });
    await alert.present();
  }

  // Método para mostrar la alerta de ingreso, con validación de fecha
  async presentAlert(e: any){
    // Verifica si e.income_date existe antes de intentar formatearlo
    this.datePipeString = e.income_date ? formatDate(e.income_date, 'short', 'es-Ar') : 'Fecha no disponible';
    
    const alert = await this.alertController.create({
      header: 'Solicitud de Ingreso',
      message: `${e.guest_name} <br> ${e.guest_lastname} <br> ${this.datePipeString} <br>`,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Ok'
        },
      ],
    });
    await alert.present();
  }

  async presentAlertPanic(e: any){
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
            this.presentAlertFinishAntipanic(e)
          },
        },
      ],
    });
    await alert.present();
    return alert;
  }

  async presentAlertFinishAntipanic(e: any){
    const alert = await this.alertController.create({
      header: 'Antipánico detalles',
      backdropDismiss: false,
      inputs: [
        {
          name: 'details',
          placeholder: 'detalles'
        },
      ],
      buttons: [
        {
          text: 'Detalles de la situación',
          handler: async (data: any) => {
            const {details} = data;
            const now = new Date();
            const finishAt = moment(now).format("YYYY-MM-DDThh:mm:ss-03:00");
            const guard = await this._userStorage.getUser()
            const guardId = guard.id
            this._http.put(`${environment.URL}/api/antipanic/${e.id}`, {
              details,
              finishAt,
              guardId
            }).subscribe(
              res => {
                this.socket.emit('notificar-antipanico-finalizado', res)
              }
            )
          }
        }
      ]
    });
    await alert.present();
  }

  async presentAlertFinishAntipanicDetails(details: any){
    const alert = await this.alertController.create({
      header: 'Antipánico finalizado',
      message: `Los detalles por los que fue finalizada la alarma: <b>${details}</b> `,
      buttons: [
        {
          text: 'Ok',
        }
      ]
    });
    await alert.present();
  }
}