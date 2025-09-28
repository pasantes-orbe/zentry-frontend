import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';

// Componentes de Ionic
import { IonicModule } from '@ionic/angular';

// Servicios
import { AntipanicService } from 'src/app/services/antipanic/antipanic.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { io, Socket } from 'socket.io-client'; 
import { environment } from 'src/environments/environment';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { GuardPointInterface } from 'src/app/interfaces/guardsPoints-interface';
import { CountriesService } from 'src/app/services/countries/countries.service';
import { CountryInteface } from 'src/app/interfaces/country-interface';

// Fix para iconos Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-country-map',
  templateUrl: './country-map.component.html',
  styleUrls: ['./country-map.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class CountryMapComponent implements AfterViewInit, OnInit, OnDestroy {
  private socket: Socket;
  private map: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null;

  // Polígono del perímetro
  private perimeterPolygon: L.Polygon | null = null;

  // Marcadores de guardias sin parpadeo
  private guardMarkers = new Map<string | number, L.CircleMarker>();

  protected antipanicState: boolean = false; 
  protected antipanicID: any;
  protected activeGuards: GuardPointInterface[] = [];
  public markers: L.CircleMarker[] = []; // (si lo usás en otros lados, lo dejo)

  public id_country: any;
  public id_user: any;

  constructor(
    private _antipanicService: AntipanicService,
    private alertController: AlertController,
    private _ownerStorage: OwnerStorageService,
    private _socketService: WebSocketService,
    private _countryService: CountriesService,
    private _alerts: AlertService,
  ) { 
    this.socket = io(environment.URL);
  }

  async ngOnInit() { 
    try {
      const owner = await this._ownerStorage.getOwner();
      if (owner && owner.user) {
        this.id_user = owner.user.id;
        this.id_country = owner.property.id_country.toString();
      }
    } catch (error) {
      console.warn('No se pudieron obtener los datos del owner del storage.');
    }
    
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Movimiento en vivo sin parpadeo
    this.socket.on('get-actives-guards', (payload) => {
      const list = Array.isArray(payload) ? payload : [];
      const filtered = list.filter((g) => g.id_country == this.id_country);

      filtered.forEach(g => this.upsertGuardMarker(g));
      this.pruneMissingGuards(filtered);
    });

    this.socket.on('guardDisconnected', (payload) => {
      const key = payload?.id_user ?? payload?.id;
      if (key && this.guardMarkers.has(key)) {
        this.guardMarkers.get(key)!.remove();
        this.guardMarkers.delete(key);
      }
    });

    this.socket.on('notificacion-antipanico-finalizado', (payload) => {
      this.antipanicState = false;
      const box = document.querySelector('.box') as HTMLElement;
      if (box) box.style.display = 'none';
      this._alerts.presentAlertFinishAntipanicDetails(payload['antipanic']['details']);
    });
  }

  // Upsert de marcadores de guardias
  private upsertGuardMarker(g: any): void {
    if (!this.map) return;
    const key = g.id_user ?? g.id ?? `${g.user_name}-${g.user_lastname}`;

    let marker = this.guardMarkers.get(key);
    if (marker) {
      marker.setLatLng([g.lat, g.lng]);
    } else {
      marker = L.circleMarker([g.lat, g.lng], {
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0.7,
        radius: 8,
        weight: 2
      }).bindPopup(`Vigilador: <b>${g.user_name} - ${g.user_lastname}</b>`, { closeButton: false })
        .addTo(this.map);
      this.guardMarkers.set(key, marker);
    }
  }

  // Limpieza incremental (los que ya no vienen)
  private pruneMissingGuards(current: any[]): void {
    const alive = new Set(
      current.map(g => (g.id_user ?? g.id ?? `${g.user_name}-${g.user_lastname}`))
    );
    for (const [key, marker] of this.guardMarkers.entries()) {
      if (!alive.has(key)) {
        marker.remove();
        this.guardMarkers.delete(key);
      }
    }
  }

  async ngAfterViewInit() {
    if (!this.id_country) return;

    try {
      const country = await new Promise<any>((resolve, reject) => {
        this._countryService.getByID(+this.id_country).subscribe(resolve, reject);
      });

      const center = this.extractCenter(country);
      if (!center) return;

      this.initMap(center.lat, center.lng);

      const perimeter = this.extractPerimeter(country);
      if (perimeter && perimeter.length >= 3) {
        this.drawPolygon(perimeter);
      }
    } catch (e) {
      console.warn('Fallo al cargar el country.', e);
    }
  }

  private extractCenter(country: any): {lat:number; lng:number} | null {
    const lat = country?.latitude ?? country?.center_lat;
    const lng = country?.longitude ?? country?.center_lng;
    return (typeof lat === 'number' && typeof lng === 'number') ? {lat, lng} : null;
  }

  private extractPerimeter(country: any): {lat:number; lng:number}[] | null {
    let raw = country?.perimeter_points ?? country?.perimeterPoints ?? null;
    if (!raw) return null;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch { return null; }
    }
    if (!Array.isArray(raw)) return null;
    return raw.every(p => typeof p?.lat === 'number' && typeof p?.lng === 'number') ? raw : null;
  }

  private drawPolygon(points: {lat:number; lng:number}[]): void {
    if (!this.map) return;
    if (this.perimeterPolygon) {
      this.map.removeLayer(this.perimeterPolygon);
      this.perimeterPolygon = null;
    }
    this.perimeterPolygon = L.polygon(points as any, { color: 'blue', weight: 2 }).addTo(this.map);

    // Ajustar vista al polígono y (opcional) limitar el paneo al perímetro
    const bounds = this.perimeterPolygon.getBounds();
    this.map.fitBounds(bounds);
    // Si querés limitar el arrastre al perímetro, descomentá:
    // this.map.setMaxBounds(bounds.pad(0.02));
  }

  ngOnDestroy(): void {
    if (this.socket) this.socket.disconnect();
    if (this.map) this.map.remove();
    this.guardMarkers.forEach(m => m.remove());
    this.guardMarkers.clear();
  }
  
  public getTileLayer(): L.TileLayer | null {
    return this.tileLayer;
  }

  ionViewWillEnter() {
    if (this.socket) this.socket.emit('owner-connected', this.id_user);
  }
  
  public setTileLayer(url: string): void {
    this.tileLayer = L.tileLayer(url, {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    });
  }

  private initMap(mapLat: number, mapLng: number): void {
    if (this.map) {
      this.map.setView([mapLat, mapLng]);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches) {
      this.setTileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png');
    } else {
      this.setTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    }

    this.map = L.map('map', {
      zoomControl: true,
      layers: [this.getTileLayer()!]
      // sin maxBounds hardcodeados; si hay perímetro, se setea con fitBounds
    }).setView([mapLat, mapLng], 15);

    this.map.setMinZoom(13);
    setTimeout(() => this.map?.invalidateSize(true), 100);
  }

  // Marcadores auxiliares (si en otro flujo los seguís usando)
  public addPoint(lat: number, lng: number, html: string = ''): void {
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

  public removeMarker(marker: L.CircleMarker): void {
    if (this.map) this.map.removeLayer(marker);
  }

  public removeMarkers(): void {
    this.markers.forEach(marker => this.removeMarker(marker));
    this.markers = [];
  }

  public getMarkers(): L.CircleMarker[] {
    return this.markers;
  }

  public getMap(): L.Map | null {
    return this.map;
  }

  async activateAntipanic() {
    const box = document.querySelector('.box') as HTMLElement;
    if (box) box.style.display = 'block';
    this.antipanicState = true;
    console.log('Antipánico activado.');
  }

  async desactivateAntipanic() {
    this.presentAlert();
  }

  public async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Cancelar Antipánico',
      message: '¿Está seguro de cancelarlo?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Autorizar',
          role: 'confirm',
          handler: () => {
            this.antipanicState = false;
            const box = document.querySelector('.box') as HTMLElement;
            if (box) box.style.display = 'none';
            console.log('Antipánico desactivado.');
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => { this.antipanicState = true; },
        }
      ],
    });
    await alert.present();
  }
}
