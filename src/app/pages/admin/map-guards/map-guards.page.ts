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
import { CountryInteface } from 'src/app/interfaces/country-interface'; // Nota: La interfaz no se usa, pero se mantiene la importación
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

  // Almacena los marcadores de guardias en tiempo real (id_user -> marker)
  private activeGuardMarkers: { [id_user: string]: L.CircleMarker } = {};

  // -------- Simulación de guardias (demo) --------
  private DEMO_ENABLED = !!(environment as any).DEMO_GUARDS;
  private simTimer: any = null;

  private simGuards: Array<{
    id: number;
    name: string;
    marker: L.CircleMarker;
    edgeIdx: number; 
    t: number;           
    speed: number;       
  }> = [];

  private perimeterPath: L.LatLng[] = [];     
  private edgeLengths: number[] = [];         
  private totalPerimeter: number = 0;         

  // === capas base y control de capas ===
  private baseLayers: { [k: string]: L.TileLayer } = {};
  private layersControl: L.Control.Layers | null = null;

  constructor(
    private countries: CountriesService,
    private route: ActivatedRoute,
    private socketSvc: WebSocketService
  ) {}

  ngOnInit(): void {
    // La conexión se mueve a ngAfterViewInit para asegurar que el ID del país esté listo antes del listener, 
    // pero se mantiene aquí si se necesitara antes.
    // **Dejar solo this.socketSvc.conectar() en ngOnInit (sin await) si no bloquea el flujo.**
    // **Opción 1 (Recomendada): Mover conexión y listener a ngAfterViewInit.**
  }

  async ngAfterViewInit() {
    // Conectar sockets *antes* de cargar datos y configurar el listener
    // Usar await para evitar condición de carrera (ver nota 1)
    await this.socketSvc.conectar().catch(err => console.error('Error al conectar sockets:', err)); 

    // Aceptar id por ruta o por query param con DOS nombres posibles:
    const idFromRoute = this.route.snapshot.paramMap.get('id_country');
    const idFromQueryA = this.route.snapshot.queryParamMap.get('id_country');
    const idFromQueryB = this.route.snapshot.queryParamMap.get('countryId');

    const idStr = idFromRoute ?? idFromQueryA ?? idFromQueryB;
    this.id_country = idStr ? Number(idStr) : null;

    if (!this.id_country) {
      console.warn('MapGuardsPage: no llegó id_country/countryId. Intento fallback.');
      this.countries.getAll().subscribe({
        next: (list: any[]) => {
          if (Array.isArray(list) && list.length) {
            this.id_country = Number(list[0].id);
            this.loadCountry(this.id_country!);
            // **IMPORTANTE:** El listener se configura aquí después de setear el ID
            if (!this.DEMO_ENABLED) this.setupSocketListener();
          } else {
            console.warn('No hay countries para mostrar.');
          }
        },
        error: (e) => console.error('fallback getAll() falló', e)
      });
      
    } else {
      // Con id válido, cargo normalmente
      this.loadCountry(this.id_country);
      // **IMPORTANTE:** El listener se configura aquí después de setear el ID
      if (!this.DEMO_ENABLED) this.setupSocketListener();
    }
    
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

          // Si la DEMO está activa Y NO hay datos reales, se arranca la simulación
          if (this.DEMO_ENABLED) {
            this.startGuardSimulation(perimeter);
          } else {
            console.log('DEMO_GUARDS está desactivado. Esperando datos en vivo de WebSocket...');
          }
        } else {
          console.info('Sin perímetro: simulación desactivada.');
        }
      },
      error: (err) => console.error('No se pudo cargar el country', err)
    });
  }

  ngOnDestroy(): void {
    this.stopGuardSimulation();
    
    // Si WebSocketService maneja un solo socket global, solo desconectamos.
    // Si queremos ser más finos, deberíamos eliminar el listener específico:
    // this.socketSvc.eliminarListener('get-actives-guards'); 
    this.socketSvc.desconectar();
    
    // Limpiar marcadores reales antes de destruir
    Object.values(this.activeGuardMarkers).forEach(m => m.remove());
    this.activeGuardMarkers = {};
    
    if (this.map) this.map.remove();
  }

  // ----------------- WebSocket / Real-Time -----------------

  /** * Configura la suscripción al evento 'get-actives-guards' del backend.
   * SOLO se llama si DEMO_ENABLED es FALSE.
   */
  private setupSocketListener(): void {
      
      // Escuchar el evento que trae el array de todos los guardias activos
      this.socketSvc.escucharEvento('get-actives-guards', (guards: any[]) => {
          if (!Array.isArray(guards)) {
              console.error('El payload de get-actives-guards no es un array.', guards);
              return;
          }

          // **id_country ya debe estar resuelto en este punto gracias a ngAfterViewInit**
          if (this.id_country === null) return; 

          console.log(`[Socket] Recibidos ${guards.length} guardias. Filtrando por país: ${this.id_country}`);

          // 1. Filtrar por el país actual del administrador
          const countryIdStr = String(this.id_country);
          const filteredGuards = guards.filter(guard => 
              guard.id_country && String(guard.id_country) === countryIdStr
          );

          // 2. Actualizar los marcadores en el mapa con los datos filtrados
          this.updateRealGuardMarkers(filteredGuards);
      });
  }

  /**
   * Procesa la lista de guardias filtrados y actualiza los marcadores de Leaflet.
   */
  private updateRealGuardMarkers(guards: any[]): void {
      if (!this.map) return;
      
      // Detener simulación si llegan datos reales. 
      // Esta lógica se ejecuta fuera del chequeo DEMO_ENABLED en setupSocketListener
      // porque esta función *siempre* se llama para datos reales (la simulación ya no corre).
      if (this.simTimer && guards.length > 0) {
          console.info('Datos reales de guardias recibidos. Deteniendo simulación DEMO.');
          this.stopGuardSimulation();
      }

      const receivedIds = new Set<string>();

      // 1. Crear/Mover marcadores de guardias recibidos
      guards.forEach(g => {
          const id_user = String(g.id_user); 
          receivedIds.add(id_user);

          const lat = Number(g.lat);
          const lng = Number(g.lng);
          if (isNaN(lat) || isNaN(lng)) return; 

          const latLng = L.latLng(lat, lng);
          const markerExists = !!this.activeGuardMarkers[id_user];

          if (markerExists) {
              this.activeGuardMarkers[id_user].setLatLng(latLng);

          } else {
              // Crear nuevo marcador: Azul brillante para real-time
              const marker = L.circleMarker(latLng, {
                  radius: 7, 
                  weight: 2, 
                  color: '#007bff', 
                  fillColor: '#007bff', 
                  fillOpacity: 0.85
              })
              .bindPopup(`Vigilador: <b>${g.user_name || 'Guardia'} ${g.user_lastname || ''} (ID: ${id_user})</b>`, { closeButton: false })
              .addTo(this.map);

              this.activeGuardMarkers[id_user] = marker;
          }
      });

      // 2. Eliminar marcadores que ya no están en el listado recibido (desconectados o fuera del país)
      Object.keys(this.activeGuardMarkers).forEach(id_user => {
          if (!receivedIds.has(id_user)) {
              const markerToRemove = this.activeGuardMarkers[id_user];
              if (this.map && markerToRemove) {
                  this.map.removeLayer(markerToRemove);
              }
              delete this.activeGuardMarkers[id_user];
          }
      });
  }


  // ----------------- Helpers de datos (Sin cambios) -----------------

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

  // ----------------- Mapa / Leaflet (Sin cambios) -----------------

  private initMap(mapLat: number, mapLng: number): void {
    if (this.map) {
      this.map.setView([mapLat, mapLng]);
      return;
    }

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

    this.map = L.map('adminMap', {
      zoomControl: true,
      layers: [this.baseLayers['Satélite']],
    }).setView([mapLat, mapLng], 15);

    this.map.setMinZoom(13);
    setTimeout(() => this.map?.invalidateSize(true), 100);

    this.layersControl = L.control.layers(this.baseLayers, {}, { collapsed: true });
    this.layersControl.addTo(this.map);
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

  private drawPolygon(points: { lat:number; lng:number }[]): void {
    if (!this.map) return;

    if (this.perimeterPolygon) {
      this.map.removeLayer(this.perimeterPolygon);
      this.perimeterPolygon = null;
    }

    this.perimeterPolygon = L.polygon(points as any, { color: 'blue', weight: 2 }).addTo(this.map);

    const bounds = this.perimeterPolygon.getBounds();
    this.map.fitBounds(bounds);
  }

  // =======================
  //   SIMULACIÓN GUARDIAS (Sin cambios funcionales)
  // =======================

  private startGuardSimulation(perimeter: {lat:number; lng:number}[]) {
    if (!this.map) return;

    this.stopGuardSimulation();
    this.simGuards = [];
    this.perimeterPath = [];
    this.edgeLengths = [];
    this.totalPerimeter = 0;

    this.perimeterPath = perimeter.map(p => L.latLng(p.lat, p.lng));
    const first = this.perimeterPath[0];
    const last = this.perimeterPath[this.perimeterPath.length - 1];
    if (!last.equals(first)) this.perimeterPath.push(first);

    for (let i = 0; i < this.perimeterPath.length - 1; i++) {
      const a = this.perimeterPath[i];
      const b = this.perimeterPath[i + 1];
      const d = a.distanceTo(b); 
      this.edgeLengths.push(d);
      this.totalPerimeter += d;
    }

    if (this.totalPerimeter <= 0) {
      console.warn('Perímetro degenerado, no se puede simular guardias.');
      return;
    }

    const N = 4; 
    const baseSpeed = 1.3; 
    for (let i = 0; i < N; i++) {
      const offset = (i / N) * this.totalPerimeter;
      const { edgeIdx, t, coord } = this.locateAlongPerimeter(offset);

      const marker = L.circleMarker(coord, {
        radius: 7, weight: 2, color: '#ff0000', fillColor: '#ff0000', fillOpacity: 0.75
      }).bindPopup(`Vigilador: <b>Guardia ${i + 1} (DEMO)</b>`, { closeButton: false }) 
        .addTo(this.map!);

      this.simGuards.push({
        id: i + 1,
        name: `Guardia ${i + 1}`,
        marker,
        edgeIdx,
        t,
        speed: baseSpeed * this.rand(0.9, 1.15) 
      });
    }

    const dt = 0.2; 
    this.simTimer = setInterval(() => this.tickGuards(dt), 200);
  }

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

  private tickGuards(dt: number) {
    if (!this.map || !this.perimeterPath.length) return;

    this.simGuards.forEach(g => {
      let remaining = g.speed * dt; 

      while (remaining > 0) {
        const i = g.edgeIdx;
        const Lm = this.edgeLengths[i]; 

        const distOnEdge = (1 - g.t) * Lm;

        if (remaining < distOnEdge) {
          const advanceT = remaining / Lm;
          g.t += advanceT;
          remaining = 0;
        } else {
          remaining -= distOnEdge;
          g.edgeIdx = (g.edgeIdx + 1) % (this.perimeterPath.length - 1);
          g.t = 0;
        }
      }

      const pos = this.interpolateOnEdge(g.edgeIdx, g.t);
      g.marker.setLatLng(pos);
    });
  }

  private locateAlongPerimeter(offsetMeters: number): { edgeIdx: number; t: number; coord: L.LatLng } {
    let acc = 0;
    for (let i = 0; i < this.edgeLengths.length; i++) {
      const Lm = this.edgeLengths[i];
      if (acc + Lm >= offsetMeters) {
        const t = (offsetMeters - acc) / Lm; 
        const coord = this.interpolateOnEdge(i, t);
        return { edgeIdx: i, t, coord };
      }
      acc += Lm;
    }
    const lastIdx = this.edgeLengths.length - 1;
    return { edgeIdx: lastIdx, t: 0.9999, coord: this.interpolateOnEdge(lastIdx, 0.9999) };
  }

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