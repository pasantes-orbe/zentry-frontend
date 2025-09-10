import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import * as L from 'leaflet';

// Componentes
import { NavbarBackComponent } from '../../../components/navbars/navbar-back/navbar-back.component';

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-map-guards',
  templateUrl: './map-guards.page.html',
  styleUrls: ['./map-guards.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NavbarBackComponent,
  ]
})
export class MapGuardsPage implements AfterViewInit, OnDestroy {

  private map: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null; 
  private markers: L.CircleMarker[] = [];

  constructor() {}

  ngAfterViewInit() {
    const latitudLaRivera = -27.4302;
    const longitudLaRivera = -58.9643;
    
    setTimeout(() => {
        this.initMap(latitudLaRivera, longitudLaRivera);
        this._simularGuardiasLaRivera();
    }, 50); 
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
  
  private _simularGuardiasLaRivera(): void {
    const guardiasFalsos = [
      { lat: -27.429969, lng: -58.963919, user_name: 'Guardia', user_lastname: 'Entrada' },
      { lat: -27.427316, lng: -58.964532, user_name: 'Guardia', user_lastname: 'Centro' },
      { lat: -27.423088, lng: -58.965417, user_name: 'Guardia', user_lastname: 'Fondo' }
    ];

    this.removeMarkers();
    guardiasFalsos.forEach(guardia => {
      const popupHtml = `Vigilador: <b>${guardia.user_name} ${guardia.user_lastname}</b>`;
      this.addPoint(guardia.lat, guardia.lng, popupHtml);
    });
  }

  private initMap(mapLat: number, mapLng: number): void {
    if (this.map) {
      this.map.setView([mapLat, mapLng]);
      return;
    }

    const southWest = L.latLng(-27.430294, -58.963896);
    const northEast = L.latLng(-27.421497, -58.966106);
    const bounds = L.latLngBounds(southWest, northEast);

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches) {
      this.setTileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png');
    } else {
      this.setTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    }

    this.map = L.map('adminMap', {
      zoomControl: true,
      layers: [this.getTileLayer()!],
      maxBounds: bounds,
      maxBoundsViscosity: 1.0 
    }).setView([mapLat, mapLng], 15);

    this.map.setMinZoom(17);

    setTimeout(() => this.map?.invalidateSize(true), 100);
  }
  
  public setTileLayer(url: string): void {
    this.tileLayer = L.tileLayer(url, {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    });
  }
  
  public getTileLayer(): L.TileLayer | null {
    return this.tileLayer;
  }

  private addPoint(lat: number, lng: number, html: string = ''): void {
    if (!this.map) return;
    const marker = L.circleMarker([lat, lng], {
      color: '#ff0000',      
      fillColor: '#ff0000',  
      fillOpacity: 0.7,
      radius: 8,
      weight: 2
    }).bindPopup(html, { closeButton: false }).addTo(this.map);
    this.markers.push(marker);
  }

  private removeMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }
}