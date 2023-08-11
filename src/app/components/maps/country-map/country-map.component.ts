import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';
import { AntipanicService } from 'src/app/services/antipanic/antipanic.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { io, Socket } from 'socket.io-client'; 
import { environment } from 'src/environments/environment';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { GuardPointInterface } from 'src/app/interfaces/guardsPoints-interface';
import { CountriesService } from 'src/app/services/countries/countries.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

@Component({
  selector: 'app-country-map',
  templateUrl: './country-map.component.html',
  styleUrls: ['./country-map.component.scss'],
})
export class CountryMapComponent implements AfterViewInit {
  private socket: Socket;
  private map: any;
  private tileLayer: any;
  protected antipanicState: boolean = false; 
  protected antipanicID: any;
  protected activeGuards: GuardPointInterface[]
  public countryLat;
  public countryLng;
  public markers = [];
  public id_country;
  public id_user;
  constructor(
    private _antipanicService: AntipanicService,
    private alertController: AlertController,
    private _ownerStorage : OwnerStorageService,
    private _socketService: WebSocketService,
    private _countryService: CountriesService,
  
    private _alerts: AlertService,
  ) { 
    this.socket = io(environment.URL)
  }
   async ngOnInit(){  


    const owner = await this._ownerStorage.getOwner()
    this.id_user = owner.user.id

    this.id_country = owner.property.id_country.toString()
    
    // this.socket.on('get-actives-guards', (payload) =>{
    //   this.removeMarkers()
    //   this.activeGuards = payload
    //   this.activeGuards.forEach((data) => {
    //     if (data.id_country == this.id_country)
    //     this.addPoint(data.lat, data.lng, `Vigilador: <b>${data.user_name} - ${data.user_lastname}</b>`)
    //   })
    // })

    // this.socket.on('guardDisconnected', (payload) =>{
    //   this.removeMarkers()
    // })


  }



  async ngAfterViewInit() {

    const owner = await this._ownerStorage.getOwner()
    const countryID = owner.property.id_country;
     
    this._countryService.getByID(countryID).subscribe(res =>{
      this.countryLat = res['latitude']
      this.countryLng = res['longitude']
      this.initMap(res['latitude'], res['longitude']);

    })

    
    this.socket.on('notificacion-antipanico-finalizado', (payload) =>{
      console.log(payload)
      this.antipanicState = false
      const box = document.querySelector('.box');
      (document.querySelector('.box') as HTMLElement).style.display = '';
      this._alerts.presentAlertFinishAntipanicDetails(payload['antipanic']['details'])
    })  
  }

  public getTileLayer(): any {
    return this.tileLayer;
  }

  ionViewWillEnter() {
    this.socket.emit('owner-connected', (this.id_user))
  }
  public setTileLayer(url: any): void {
    this.tileLayer = L.tileLayer(url,
      {
        attribution: ''
      });
  }


  private initMap(mapLat, mapLng): void {

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if(prefersDark.matches){
      // this.setTileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png');
      this.setTileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
    } else {
      // this.setTileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png');
      this.setTileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
    }


    this.map = L.map('map',
      {
        zoomControl: true,
        layers: [this.getTileLayer()],
      }
    ).setView([mapLat, mapLng], 15);

 
    setTimeout(() => {
      this.getMap().invalidateSize(true);
    }, 100);

  }

  // public addPoint(lat: number, lng: number, html: string = null): void {
  //   const marker = L.circle([lat, lng], {
  //     color: 'red',
  //     fillColor: '#f03',
  //     fillOpacity: 0.5,
  //     radius: 15
  //   })
  //     .bindPopup(html, {closeButton: false})
  //     .addTo(this.getMap());


  //     this.markers.push(marker);

  // }

  public removeMarker(marker){
    this.map.removeLayer(marker);
  }

  public removeMarkers(){
    this.getMarkers().forEach( marker => {
      this.removeMarker(marker);
    })
  }

  public getMarkers(){
    return this.markers;
  }

  public getMap() {
    return this.map;
  }

  private setMap(map): void {
    this.map = map;
  }

  async activateAntipanic(){
    const box = document.querySelector('.box');
    (document.querySelector('.box') as HTMLElement).style.display = 'block';
    this.ionViewWillEnter()

    this.antipanicState = true;

    const owner = await this._ownerStorage.getOwner()
    const ownerID = owner.user.id;
    const ownerAddress = owner.property.address;
    const ownerName = owner.user.name;
    const ownerLastName = owner.user.lastname;
    const countryID =  owner.property.id_country;
    const propertyNumber = owner.property.number
    this._antipanicService.activateAntipanic(ownerID, ownerAddress, countryID, propertyNumber).subscribe(
      res => {
        console.log(res)
        this.antipanicID = res['antipanic']['id']
        this._socketService.notificarAntipanico({
          res,
          ownerName,
          ownerLastName
        })
      }
    )

  }

  async desactivateAntipanic(){
     this.presentAlert()
  }



  public async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Cancelar Antipanico',
      message: '¿Está seguro de cancelar la situación antipánico?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Autorizar',
          role: 'confirm',
          handler: () => {
            this.antipanicState = false
            const box = document.querySelector('.box');
            (document.querySelector('.box') as HTMLElement).style.display = '';
                
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.antipanicState = true
          },
        }
      ],
    });

    await alert.present();
  }

  
}



