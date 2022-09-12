import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-country-map',
  templateUrl: './country-map.component.html',
  styleUrls: ['./country-map.component.scss'],
})
export class CountryMapComponent implements AfterViewInit {

  private map: any;
  private tileLayer: any;





  constructor() {

  }

  ngAfterViewInit(): void {
    this.initMap();

  }

  onMapReady($event) {
    console.log("LISTO");
  }

  public getTileLayer(): any {
    return this.tileLayer;
  }

  public setTileLayer(url: any): void {
    this.tileLayer = L.tileLayer(url,
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  }


  private initMap(): void {

    // let tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    //   {
    //     attribution: false
    //   });

    this.setTileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

    this.map = L.map('map',
      {
        zoomControl: false,
        layers: [this.getTileLayer()],
        maxZoom: 15,
        minZoom: 15
      }
    ).setView([-27.568994, -58.755599], 15);

    this.map.dragging.disable();

    L.marker([-27.568994, -58.755599]).addTo(this.getMap())
    .bindPopup('Ejemplo de guardia');

    setTimeout(() => {
      this.map.invalidateSize(true);
    }, 100);

    // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: false}).addTo(this.map);



    // L.marker([-27.563145, -58.752776]).addTo(this.map).bindPopup("<b>Hello world!</b><br>I am a popup.");


  }

  public getMap() {
    return this.map;
  }

  private setMap(map): void {
    this.map = map;
  }


}
