import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import * as L from 'leaflet';

// Componentes
import { NavbarBackComponent } from '../../../components/navbars/navbar-back/navbar-back.component';

// Servicios
import { CountriesService } from 'src/app/services/countries/countries.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { ActivatedRoute } from '@angular/router';

// Tipos
import { CountryInteface } from 'src/app/interfaces/country-interface';

// Flag demo
import { environment } from 'src/environments/environment';

// Fix Leaflet
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
  imports: [CommonModule, IonicModule, NavbarBackComponent]
})
export class MapGuardsPage implements OnInit, AfterViewInit, OnDestroy {

  private map: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null; 
  private perimeterPolygon: L.Polygon | null = null;

  private id_country: number | null = null;

  // -------- Simulación de guardias (demo) --------
  private DEMO_ENABLED = !!(environment as any).DEMO_GUARDS;
  private simTimer: any = null;

  private simGuards: Array<{
    id: number;
    name: string;
    marker: L.CircleMarker;
    edgeIdx: number;     // índice de arista actual (entre punto i y i+1)
    t: number;           // progreso dentro de la arista [0..1]
    speed: number;       // m/s
  }> = [];

  private perimeterPath: L.LatLng[] = [];     // puntos del polígono en LatLng
  private edgeLengths: number[] = [];         // longitudes de cada arista (m)
  private totalPerimeter: number = 0;         // perímetro total (m)

  // === NUEVO: capas base y control de capas ===
  private baseLayers: { [k: string]: L.TileLayer } = {};
  private layersControl: L.Control.Layers | null = null;

  constructor(
    private countries: CountriesService,
    private route: ActivatedRoute,
    private socketSvc: WebSocketService
  ) {}

  ngOnInit(): void {
    // Conectar sockets si los vas a usar acá
    this.socketSvc.conectar();
  }

  async ngAfterViewInit() {
    // Aceptar id por ruta o por query param con DOS nombres posibles:
    // - id_country
    // - countryId  ← (el que estás usando hoy)
    const idFromRoute = this.route.snapshot.paramMap.get('id_country');
    const idFromQueryA = this.route.snapshot.queryParamMap.get('id_country');
    const idFromQueryB = this.route.snapshot.queryParamMap.get('countryId');

    const idStr = idFromRoute ?? idFromQueryA ?? idFromQueryB;
    this.id_country = idStr ? Number(idStr) : null;

    if (!this.id_country) {
      console.warn('MapGuardsPage: no llegó id_country/countryId. Intento fallback: tomar el primer country.');
      // Fallback: cargo el primer country disponible para que la pantalla no quede vacía
      this.countries.getAll().subscribe({
        next: (list: any[]) => {
          if (Array.isArray(list) && list.length) {
            this.id_country = Number(list[0].id);
            this.loadCountry(this.id_country!);
          } else {
            console.warn('No hay countries para mostrar.');
          }
        },
        error: (e) => console.error('fallback getAll() falló', e)
      });
      return;
    }

    // Con id válido, cargo normalmente
    this.loadCountry(this.id_country);
    setTimeout(() => this.map?.invalidateSize(true), 50);
  }

  private loadCountry(id: number) {
    this.countries.getByID(id).subscribe({
      next: (country: any) => {
        console.log('Country recibido (admin):', country);

        const center = this.extractCenter(country);
        if (!center) {
          console.warn('Country sin centro válido.');
          return;
        }

        this.initMap(center.lat, center.lng);

        const perimeter = this.extractPerimeter(country);
        if (perimeter?.length >= 3) {
          this.drawPolygon(perimeter);

          // Si está habilitada la demo: arrancar simulación
          if (this.DEMO_ENABLED) {
            this.startGuardSimulation(perimeter);
          }
        } else {
          // Sin perímetro no simulo; igual queda el mapa centrado
          console.info('Sin perímetro: simulación desactivada.');
        }
      },
      error: (err) => console.error('No se pudo cargar el country', err)
    });
  }

  ngOnDestroy(): void {
    this.stopGuardSimulation();
    this.socketSvc.desconectar();
    if (this.map) this.map.remove();
  }

  // ----------------- Helpers de datos -----------------

  private extractCenter(country: any): { lat:number; lng:number } | null {
    const rawLat = country?.latitude ?? country?.center_lat;
    const rawLng = country?.longitude ?? country?.center_lng;

    const lat = rawLat !== undefined && rawLat !== null ? Number(rawLat) : NaN;
    const lng = rawLng !== undefined && rawLng !== null ? Number(rawLng) : NaN;

    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };

    const per = this.extractPerimeter(country);
    if (per && per.length) {
      const avgLat = per.reduce((s,p)=>s+Number(p.lat), 0) / per.length;
      const avgLng = per.reduce((s,p)=>s+Number(p.lng), 0) / per.length;
      return { lat: avgLat, lng: avgLng };
    }
    return null;
  }

  private extractPerimeter(country: any): { lat:number; lng:number }[] | null {
    let raw = country?.perimeter_points ?? country?.perimeterPoints ?? null;
    if (!raw) return null;

    if (typeof raw === 'string') {
      if (raw.trim() === '') return null;
      try { raw = JSON.parse(raw); } catch { return null; }
    }
    if (!Array.isArray(raw)) return null;

    const norm = raw
      .map((p:any)=>({ lat: Number(p?.lat), lng: Number(p?.lng) }))
      .filter(p=>!isNaN(p.lat) && !isNaN(p.lng));

    return norm.length >= 3 ? norm : null;
  }

  // ----------------- Mapa / Leaflet -----------------

  // === NUEVO: Satélite por defecto + selector de capas ===
  private initMap(mapLat: number, mapLng: number): void {
    if (this.map) {
      this.map.setView([mapLat, mapLng]);
      return;
    }

    // Capas base
    this.baseLayers = {
      'Satélite': L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 20, attribution: 'Tiles © Esri & partners' }
      ),
      'Calles': L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OpenStreetMap contributors' }
      ),
      'Oscuro': L.tileLayer(
        'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
        { maxZoom: 20, attribution: '© Stadia Maps, © OpenMapTiles, © OpenStreetMap' }
      )
    };

    // Crear mapa con Satélite por defecto
    this.map = L.map('adminMap', {
      zoomControl: true,
      layers: [this.baseLayers['Satélite']],
    }).setView([mapLat, mapLng], 15);

    this.map.setMinZoom(13);
    setTimeout(() => this.map?.invalidateSize(true), 100);

    // Control de capas
    this.layersControl = L.control.layers(this.baseLayers, {}, { collapsed: true });
    this.layersControl.addTo(this.map);
  }

  // Mantengo estos helpers para no tocar el resto de tu código (aunque ya no se usan aquí)
  public setTileLayer(url: string): void {
    this.tileLayer = L.tileLayer(url, {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    });
  }
  public getTileLayer(): L.TileLayer | null {
    return this.tileLayer;
  }

  private drawPolygon(points: { lat:number; lng:number }[]): void {
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

  // =======================
  //   SIMULACIÓN GUARDIAS
  // =======================

  /** Arranca simulación de N guardias caminando alrededor del perímetro (sentido horario). */
  private startGuardSimulation(perimeter: {lat:number; lng:number}[]) {
    if (!this.map) return;

    // reset por si venías de otro country
    this.stopGuardSimulation();
    this.simGuards = [];
    this.perimeterPath = [];
    this.edgeLengths = [];
    this.totalPerimeter = 0;

    // 1) Normalizar path del perímetro como LatLng[], cerrando el polígono (último = primero)
    this.perimeterPath = perimeter.map(p => L.latLng(p.lat, p.lng));
    const first = this.perimeterPath[0];
    const last = this.perimeterPath[this.perimeterPath.length - 1];
    if (!last.equals(first)) this.perimeterPath.push(first);

    // 2) Pre-calcular longitudes de aristas y perímetro total
    for (let i = 0; i < this.perimeterPath.length - 1; i++) {
      const a = this.perimeterPath[i];
      const b = this.perimeterPath[i + 1];
      const d = a.distanceTo(b); // metros
      this.edgeLengths.push(d);
      this.totalPerimeter += d;
    }

    if (this.totalPerimeter <= 0) {
      console.warn('Perímetro degenerado, no se puede simular guardias.');
      return;
    }

    // 3) Crear N guardias espaciados alrededor del perímetro
    const N = 4; // cantidad de guardias de demo
    const baseSpeed = 1.3; // m/s (caminata humana)
    for (let i = 0; i < N; i++) {
      // offset inicial en metros a lo largo del perímetro
      const offset = (i / N) * this.totalPerimeter;
      const { edgeIdx, t, coord } = this.locateAlongPerimeter(offset);

      const marker = L.circleMarker(coord, {
        radius: 7, weight: 2, color: '#ff0000', fillColor: '#ff0000', fillOpacity: 0.75
      }).bindPopup(`Vigilador: <b>Guardia ${i + 1}</b>`, { closeButton: false })
        .addTo(this.map!);

      this.simGuards.push({
        id: i + 1,
        name: `Guardia ${i + 1}`,
        marker,
        edgeIdx,
        t,
        speed: baseSpeed * this.rand(0.9, 1.15) // pequeña variación
      });
    }

    // 4) Loop de animación (cada 200ms)
    const dt = 0.2; // segundos por tick
    this.simTimer = setInterval(() => this.tickGuards(dt), 200);
  }

  /** Detiene y limpia la simulación. */
  private stopGuardSimulation() {
    if (this.simTimer) {
      clearInterval(this.simTimer);
      this.simTimer = null;
    }
    this.simGuards.forEach(g => g.marker.remove());
    this.simGuards = [];
    this.perimeterPath = [];
    this.edgeLengths = [];
    this.totalPerimeter = 0;
  }

  /** Avanza a los guardias dt segundos y actualiza sus marcadores. */
  private tickGuards(dt: number) {
    if (!this.map || !this.perimeterPath.length) return;

    this.simGuards.forEach(g => {
      // distancia a avanzar en esta iteración
      let remaining = g.speed * dt; // metros

      while (remaining > 0) {
        const i = g.edgeIdx;
        const a = this.perimeterPath[i];
        const b = this.perimeterPath[i + 1];
        const Lm = this.edgeLengths[i]; // longitud de la arista (m)

        // distancia restante en esta arista desde la posición actual
        const distOnEdge = (1 - g.t) * Lm;

        if (remaining < distOnEdge) {
          // avanzamos dentro de la misma arista
          const advanceT = remaining / Lm;
          g.t += advanceT;
          remaining = 0;
        } else {
          // consumimos lo que queda de la arista y pasamos a la siguiente
          remaining -= distOnEdge;
          g.edgeIdx = (g.edgeIdx + 1) % (this.perimeterPath.length - 1);
          g.t = 0;
        }
      }

      // Interpolar posición final y actualizar marker
      const pos = this.interpolateOnEdge(g.edgeIdx, g.t);
      g.marker.setLatLng(pos);
    });
  }

  /** Dado un offset (m) a lo largo del perímetro, devuelve arista, t y coordenada. */
  private locateAlongPerimeter(offsetMeters: number): { edgeIdx: number; t: number; coord: L.LatLng } {
    let acc = 0;
    for (let i = 0; i < this.edgeLengths.length; i++) {
      const Lm = this.edgeLengths[i];
      if (acc + Lm >= offsetMeters) {
        const t = (offsetMeters - acc) / Lm; // [0..1]
        const coord = this.interpolateOnEdge(i, t);
        return { edgeIdx: i, t, coord };
      }
      acc += Lm;
    }
    // si por redondeo no entra, volver al final
    const lastIdx = this.edgeLengths.length - 1;
    return { edgeIdx: lastIdx, t: 0.9999, coord: this.interpolateOnEdge(lastIdx, 0.9999) };
  }

  /** Interpola linealmente la posición entre el punto i e i+1 del perímetro. */
  private interpolateOnEdge(edgeIdx: number, t: number): L.LatLng {
    const a = this.perimeterPath[edgeIdx];
    const b = this.perimeterPath[edgeIdx + 1];
    const lat = a.lat + (b.lat - a.lat) * t;
    const lng = a.lng + (b.lng - a.lng) * t;
    return L.latLng(lat, lng);
  }

  private rand(min: number, max: number) {
    return min + Math.random() * (max - min);
  }
}
