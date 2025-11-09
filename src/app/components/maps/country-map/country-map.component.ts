import {
  AfterViewInit, Component, OnDestroy, OnInit, OnChanges, SimpleChanges, Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import * as L from 'leaflet';
import { firstValueFrom } from 'rxjs';

import { AntipanicService, AntipanicCreateDto } from 'src/app/services/antipanic/antipanic.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { CountriesService } from 'src/app/services/countries/countries.service';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

type LatLngObj = { lat: number; lng: number };

@Component({
  selector: 'app-country-map',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './country-map.component.html',
  styleUrls: ['./country-map.component.scss']
})
export class CountryMapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  @Input() countryId?: number;
  @Input() showPanicButton: boolean = true;
  @Input() simulateGuards: boolean = true;
  @Input() demoMode: boolean = false;

  public antipanicState = false;
  public isSending = false;

  private map: L.Map | null = null;
  private baseLayers: { [k: string]: L.TileLayer } = {};
  private layersControl: L.Control.Layers | null = null;

  private perimeterPolygon: L.Polygon | null = null;

  // marker del propietario
  private ownerPointer: L.CircleMarker | null = null;
  // ping rojo anclado a lat/lng del propietario
  private ownerPingMarker: L.Marker | null = null;

  // NUEVO: Almacena los marcadores de guardias en tiempo real (id_user -> marker)
  private activeGuardMarkers: { [id_user: string]: L.CircleMarker } = {};

  // Sim guardias
  private simTimer: any = null;
  private simGuards: Array<{ id: number; marker: L.CircleMarker; edgeIdx: number; t: number; speed: number; }> = [];
  private perimeterPath: L.LatLng[] = [];
  private edgeLengths: number[] = [];
  private totalPerimeter = 0;

  public id_country: number | null = null;
  public loading = true;
  public error: string | null = null;
  private initialized = false;
  private antipanicId: number | string | null = null;

  constructor(
    private antipanicSvc: AntipanicService,
    private ownerStorage: OwnerStorageService,
    private socketSvc: WebSocketService,
    private countrySvc: CountriesService,
    private alerts: AlertService,
    private alertCtrl: AlertController,
    private userStorage: UserStorageService,
  ) {}

  async ngOnInit() {
    if (typeof this.countryId === 'number' && !isNaN(this.countryId)) {
      this.id_country = this.countryId;
    } else {
      const owner = await this.ownerStorage.getOwner().catch(() => null);
      const id = Number(owner?.property?.id_country);
      this.id_country = !isNaN(id) ? id : null;
    }

    if (!this.demoMode) {
      await this.socketSvc.conectar();
      // Esperar a que el socket esté conectado
      await new Promise(resolve => setTimeout(resolve, 500));
      this.setupSocketListeners();
      console.log('[CountryMap] Socket conectado y listeners configurados');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countryId'] && !changes['countryId'].firstChange) {
      const next = Number(changes['countryId'].currentValue);
      if (!isNaN(next)) {
        this.id_country = next;
        this.initialized = false;
        this.safeLoad();
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.safeLoad(), 0);
  }

  ngOnDestroy(): void {
    this.stopGuardSimulation();
    // Limpiar marcadores de guardias reales al salir
    Object.values(this.activeGuardMarkers).forEach(m => m.remove());
    this.activeGuardMarkers = {};
    
    if (!this.demoMode) this.socketSvc.desconectar();
    if (this.map) this.map.remove();
  }

  private safeLoad(): void {
    if (this.initialized) return;
    if (!this.id_country) return;
    this.initialized = true;
    this.loading = true;

    this.countrySvc.getByID(this.id_country!).subscribe({
      next: (country: any) => {
        const center = this.extractCenter(country);
        if (!center) {
          this.error = 'El country no tiene coordenadas válidas.';
          this.loading = false;
          return;
        }
        this.initMap(center.lat, center.lng);

        const perimeter = this.extractPerimeter(country);
        if (perimeter?.length >= 3) {
          this.drawPolygonOutline(perimeter);
          // Solo arranca simulación si no es demoMode O si simulateGuards es true
          if (this.simulateGuards && this.demoMode) this.startGuardSimulation(perimeter);
        }
        setTimeout(() => this.map?.invalidateSize(true), 120);
        this.loading = false;
      },
      error: () => { this.error = 'No se pudo cargar el country.'; this.loading = false; }
    });
  }

  private extractCenter(country: any): LatLngObj | null {
    const rawLat = country?.latitude ?? country?.center_lat;
    const rawLng = country?.longitude ?? country?.center_lng;
    const lat = Number(rawLat), lng = Number(rawLng);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };

    const per = this.extractPerimeter(country);
    if (per?.length) {
      const avgLat = per.reduce((s: number, p: any) => s + Number(p.lat), 0) / per.length;
      const avgLng = per.reduce((s: number, p: any) => s + Number(p.lng), 0) / per.length;
      return { lat: avgLat, lng: avgLng };
    }
    return null;
  }

  private extractPerimeter(country: any): LatLngObj[] | null {
    let raw = country?.perimeter_points ?? country?.perimeterPoints ?? null;
    if (!raw) return null;
    if (typeof raw === 'string') { if (!raw.trim()) return null; try { raw = JSON.parse(raw); } catch { return null; } }
    if (!Array.isArray(raw)) return null;
    const norm = raw.map((p: any) => ({ lat: Number(p?.lat), lng: Number(p?.lng) }))
                    .filter(p => !isNaN(p.lat) && !isNaN(p.lng));
    return norm.length >= 3 ? norm : null;
  }

  private initMap(mapLat: number, mapLng: number): void {
    if (this.map) { this.map.setView([mapLat, mapLng]); return; }

    this.baseLayers = {
      'Calles':   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }),
      'Satélite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 20, attribution: 'Tiles &copy; Esri & partners' }),
      'obscuro': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; CARTO' }),
    };

    this.map = L.map('map', {
      zoomControl: false,        // ❌ sin botones de zoom
      scrollWheelZoom: false,    // ❌ sin zoom con rueda
      doubleClickZoom: false,    // ❌ sin zoom doble click
      touchZoom: false,          // ❌ sin pinch zoom
      dragging: true,            // ✅ se puede mover dentro del perímetro
      layers: [this.baseLayers['Calles']] 
    }).setView([mapLat, mapLng], 16);

// ❌ No permitir alejar demasiado
this.map.setMinZoom(13);

// ❌ Ocultar selector de capas para que NO pueda cambiar el mapa
// this.layersControl = L.control.layers(this.baseLayers, {}, { collapsed: true }).addTo(this.map);


    this.map.setMinZoom(13);
    this.layersControl = L.control.layers(this.baseLayers, {}, { collapsed: true }).addTo(this.map);
  }

  private drawPolygonOutline(points: LatLngObj[]): void {
    if (!this.map) return;
    if (this.perimeterPolygon) { this.map.removeLayer(this.perimeterPolygon); this.perimeterPolygon = null; }
    
    this.perimeterPolygon = L.polygon(points as any, {
      color: '#10b981', weight: 3, opacity: 1, fill: false, fillOpacity: 0
    }).addTo(this.map);

    const bounds = this.perimeterPolygon.getBounds();

    this.map.fitBounds(bounds, { padding: [50, 50] });

    // 🔒 Bloquear mapa dentro del perímetro
    this.map.setMaxBounds(bounds);
    this.map.setMinZoom(this.map.getBoundsZoom(bounds));

    
  }


  // ----------------- WebSocket / Real-Time (AGREGADO) -----------------

  /**
   * Extiende el listener de sockets para incluir la posición de guardias activos.
   */
  private setupSocketListeners(): void {
    // Listener existente para el antipánico
    this.socketSvc.escucharEvento('notificacion-antipanico-finalizado', (payload: any) => {
      if (!this.antipanicId || payload?.antipanicId === this.antipanicId) {
        this.antipanicState = false;
        this.antipanicId = null;

        if (this.ownerPointer) {
          this.map?.removeLayer(this.ownerPointer);
          this.ownerPointer = null;
        }

        if (this.ownerPingMarker) {
          this.map?.removeLayer(this.ownerPingMarker);
          this.ownerPingMarker = null;
        }

        this.alerts.presentAlert('Antipánico finalizado por administración.');
      }
    });

    // NUEVO LISTENER: Recibir posiciones de guardias activos
    this.socketSvc.escucharEvento('get-actives-guards', (guards: any[]) => {
        if (!Array.isArray(guards) || this.demoMode) return;

        // 1. Filtrar por el país del Propietario (this.id_country)
        const countryIdStr = String(this.id_country);
        const filteredGuards = guards.filter(guard => 
            guard.id_country && String(guard.id_country) === countryIdStr
        );

        // 2. Actualizar los marcadores en el mapa
        this.updateGuardMarkers(filteredGuards);
    });
  }

  /**
   * Crea, mueve o elimina los marcadores de guardias en el mapa.
   */
  private updateGuardMarkers(guards: any[]): void {
    if (!this.map) return;

    const receivedIds = new Set<string>();

    // 1. Crear o mover marcadores existentes
    guards.forEach(g => {
        const id_user = String(g.id_user);
        receivedIds.add(id_user);

        const lat = Number(g.lat);
        const lng = Number(g.lng);
        if (isNaN(lat) || isNaN(lng)) return; 

        const latLng = L.latLng(lat, lng);
        const markerExists = !!this.activeGuardMarkers[id_user];

        if (markerExists) {
            // Mover marcador existente
            this.activeGuardMarkers[id_user].setLatLng(latLng);

        } else {
            // Crear nuevo marcador (similar al Admin, diferente al Propietario)
            const marker = L.circleMarker(latLng, {
                radius: 6, // Un poco más pequeño que el del propietario (9)
                weight: 2, 
                color: '#10b981', // Verde/Esmeralda
                fillColor: '#34d399', 
                fillOpacity: 0.85
            })
            .bindPopup(`Vigilador: <b>${g.user_name || 'Guardia'} ${g.user_lastname || ''}</b>`, { closeButton: false })
            .addTo(this.map);

            this.activeGuardMarkers[id_user] = marker;
        }
    });

    // 2. Eliminar marcadores que ya no están en la lista recibida
    Object.keys(this.activeGuardMarkers).forEach(id_user => {
        if (!receivedIds.has(id_user)) {
            const markerToRemove = this.activeGuardMarkers[id_user];
            if (this.map && markerToRemove) {
                this.map.removeLayer(markerToRemove);
            }
            delete this.activeGuardMarkers[id_user];
        }
    });

    // 3. Detener simulación si llegan datos reales
    if (this.simulateGuards && this.simTimer && guards.length > 0) {
        console.info('Datos reales de guardias recibidos. Deteniendo simulación.');
        this.stopGuardSimulation();
    }
  }

  // ========================
  //    Antipánico
  // ========================
  public onAntipanicClick(): void {

    if (!this.antipanicState) this.activateAntipanic();
    else this.desactivateAntipanic();
  }

  async activateAntipanic() {
    if (this.isSending) return;
    this.isSending = true;

    try {
      // 🔧 CORRECCIÓN: Obtener id_owner del usuario logueado (JWT) en lugar del storage
      const user = await this.userStorage.getUser().catch(() => null);
      const id_owner = user?.id ?? null;
      
      // Obtener datos de la propiedad del storage (solo para address y propertyNumber)
      const owner = await this.ownerStorage.getOwner().catch(() => null);
      const address = owner?.property?.address ?? '';
      const propertyNumber = owner?.property?.propertyNumber ?? owner?.property?.number ?? '';

      if (!this.id_country || !id_owner) {
        this.alerts.presentAlert('Faltan datos del propietario o del country.');
        this.isSending = false;
        return;
      }

      console.log('🔧 [ANTIPANIC] Usando id_owner del usuario logueado:', id_owner);

      // ==== GEOLOCALIZACIÓN REAL ====
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // 🚫 Bloquear si está fuera del perímetro
        if (!this.isInsidePerimeter(lat, lng)) {
          this.alerts.presentAlert('Estás fuera del country. No puedes activar el botón de pánico.');
          this.isSending = false;
          return;
        }

        const payload: AntipanicCreateDto = {
          id_owner, address, id_country: this.id_country!, propertyNumber, latitude: lat, longitude: lng
        };

        try {
          const resp = await firstValueFrom(this.antipanicSvc.activateAntipanic(payload));
          this.antipanicId = this.pickAntipanicId(resp);

          if (!this.demoMode) {
            // El socket espera { res: response, ownerName, ownerLastName }
            this.socketSvc.notificarAntipanico({
              res: resp,
              ownerName: user?.name || '',
              ownerLastName: user?.lastname || ''
            });
          }

          this.antipanicState = true;

          // FIX: Verificar que el mapa existe antes de colocar el marcador
          console.log('📍 Intentando colocar marcador en:', lat, lng);
          console.log('🗺️ Mapa existe:', !!this.map);
          
          if (this.map) {
            this.placeOwnerPointer(lat, lng);
            this.map.setView([lat, lng], Math.max(this.map.getZoom(), 17), { animate: true });
            console.log('✅ Marcador colocado y vista actualizada');
          } else {
            console.error('❌ El mapa no está inicializado');
          }

          this.alerts.presentAlert('Antipánico activado. Se notificó a administración y guardias.');
        } catch (err) {
          console.error('Error activando antipánico:', err);
          this.alerts.presentAlert('No se pudo activar el antipánico.');
        } finally {
          this.isSending = false;
        }
      }, (err) => {
        console.error('Error geolocalización:', err);
        this.alerts.presentAlert('No se pudo obtener ubicación del dispositivo.');
        this.isSending = false;
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

    } catch (err) {
      console.error('Error en activateAntipanic:', err);
      this.alerts.presentAlert('No se pudo activar el antipánico.');
      this.isSending = false;
    }
  }

  async desactivateAntipanic() {
    if (!this.antipanicId) {
      this.alerts.presentAlert('No hay alerta activa para cancelar.');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Cancelar Antipánico',
      message: '¿Seguro que querés cancelar el botón antipánico?',
      backdropDismiss: false,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, cancelar',
          role: 'confirm',
          handler: async () => {
            await this.finishAntipanic();
          }
        }
      ],
    });
    await alert.present();
  }

  private async finishAntipanic() {
    if (this.isSending || !this.antipanicId) return;
    this.isSending = true;
    try {
      await firstValueFrom(this.antipanicSvc.desactivateAntipanic(this.antipanicId));

      if (!this.demoMode) {
        this.socketSvc.emitirEvento('owner-antipanico-cancelado', {
          id_country: this.id_country, antipanicId: this.antipanicId, ts: Date.now()
        });
      }

      this.antipanicState = false;
      this.antipanicId = null;

      // BORRAR MARKER DEL PROPIETARIO
      if (this.ownerPointer) {
        this.map?.removeLayer(this.ownerPointer);
        this.ownerPointer = null;
      }
      // BORRAR PING ROJO
      if (this.ownerPingMarker) {
        this.map?.removeLayer(this.ownerPingMarker);
        this.ownerPingMarker = null;
      }

      this.alerts.presentAlert('Antipánico cancelado.');
    } catch (err) {
      console.error('Error cancelando antipánico:', err);
      this.alerts.presentAlert('No se pudo cancelar.');
    } finally {
      this.isSending = false;
    }
  }

  private placeOwnerPointer(lat: number, lng: number): void {
    console.log('🎯 placeOwnerPointer llamado con:', { lat, lng, mapaExiste: !!this.map });
    
    if (!this.map) {
      console.error('❌ No hay mapa en placeOwnerPointer');
      return;
    }

    if (!this.ownerPointer) {
      console.log('🆕 Creando nuevo marcador...');
      this.ownerPointer = L.circleMarker([lat, lng], {
        radius: 9,
        color: '#2563eb',
        weight: 3,
        fillColor: '#3b82f6',
        fillOpacity: 0.9
      }).addTo(this.map);
      this.ownerPointer.bindPopup('<b>Ubicación del propietario</b>', { closeButton: false }).openPopup();
      console.log('✅ Marcador creado y agregado al mapa');
    } else {
      console.log('♻️ Actualizando marcador existente...');
      this.ownerPointer.setLatLng([lat, lng]).openPopup();
      console.log('✅ Marcador actualizado');
    }

    // Crear/actualizar ping rojo anclado con L.divIcon
    const html = `
      <div class="ping-red">
        <div class="ring ring-1"></div>
        <div class="ring ring-2"></div>
        <div class="dot"></div>
      </div>`;

    const icon = L.divIcon({
      className: 'ping-red-wrap',
      html,
      iconSize: [64, 64],        // tamaño total del halo (ajustable)
      iconAnchor: [32, 32],      // centrar en la lat/lng
    });

    if (!this.ownerPingMarker) {
      this.ownerPingMarker = L.marker([lat, lng], { icon, interactive: false, zIndexOffset: 1000 }).addTo(this.map);
    } else {
      this.ownerPingMarker.setLatLng([lat, lng]);
      this.ownerPingMarker.setIcon(icon);
    }
  }

  private pickAntipanicId(resp: any): string | number | null {
    if (!resp) return null;
    console.log('🔍 Respuesta completa del backend:', resp);
    
    const candidates = [
      resp?.antipanic?.id,
      resp?.data?.id,
      resp?.id,
      resp?.antipanicId,
      resp?.result?.id,
      resp?.payload?.id
    ];
    
    const id = candidates.find(v => v !== undefined && v !== null);
    console.log('🆔 ID encontrado:', id, '| Candidatos:', candidates);
    
    return (typeof id === 'string' && /^\d+$/.test(id)) ? Number(id) : (id ?? null);
  }

  // ========================
  //   Simulación Guardias
  // ========================
  private startGuardSimulation(perimeter: LatLngObj[]): void {
    if (!this.map) return;
    this.stopGuardSimulation();

    this.perimeterPath = perimeter.map(p => L.latLng(p.lat, p.lng));
    const first = this.perimeterPath[0];
    const last = this.perimeterPath[this.perimeterPath.length - 1];
    if (!last.equals(first)) this.perimeterPath.push(first);

    this.edgeLengths = []; this.totalPerimeter = 0;
    for (let i = 0; i < this.perimeterPath.length - 1; i++) {
      const d = this.perimeterPath[i].distanceTo(this.perimeterPath[i + 1]);
      this.edgeLengths.push(d); this.totalPerimeter += d;
    }
    if (this.totalPerimeter <= 0) return;

    const N = 4, baseSpeed = 1.3;
    for (let i = 0; i < N; i++) {
      const offset = (i / N) * this.totalPerimeter;
      const { edgeIdx, t, coord } = this.locateAlongPerimeter(offset);
      const marker = L.circleMarker(coord, {
        radius: 7, weight: 2, color: '#ff0000', fillColor: '#ff0000', fillOpacity: 0.85
      }).bindPopup(`Vigilador: <b>Guardia ${i + 1}</b>`, { closeButton: false }).addTo(this.map!);
      this.simGuards.push({ id: i + 1, marker, edgeIdx, t, speed: baseSpeed * (0.9 + Math.random()*0.25) });
    }

    this.simTimer = setInterval(() => this.tickGuards(0.2), 200);
  }

  private stopGuardSimulation(): void {
    if (this.simTimer) { clearInterval(this.simTimer); this.simTimer = null; }
    this.simGuards.forEach(g => g.marker.remove());
    this.simGuards = []; this.perimeterPath = []; this.edgeLengths = []; this.totalPerimeter = 0;
  }

  private tickGuards(dt: number): void {
    if (!this.map || !this.perimeterPath.length) return;
    this.simGuards.forEach(g => {
      let remaining = g.speed * dt;
      while (remaining > 0) {
        const Lm = this.edgeLengths[g.edgeIdx];
        const distOnEdge = (1 - g.t) * Lm;
        if (remaining < distOnEdge) { g.t += remaining / Lm; remaining = 0; }
        else { remaining -= distOnEdge; g.edgeIdx = (g.edgeIdx + 1) % (this.perimeterPath.length - 1); g.t = 0; }
      }
      g.marker.setLatLng(this.interpolateOnEdge(g.edgeIdx, g.t));
    });
  }

  private locateAlongPerimeter(offsetMeters: number) {
    let acc = 0;
    for (let i = 0; i < this.edgeLengths.length; i++) {
      const Lm = this.edgeLengths[i];
      if (acc + Lm >= offsetMeters) {
        const t = (offsetMeters - acc) / Lm;
        return { edgeIdx: i, t, coord: this.interpolateOnEdge(i, t) };
      }
      acc += Lm;
    }
    const lastIdx = this.edgeLengths.length - 1;
    return { edgeIdx: lastIdx, t: 0.9999, coord: this.interpolateOnEdge(lastIdx, 0.9999) };
  }

  private interpolateOnEdge(edgeIdx: number, t: number): L.LatLng {
    const a = this.perimeterPath[edgeIdx], b = this.perimeterPath[edgeIdx + 1];
    return L.latLng(a.lat + (b.lat - a.lat) * t, a.lng + (b.lng - a.lng) * t);
  }
  // --- Helpers de contención de punto en polígono ---
// Si no hay perímetro, no bloqueamos (permite activar)
private isInsidePerimeter(lat: number, lng: number): boolean {
  if (!this.perimeterPolygon) return true;

  // 1) Filtro rápido por bounding box (rápido)
  const ll = L.latLng(lat, lng);
  const bounds = this.perimeterPolygon.getBounds();
  if (!bounds.contains(ll)) return false;

  // 2) Chequeo exacto punto-en-polígono (ray casting)
  const rings = this.perimeterPolygon.getLatLngs() as L.LatLng[][] | L.LatLng[];
  const ring: L.LatLng[] = Array.isArray(rings[0]) ? (rings as L.LatLng[][])[0] : (rings as L.LatLng[]);

  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].lat, yi = ring[i].lng;
    const xj = ring[j].lat, yj = ring[j].lng;

    const intersect = ((yi > lng) !== (yj > lng)) &&
                      (lat < (xj - xi) * (lng - yi) / (yj - yi + 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

}