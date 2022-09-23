import { Component } from '@angular/core';
import { AlertController, MenuController } from '@ionic/angular';
import swal from'sweetalert2';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  private loading: boolean;




  constructor(
    private menu: MenuController,
    private alertController: AlertController,
    ) { 
    this.setLoading(true);
    this.getData();

    
    this.presentAlert();

  }

  async presentAlert(){
    const alert = await this.alertController.create({
      header: 'Solicitud de Ingreso',
      message: 'Chicala, Alejandro <br> Ingreso 22/08/2019 Hora 10:23 <br> Salida 22/08/2019 Hora 18:00',
      backdropDismiss: false,
      buttons: [        
        {
          text: 'Autorizar',
          role: 'confirm',
          handler: () => {
            console.log("Autorizado");
            this.presentAlert2();
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log("Cancelled");
            this.presentAlert2();
          },
        }
      ],
    });

    await alert.present();
    
  }

  async presentAlert2(){
    const alert = await this.alertController.create({
      header: 'Reservas',
      message: 'Estado: Confirmado <br> Evento: "Casamiento Juan" <br> Fecha 22/08/2019 Hora 18:00',
      backdropDismiss: false,
      buttons: [        
        {
          text: 'Ok',
          role: 'confirm',
        }
      ],
    });

    await alert.present();
  }

  protected doRefresh(event){
    console.log(event);
  }

  private getData(){
    setTimeout(() => {
      this.setLoading(false);
    }, 3000);
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public setLoading(loading: boolean): void {
    this.loading = loading;
  }
}
