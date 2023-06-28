import { Component, OnInit } from '@angular/core';
import { CountriesService } from 'src/app/services/countries/countries.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-guards',
  templateUrl: './map-guards.page.html',
  styleUrls: ['./map-guards.page.scss'],
})
export class MapGuardsPage implements OnInit {

  protected countryLat;
  protected countryLng;
  protected tileLayer;
  protected map;

  constructor(private _countryService: CountriesService, private countryStorage: CountryStorageService) { }

  ngOnInit() {
  }

  async ngAfterViewInit(){

    const country = await this.countryStorage.getCountry()
    const countryID = country.id

    this._countryService.getByID(countryID).subscribe(res =>{
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

  public getMap() {
    return this.map;
  }
  public getTileLayer(): any {
    return this.tileLayer;
  }

  public setTileLayer(url: any): void {
    this.tileLayer = L.tileLayer(url,
      {
        attribution: ''
      });
  }

}
