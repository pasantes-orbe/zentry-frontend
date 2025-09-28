import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';

// Ionic
import { IonicModule } from '@ionic/angular';

// Servicios
import { AntipanicService } from 'src/app/services/antipanic/antipanic.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { CountriesService } from 'src/app/services/countries/countries.service';
import { AlertService } from 'src/app/services/helpers/alert.service';

// Modelos / tipos
import { GuardPointInterface } from 'src/app/interfaces/guardsPoints-interface';
import { CountryInteface } from 'src/app/interfaces/country-interface';

// Demo (simulador)
import { GuardSimulatorService } from 'src/app/services/guards/guard-simulator.service';
import { environment } from 'src/environments/environment';

// Fix iconos Leaflet
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
  imports: [ CommonModule, IonicModule ]
})
export class CountryMapComponent implements AfterViewInit, OnInit, OnDestroy {
  private map: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null;

  // Polígono de perímetro
  private perimeterPolygon: L.Polygon | null = null;

  // Marcadores de guardias reales (upsert sin parpadeo)
  private guardMarkers = new Map<string | number, L.CircleMarker>();

  // Estado
  protected antipanicState = false;
  protected activeGuards: GuardPointInterface[] = [];
  public markers: L.CircleMarker[] = []; // legacy/aux

  // Contexto
  public id_country: number | null = null;
  public id_user: number | null = null;

  constructor(
    private _antipanicService: AntipanicService,
    private alertController: AlertController,
    private _ownerStorage: OwnerStorageService,
    private _socketService: WebSocketService,
    private _countryService: CountriesService,
    private _alerts: AlertService,
    private sim: GuardSimulatorService
  ) {}

  // ---------------- Ciclo de vida ----------------

  async ngOnInit() {
    try {
      const owner = await this._ownerStorage.getOwner();
      if (owner?.user) {
        this.id_user = owner.user.id;
        this.id_country = Number(owner.property.id_country);
      }
    } catch (error) {
      console.warn('No se pudieron obtener datos del owner del storage.', error);
    }

    // Conectar socket (centralizado)
    this._socketService.conectar();
    this.setupSocketListeners();
  }

  async ngAfterViewInit() {
    if (!this.id_country) return;

    try {
      const country = await new Promise<CountryInteface>((resolve, reject) => {
        this._countryService.getByID(this.id_country!).subscribe(resolve, reject);
      });

      const center = this.extractCenter(country);
      if (!center) return;

      this.initMap(center.lat, center.lng);

      const perimeter = this.extractPerimeter(country);
      if (perimeter && perimeter.length >= 3) {
        this.drawPolygon(perimeter);

        // DEMO: arranca simulación si está habilitada
        if ((environment as any).DEMO_GUARDS && this.map) {
          this.sim.start(this.map, perimeter, 3, 800);
        }
      }

      // Notificar conexión de owner (si backend lo usa)
      if (this.id_user) {
        this._socketService.emitirEvento('owner-connected', this.id_user);
      }

    } catch (e) {
      console.warn('Fallo al cargar el country.', e);
    }
  }

  ngOnDestroy(): void {
    // Apagar demo
    this.sim.stop();

    // Desconectar socket
    this._socketService.desconectar();

    // Limpiar mapa
    if (this.map) this.map.remove();
    this.guardMarkers.forEach(m => m.remove());
    this.guardMarkers.clear();
  }

  // ---------------- Sockets ----------------

  private setupSocketListeners(): void {
    // Lista de guardias activos (recurrente)
    this._socketService.escucharEvento('get-actives-guards', (payload: any[]) => {
      const list = Array.isArray(payload) ? payload : [];
      const filtered = this.id_country != null
        ? list.filter((g) => Number(g.id_country) === this.id_country)
        : list;

      // Si llegaron reales → apagar simulación
      if (filtered.length > 0) this.sim.stop();

      // Upsert sin parpadeo
      filtered.forEach(g => this.upsertGuardMarker(g));
      this.pruneMissingGuards(filtered);
    });

    // Baja puntual
    this._socketService.escucharEvento('guardDisconnected', (payload: any) => {
      const key = payload?.id_user ?? payload?.id;
      if (key && this.guardMarkers.has(key)) {
        this.guardMarkers.get(key)!.remove();
        this.guardMarkers.delete(key);
      }
    });

    // Fin de antipánico (UI)
    this._socketService.escucharEvento('notificacion-antipanico-finalizado', (payload: any) => {
      this.antipanicState = false;
      const box = document.querySelector('.box') as HTMLElement;
      if (box) box.style.display = 'none';
      this._alerts.presentAlertFinishAntipanicDetails(payload?.antipanic?.details);
    });
  }

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
        .addTo(this.map!);
      this.guardMarkers.set(key, marker);
    }
  }

  private pruneMissingGuards(current: any[]): void {
    const alive = new Set(current.map(g =>
      (g.id_user ?? g.id ?? `${g.user_name}-${g.user_lastname}`)));
    for (const [key, marker] of this.guardMarkers.entries()) {
      if (!alive.has(key)) {
        marker.remove();
        this.guardMarkers.delete(key);
      }
    }
  }

  // ---------------- Leaflet / Mapa ----------------

  private initMap(mapLat: number, mapLng: number): void {
    if (this.map) {
      this.map.setView([mapLat, mapLng]);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.setTileLayer(
      prefersDark.matches
        ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    );

    this.map = L.map('map', {
      zoomControl: true,
      layers: [this.getTileLayer()!]
    }).setView([mapLat, mapLng], 15);

    this.map.setMinZoom(13);
    setTimeout(() => this.map?.invalidateSize(true), 100);
  }

  public setTileLayer(url: string): void {
    this.tileLayer = L.tileLayer(url, { attribution: '© OpenStreetMap contributors', maxZoom: 19 });
  }
  public getTileLayer(): L.TileLayer | null { return this.tileLayer; }

  private drawPolygon(points: {lat:number; lng:number}[]): void {
    if (!this.map) return;

    if (this.perimeterPolygon) {
      this.map.removeLayer(this.perimeterPolygon);
      this.perimeterPolygon = null;
    }

    this.perimeterPolygon = L.polygon(points as any, { color: 'blue', weight: 2 }).addTo(this.map);
    const bounds = this.perimeterPolygon.getBounds();
    this.map.fitBounds(bounds);
    // this.map.setMaxBounds(bounds.pad(0.02)); // opcional
  }

  private extractCenter(country: CountryInteface): {lat:number; lng:number} | null {
    const lat = (country as any)?.latitude ?? (country as any)?.center_lat;
    const lng = (country as any)?.longitude ?? (country as any)?.center_lng;
    return (typeof lat === 'number' && typeof lng === 'number') ? { lat, lng } : null;
  }

  private extractPerimeter(country: CountryInteface): {lat:number; lng:number}[] | null {
    let raw: any = (country as any)?.perimeter_points ?? (country as any)?.perimeterPoints ?? null;
    if (!raw) return null;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch { return null; }
    }
    if (!Array.isArray(raw)) return null;

    return raw.every((p: any) => typeof p?.lat === 'number' && typeof p?.lng === 'number')
      ? raw
      : null;
  }

  // ---------------- Antipánico (real + UI) ----------------

  async activateAntipanic() {
    // UI inmediata
    const box = document.querySelector('.box') as HTMLElement;
    if (box) box.style.display = 'block';
    this.antipanicState = true;

    try {
      // Datos del owner para payload
      const owner = await this._ownerStorage.getOwner();

      // Ubicación actual (fallback básico)
      let latitude = -27.5615;
      let longitude = -58.7521;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, {
              enableHighAccuracy: true, timeout: 10000, maximumAge: 60000
            }));
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch { /* ignore, usamos fallback */ }
      }

      // Armar payload compatible con tu backend
      const dto: any = {
        id_owner: owner?.id,
        address: owner?.property?.address || `${latitude}, ${longitude}`,
        id_country: owner?.property?.id_country,
        propertyNumber: owner?.property?.number,
        latitude,
        longitude
      };

      // Llamada real
      this._antipanicService.activateAntipanic(dto).subscribe({
        next: (resp) => {
          this._alerts.showAlert('🚨 ALERTA ACTIVADA',
            `Se envió la alerta desde <b>${owner?.property?.name}</b>
             <br>(${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
          // Si tu backend emite eventos, el WebSocketService ya los escucha
        },
        error: (err) => {
          console.error(err);
          this._alerts.showAlert('Error', 'No se pudo enviar la alerta de emergencia.');
          this.antipanicState = false;
          if (box) box.style.display = 'none';
        }
      });

    } catch (e) {
      console.error(e);
      this._alerts.showAlert('Error', 'No se pudo iniciar la alerta.');
      this.antipanicState = false;
      if (box) box.style.display = 'none';
    }
  }

  async desactivateAntipanic() {
    const alert = await this.alertController.create({
      header: 'Cancelar Antipánico',
      message: '¿Está seguro de cancelarlo?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Autorizar',
          role: 'confirm',
          handler: () => {
            // Si tenés endpoint de desactivar, llamalo acá:
            // this._antipanicService.desactivateAntipanic(id).subscribe(...)
            this.antipanicState = false;
            const box = document.querySelector('.box') as HTMLElement;
            if (box) box.style.display = 'none';
          },
        },
        { text: 'Cancelar', role: 'cancel', handler: () => { this.antipanicState = true; } }
      ],
    });
    await alert.present();
  }
}
