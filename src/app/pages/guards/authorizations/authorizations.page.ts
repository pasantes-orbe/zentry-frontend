import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { io, Socket } from 'socket.io-client'; 
import { environment } from 'src/environments/environment';
import { Geolocation } from '@capacitor/geolocation';
import { GeolocationPlugin } from '@capacitor/geolocation/dist/esm/definitions';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-authorizations',
  templateUrl: './authorizations.page.html',
  styleUrls: ['./authorizations.page.scss'],
})
export class AuthorizationsPage implements OnInit, AfterViewInit {

  @ViewChild('incomes') incomes;
  private socket: Socket;

  public lat;
  public lng;

  constructor(
    private alertController: AlertController,
    private _socketService: WebSocketService,
    ) {
      this.socket = io(environment.URL)


        

    }

  async ngOnInit() {
    this._socketService.escucharNotificacionesAntipanico()

    this.socket.on('notificacion-nuevo-confirmedByOwner', (payload) =>{
        console.log(payload);
        this.incomes.actualizarListaCheckIn()
      
    })
    navigator.geolocation.getCurrentPosition(resp => {

      const { latitude, longitude } = resp.coords;
      console.log(latitude, longitude);

      this.lat = latitude;
      this.lng = longitude;
      
      },
      err => {
      });
      
    setInterval( (asd) => {
      navigator.geolocation.getCurrentPosition(resp => {

        const { latitude, longitude } = resp.coords;
        console.log(latitude, longitude);

        this.lat = latitude;
        this.lng = longitude;
        
        },
        err => {
        });
    }, 1000 )

    

  }

  ngAfterViewInit(): void {    
  }

  ionViewWillEnter(){
    

  }






getPosition(): Promise<any>
  {
    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(resp => {
        console.log("asjkldjklasjd");
          resolve({lng: resp.coords.longitude, lat: resp.coords.latitude});
        },
        err => {
          reject(err);
        });
    });

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
