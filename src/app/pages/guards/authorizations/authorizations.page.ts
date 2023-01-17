import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { io, Socket } from 'socket.io-client'; 
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-authorizations',
  templateUrl: './authorizations.page.html',
  styleUrls: ['./authorizations.page.scss'],
})
export class AuthorizationsPage implements OnInit, AfterViewInit {

  @ViewChild('incomes') incomes;
  private socket: Socket;

  constructor(
    private alertController: AlertController,
    private _socketService: WebSocketService
    ) {
      this.socket = io(environment.URL)

    }

  ngOnInit() {
    this._socketService.escucharNotificacionesAntipanico()

    this.socket.on('notificacion-nuevo-confirmedByOwner', (payload) =>{
        console.log(payload);
        this.incomes.actualizarListaCheckIn()
      
    })

  }

  ngAfterViewInit(): void {    
  }

  ionViewWillEnter(){
    console.log("holamundo")
    this.incomes.ngOnInit();
  }


  
  //async presentAlert(){

    

  //  const alert = await this.alertController.create({
    //  header: 'Alerta Antipánico',
    //  message: 'Chicala, Alejandro <br> Fecha 18/10/2022 <br> Hora 10:23',
   //   backdropDismiss: false,      
   //   buttons: [        
    //    {
     //     text: 'Aceptar',
      //    role: 'confirm',
       //   handler: () => {
        //    console.log("Botón de pánico Aceptado");
         // },
       // }
      //],
     // cssClass: 'antipanicAlert'
   // });

    //await alert.present();
    
  //}

}
