import { Component, OnInit } from '@angular/core';
import { CountriesService } from 'src/app/services/countries/countries.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import * as L from 'leaflet';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { GuardPointInterface } from 'src/app/interfaces/guardsPoints-interface';

@Component({
  selector: 'app-map-guards',
  templateUrl: './map-guards.page.html',
  styleUrls: ['./map-guards.page.scss'],
})
export class MapGuardsPage implements OnInit {

  protected socket: Socket;
  protected countryLat;
  protected countryLng;
  protected tileLayer;
  protected map;
  public markers = [];
  protected activeGuards: GuardPointInterface[]
  protected id_country



  constructor(private _countryService: CountriesService, private countryStorage: CountryStorageService) { 
    this.socket = io(environment.URL)
  }
  

  async ngOnInit() {

    const country = await this.countryStorage.getCountry()
    const countryID = country.id
    console.log(countryID);

    this.id_country = countryID

    console.log(this.id_country);
      this.socket.on('get-actives-guards', (payload) =>{
        this.removeMarkers()
        this.activeGuards = payload
        this.activeGuards.forEach((data) => {
          if (data.id_country == this.id_country)
          this.addPoint(data.lat, data.lng, `Vigilador: <b>${data.user_name} - ${data.user_lastname}</b>`)
        })
      })

      this.socket.on('guardDisconnected', (payload) =>{
        this.removeMarkers()
      })

  }

  async ngAfterViewInit(){

    const country = await this.countryStorage.getCountry()
    const countryID = country.id

    this._countryService.getByID(countryID).subscribe(res =>{
      console.log(res);
      this.countryLat = res['latitude']
      this.countryLng = res['longitude']
      this.initMap(res['latitude'], res['longitude']);

    })
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

  public addPoint(lat: number, lng: number, html: string = null): void {
    const marker = L.circle([lat, lng], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 15
    })
      .bindPopup(html, {closeButton: false})
      .addTo(this.getMap());


      this.markers.push(marker);

  }

  public getMap() {
    return this.map;
  }
  public getTileLayer(): any {
    return this.tileLayer;
  }

  public removeMarkers(){
    this.getMarkers().forEach( marker => {
      this.removeMarker(marker);
    })
  }

  public removeMarker(marker){
    this.map.removeLayer(marker);
  }


  public getMarkers(){
    return this.markers;
  }
  public setTileLayer(url: any): void {
    this.tileLayer = L.tileLayer(url,
      {
        attribution: ''
      });
  }

}
