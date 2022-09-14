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

  constructor() { }

  ngAfterViewInit(): void {
    this.initMap();
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

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if(prefersDark.matches){
      this.setTileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png');
    } else {
      this.setTileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png');
    }


    this.map = L.map('map',
      {
        zoomControl: false,
        layers: [this.getTileLayer()],
        maxZoom: 15,
        minZoom: 15
      }
    ).setView([-27.568994, -58.755599], 15);

    this.getMap().dragging.disable();

    this.addPoint(-27.5622, -58.7488, "Vigilador: <b>Juan Pérez</b> <br> Horario: 22:00hs - 06:00hs");
    this.addPoint(-27.5594, -58.7516, "Vigilador: <b>Carlos Gómez</b> <br> Horario: 06:00hs - 12:00hs");
    this.addPoint(-27.5628, -58.7560, "Vigilador: <b>Alejandro Chicala</b> <br> Horario: 12:00hs - 17:00hs");
    this.addPoint(-27.568994, -58.755599, "<img class='guard-avatar' src='img.png' /> <br> Vigilador: <b>Javier Bernal</b> <br> Horario: 17:00hs - 22:00hs");

    setTimeout(() => {
      this.getMap().invalidateSize(true);
    }, 100);

  }

  public addPoint(lat: number, lng: number, html: string = null): void {
    L.circle([lat, lng], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 15
    })
      .bindPopup(html)
      .addTo(this.getMap());
  }

  public getMap() {
    return this.map;
  }

  private setMap(map): void {
    this.map = map;
  }


}
