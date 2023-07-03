import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { io, Socket } from 'socket.io-client'; 
import { environment } from 'src/environments/environment';
import { Geolocation } from '@capacitor/geolocation';
import { GeolocationPlugin } from '@capacitor/geolocation/dist/esm/definitions';
import { Observable } from 'rxjs/internal/Observable';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { GuardsService } from 'src/app/services/guards/guards.service';
import { IntervalStorageService } from 'src/app/services/storage/interval-storage.service';
import { NavbarGuardsComponent } from 'src/app/components/navbars/navbar-guards/navbar-guards.component';

@Component({
  selector: 'app-authorizations',
  templateUrl: './authorizations.page.html',
  styleUrls: ['./authorizations.page.scss'],
})
export class AuthorizationsPage implements OnInit{

  @ViewChild('incomes') incomes;
  private socket: Socket;

  public lat;
  public lng;
  private userID;
  private user_name;
  private user_lastname;
  private countryID;
  public myTimer;
  public recurrentsState : boolean = false;

  constructor(
    private alertController: AlertController,
    private _socketService: WebSocketService,
    private _userStorage: UserStorageService,
    private _countryStorageService: CountryStorageService,
    private _intervalStorageService: IntervalStorageService,
    private _guardsService: GuardsService

    ) {
      this.socket = io(environment.URL)
    }

  async ngOnInit() {

    
    const user = await this._userStorage.getUser()
    const country = await this._countryStorageService.getCountry()
    this.countryID = country.id;
    this.userID = user.id;
    this.user_name = user.name;
    this.user_lastname = user.lastname;
    


    this._socketService.escucharNotificacionesAntipanico()

    this.socket.on('notificacion-nuevo-confirmedByOwner', async(payload) =>{
        console.log("ESTE ES EL PAYLOAD",payload);
        this.incomes.actualizarListaCheckIn()
    })
   
    navigator.geolocation.getCurrentPosition(resp => {

      const { latitude, longitude } = resp.coords;
      console.log(latitude, longitude);

      this.lat = latitude;
      this.lng = longitude;

      const payload ={
        lat: this.lat,
        lng: this.lng,
        id_user: this.userID,
        id_country: this.countryID,
        user_name: this.user_name,
        user_lastname: this.user_lastname

      }

      this.socket.emit('nueva-posicion-guardia', payload);

      },
      err => {
        console.log(err)
      });
      
      this.myTimer = window.setInterval( () => {
      navigator.geolocation.getCurrentPosition(async resp => {
        const { latitude, longitude } = resp.coords;
        
        this.lat = latitude;
        this.lng = longitude;
        const payload ={
          lat: this.lat,
          lng: this.lng,
          id_user: this.userID,
          id_country: this.countryID,
          user_name: this.user_name,
          user_lastname: this.user_lastname
        }
        this.socket.emit('nueva-posicion-guardia', payload);

        },
        err => {
          console.log(err);
        });
    }, 3000 )

    // setTimeout(() => {
    //   clearInterval(this.myTimer);
    // }, 8000);


    console.log("DESPUES DE INTERVALo");

    console.log(this._intervalStorageService.saveInterval_id( String(this.myTimer) )); 
    console.log(this.myTimer);
  }

  // async ionViewWillEnter() {
  //   await this.ngOnInit();
  // }


  viewRecurrents(){
    this.recurrentsState = !this.recurrentsState
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
