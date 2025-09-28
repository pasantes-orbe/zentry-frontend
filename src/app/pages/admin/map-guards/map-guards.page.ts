import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import * as L from 'leaflet';

// Componentes
import { NavbarBackComponent } from '../../../components/navbars/navbar-back/navbar-back.component';

// Servicios
import { CountriesService } from 'src/app/services/countries/countries.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { GuardSimulatorService } from 'src/app/services/guards/guard-simulator.service';
import { ActivatedRoute } from '@angular/router';

// Tipos / modelos
import { CountryInteface } from 'src/app/interfaces/country-interface';
import { GuardPointInterface } from 'src/app/interfaces/guardsPoints-interface';

// Env
import { environment } from 'src/environments/environment';

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
export class MapGuardsPage implements OnInit, AfterViewInit, OnDestroy {

  private map: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null; 
  private perimeterPolygon: L.Polygon | null = null;

  // Marcadores de guardias reales (upsert sin parpadeo)
  private guardMarkers = new Map<string | number, L.CircleMarker>();

  // Estado
  private id_country: number | null = null;

  constructor(
    private countries: CountriesService,
    private route: ActivatedRoute,
    private socketSvc: WebSocketService,
    private sim: GuardSimulatorService
  ) {}

  ngOnInit(): void {
    // Conecto sockets SIEMPRE (aunque en demo no escuche posiciones)
    this.socketSvc.conectar();
    this.setupSocketListeners();
  }

  async ngAfterViewInit() {
    // 1) Obtener id_country (por ruta o query param)
    const idFromRoute = this.route.snapshot.paramMap.get('id_country');
    const idFromQuery = this.route.snapshot.queryParamMap.get('id_country');
    const idStr = idFromRoute ?? idFromQuery;
    this.id_country = idStr ? Number(idStr) : null;

    if (!this.id_country) {
      console.warn('MapGuardsPage: no se recibió id_country (ruta o query param).');
      return;
    }

    // 2) Pedir country real y dibujar mapa + perímetro
    this.countries.getByID(this.id_country).subscribe({
      next: (country: CountryInteface) => {
        const center = this.extractCenter(country);
        if (!center) {
          console.warn('Country sin centro válido.');
          return;
        }

        this.initMap(center.lat, center.lng);

        const perimeter = this.extractPerimeter(country);
        if (perimeter?.length >= 3) {
          this.drawPolygon(perimeter);

          // DEMO OPCIONAL: si está activada, arrancamos simulación de guardias
          if (environment.DEMO_GUARDS && this.map) {
            this.sim.start(this.map, perimeter, 3, 800); // 3 guardias, tick 800ms
          }
        }
      },
      error: (err) => {
        console.error('No se pudo cargar el country', err);
      }
    });
  }

  ngOnDestroy(): void {
    // Parar demo si estaba activa
    this.sim.stop();

    // Desconectar sockets
    this.socketSvc.desconectar();

    // Limpiar mapa y marcadores
    if (this.map) this.map.remove();
    this.guardMarkers.forEach(m => m.remove());
    this.guardMarkers.clear();
  }

  // ----------------- Sockets -----------------

  private setupSocketListeners(): void {
    // Si estamos en DEMO_GUARDS, no procesamos posiciones reales
    if (environment.DEMO_GUARDS) {
      // Podés seguir escuchando otros eventos admin acá si quisieras.
      return;
    }

    // Posiciones reales de guardias (sólo si DEMO_GUARDS === false)
    this.socketSvc.escucharEvento('get-actives-guards', (payload: GuardPointInterface[]) => {
      const list = Array.isArray(payload) ? payload : [];
      const filtered = this.id_country != null
        ? list.filter(g => Number((g as any).id_country) === this.id_country)
        : list;

      // Upsert sin parpadeo
      filtered.forEach(g => this.upsertGuardMarker(g));
      this.pruneMissingGuards(filtered);
    });

    this.socketSvc.escucharEvento('guardDisconnected', (payload: any) => {
      const key = payload?.id_user ?? payload?.id;
      if (key && this.guardMarkers.has(key)) {
        this.guardMarkers.get(key)!.remove();
        this.guardMarkers.delete(key);
      }
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

  // ----------------- Helpers de datos -----------------

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

    const ok = raw.every((p: any) => typeof p?.lat === 'number' && typeof p?.lng === 'number');
    return ok ? raw : null;
  }

  // ----------------- Mapa / Leaflet -----------------

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

    this.map = L.map('adminMap', {
      zoomControl: true,
      layers: [this.getTileLayer()!],
      // sin maxBounds fijos; si hay polígono se ajusta con fitBounds
    }).setView([mapLat, mapLng], 15);

    this.map.setMinZoom(13);
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

  private drawPolygon(points: {lat:number; lng:number}[]): void {
    if (!this.map) return;

    if (this.perimeterPolygon) {
      this.map.removeLayer(this.perimeterPolygon);
      this.perimeterPolygon = null;
    }

    this.perimeterPolygon = L.polygon(points as any, { color: 'blue', weight: 2 }).addTo(this.map);

    const bounds = this.perimeterPolygon.getBounds();
    this.map.fitBounds(bounds);

    // Si querés limitar el arrastre al perímetro, descomentá:
    // this.map.setMaxBounds(bounds.pad(0.02));
  }
}
