import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-authorizations',
  templateUrl: './authorizations.page.html',
  styleUrls: ['./authorizations.page.scss'],
})
export class AuthorizationsPage implements OnInit, AfterViewInit {

  constructor(
    private alertController: AlertController
    ) {}

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    this.presentAlert();
    
  }

  async presentAlert(){

    

    const alert = await this.alertController.create({
      header: 'Alerta Antipánico',
      message: 'Chicala, Alejandro <br> Fecha 18/10/2022 <br> Hora 10:23',
      backdropDismiss: false,      
      buttons: [        
        {
          text: 'Aceptar',
          role: 'confirm',
          handler: () => {
            console.log("Botón de pánico Aceptado");
          },
        }
      ],
      cssClass: 'antipanicAlert'
    });

    await alert.present();
    
  }

}
