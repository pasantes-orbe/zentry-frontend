//conutry-map.ts
import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';

// Componentes de Ionic que usa el HTML
import { IonicModule } from '@ionic/angular';

// Servicios y otros
import { AntipanicService } from 'src/app/services/antipanic/antipanic.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { io, Socket } from 'socket.io-client'; 
import { environment } from 'src/environments/environment';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { GuardPointInterface } from 'src/app/interfaces/guardsPoints-interface';
import { CountriesService } from 'src/app/services/countries/countries.service';

// Fix para iconos de Leaflet en Angular
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
  protected antipanicState: boolean = false; 
  protected antipanicID: any;
  protected activeGuards: GuardPointInterface[] = [];
  public countryLat: number = 0;
  public countryLng: number = 0;
  public markers: L.CircleMarker[] = [];
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
    const owner = await this._ownerStorage.getOwner();
    this.id_user = owner.user.id;
    this.id_country = owner.property.id_country.toString();
    
    // Configuración de Socket listeners
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('get-actives-guards', (payload) => {
      this.removeMarkers();
      this.activeGuards = payload;
      this.activeGuards.forEach((data) => {
        if (data.id_country == this.id_country) {
          this.addPoint(data.lat, data.lng, `Vigilador: <b>${data.user_name} - ${data.user_lastname}</b>`);
        }
      });
    });

    this.socket.on('guardDisconnected', (payload) => {
      this.removeMarkers();
    });

    this.socket.on('notificacion-antipanico-finalizado', (payload) => {
      console.log(payload);
      this.antipanicState = false;
      const box = document.querySelector('.box') as HTMLElement;
      if (box) {
        box.style.display = 'none';
      }
      this._alerts.presentAlertFinishAntipanicDetails(payload['antipanic']['details']);
    });
  }

  async ngAfterViewInit() {
    const owner = await this._ownerStorage.getOwner();
    const countryID = owner.property.id_country;
      
    // Obtener coordenadas del país y inicializar mapa
    this._countryService.getByID(countryID).subscribe(res => {
      this.countryLat = res['latitude'];
      this.countryLng = res['longitude'];
      this.initMap(res['latitude'], res['longitude']);
    });
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.map) {
      this.map.remove();
    }
  }
  
  public getTileLayer(): L.TileLayer | null {
    return this.tileLayer;
  }

  ionViewWillEnter() {
    this.socket.emit('owner-connected', this.id_user);
  }
  
  public setTileLayer(url: string): void {
    this.tileLayer = L.tileLayer(url, {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    });
  }

  private initMap(mapLat: number, mapLng: number): void {
    // Detectar tema oscuro/claro
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches) {
      this.setTileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png');
    } else {
      this.setTileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png');
    }

    // Crear mapa
    this.map = L.map('map', {
      zoomControl: true,
      layers: [this.getTileLayer()!],
    }).setView([mapLat, mapLng], 15);

    // Fix para el tamaño del mapa
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize(true);
      }
    }, 100);

    // Listener para cambios de tema
    prefersDark.addEventListener('change', (e) => {
      if (this.map && this.tileLayer) {
        this.map.removeLayer(this.tileLayer);
        if (e.matches) {
          this.setTileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png');
        } else {
          this.setTileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png');
        }
        this.map.addLayer(this.getTileLayer()!);
      }
    });
  }

  public addPoint(lat: number, lng: number, html: string = ''): void {
    if (!this.map) return;

    const marker = L.circleMarker([lat, lng], {
      color: '#ff0000',
      fillColor: '#ff0000',
      fillOpacity: 0.7,
      radius: 8,
      weight: 2
    })
    .bindPopup(html, { closeButton: false })
    .addTo(this.map);

    this.markers.push(marker);
  }

  public removeMarker(marker: L.CircleMarker): void {
    if (this.map) {
      this.map.removeLayer(marker);
    }
  }

  public removeMarkers(): void {
    this.markers.forEach(marker => {
      this.removeMarker(marker);
    });
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
    if (box) {
      box.style.display = 'block';
    }
    this.ionViewWillEnter();

    this.antipanicState = true;

    const owner = await this._ownerStorage.getOwner();
    const ownerID = owner.user.id;
    const ownerAddress = owner.property.address;
    const ownerName = owner.user.name;
    const ownerLastName = owner.user.lastname;
    const countryID = owner.property.id_country;
    const propertyNumber = owner.property.number;
    
    this._antipanicService.activateAntipanic(ownerID, ownerAddress, countryID, propertyNumber).subscribe(
      res => {
        console.log(res);
        this.antipanicID = res['antipanic']['id'];
        this._socketService.notificarAntipanico({
          res,
          ownerName,
          ownerLastName
        });
      }
    );
  }

  async desactivateAntipanic() {
    this.presentAlert();
  }

  public async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Cancelar Antipanico',
      message: '¿Está seguro de cancelar la situación antipánico?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Autorizar',
          role: 'confirm',
          handler: () => {
            this.antipanicState = false;
            const box = document.querySelector('.box') as HTMLElement;
            if (box) {
              box.style.display = 'none';
            }
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.antipanicState = true;
          },
        }
      ],
    });

    await alert.present();
  }
}










/*import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';

// Componentes de Ionic que usa el HTML
import { IonicModule } from '@ionic/angular';

// Servicios y otros
import { AntipanicService } from 'src/app/services/antipanic/antipanic.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { io, Socket } from 'socket.io-client'; 
import { environment } from 'src/environments/environment';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { GuardPointInterface } from 'src/app/interfaces/guardsPoints-interface';
import { CountriesService } from 'src/app/services/countries/countries.service';

// Fix para iconos de Leaflet en Angular
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
  protected antipanicState: boolean = false; 
  protected antipanicID: any;
  protected activeGuards: GuardPointInterface[] = [];
  public countryLat: number = 0;
  public countryLng: number = 0;
  public markers: L.CircleMarker[] = [];
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
    // Comentamos la conexión real del socket para el modo simulación
    // this.socket = io(environment.URL);
  }

  async ngOnInit() { 
    // Intentamos obtener los datos del storage. Si falla, no hay problema en modo simulación.
    try {
      const owner = await this._ownerStorage.getOwner();
      if (owner && owner.user) {
        this.id_user = owner.user.id;
        this.id_country = owner.property.id_country.toString();
      }
    } catch (error) {
      console.warn('No se pudieron obtener los datos del owner del storage (normal en modo simulación).');
    }
    
    // Desactivamos los listeners del socket real
    // this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return; // No hacer nada si el socket no está inicializado
    
    this.socket.on('get-actives-guards', (payload) => {
      this.removeMarkers();
      this.activeGuards = payload;
      this.activeGuards.forEach((data) => {
        if (data.id_country == this.id_country) {
          this.addPoint(data.lat, data.lng, `Vigilador: <b>${data.user_name} - ${data.user_lastname}</b>`);
        }
      });
    });

    this.socket.on('guardDisconnected', (payload) => {
      this.removeMarkers();
    });

    this.socket.on('notificacion-antipanico-finalizado', (payload) => {
      console.log(payload);
      this.antipanicState = false;
      const box = document.querySelector('.box') as HTMLElement;
      if (box) {
        box.style.display = 'none';
      }
      this._alerts.presentAlertFinishAntipanicDetails(payload['antipanic']['details']);
    });
  }
  
  async ngAfterViewInit() {
    // Coordenadas exactas para centrar el mapa en "La Rivera"
    const latitudLaRivera = -27.4302;
    const longitudLaRivera = -58.9643;
  
    console.log('MODO SIMULACIÓN: Inicializando mapa en "La Rivera" con coordenadas precisas.');
    this.initMap(latitudLaRivera, longitudLaRivera);
  
    // Llamamos a la función que simula los guardias en sus puestos exactos
    this._simularGuardiasLaRivera(); 
  }

  private _simularGuardiasLaRivera(): void {
    console.log('MODO SIMULACIÓN: Creando guardias en puestos exactos de "La Rivera".');

    // Puestos exactos de los guardias (Entrada, Medio, Fondo)
    const guardiasFalsos = [
      { lat: -27.429969, lng: -58.963919, user_name: 'Guardia-Entrada', user_lastname: 'Colussi.F' },
      { lat: -27.427316, lng: -58.964532, user_name: 'Guardia-Centro', user_lastname: 'Escalante.C' },
      { lat: -27.423088, lng: -58.965417, user_name: 'Guardia-Fondo', user_lastname: 'Zaracho.B' }
    ];
    this.removeMarkers(); // Limpia marcadores anteriores
    
    guardiasFalsos.forEach(guardia => {
      const popupHtml = `Vigilador: <b>${guardia.user_name} ${guardia.user_lastname}</b>`;
      this.addPoint(guardia.lat, guardia.lng, popupHtml);
    });
  }


  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.map) {
      this.map.remove();
    }
  }
  
  public getTileLayer(): L.TileLayer | null {
    return this.tileLayer;
  }

  ionViewWillEnter() {
    if (this.socket) {
        this.socket.emit('owner-connected', this.id_user);
    }
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

    // --- INICIO DE LA MODIFICACIÓN: DEFINIR PERÍMETRO ---

    // 1. Defini las esquinas del perimetro alrededor de La Rivera.
    const southWest = L.latLng(-27.430294, -58.963896); // Esquina inferior izquierda
    const northEast = L.latLng(-27.421497, -58.966106); // Esquina superior derecha
    const bounds = L.latLngBounds(southWest, northEast);

    // --- FIN DE LA MODIFICACIÓN ---

    // Detectar tema oscuro/claro
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches) {
      this.setTileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png');
    } else {
      this.setTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    }

    // Crear mapa
    this.map = L.map('map', {
      zoomControl: true,
      layers: [this.getTileLayer()!],
      maxBounds: bounds, // <-- 2. APLICAMOS EL PERÍMETRO
      maxBoundsViscosity: 1.0 // <-- Opcional: Hace que el límite sea "sólido"
    }).setView([mapLat, mapLng], 15);

    // También es buena idea ajustar el zoom mínimo para que no se aleje demasiado
    this.map.setMinZoom(17);

    // Fix para el tamaño del mapa
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize(true);
      }
    }, 100);

    // ... (el resto de la función sigue igual) ...
  }

  public addPoint(lat: number, lng: number, html: string = ''): void {
    if (!this.map) return;

    const marker = L.circleMarker([lat, lng], {
      color: '#ff0000',
      fillColor: '#ff0000',
      fillOpacity: 0.7,
      radius: 8,
      weight: 2
    })
    .bindPopup(html, { closeButton: false })
    .addTo(this.map);

    this.markers.push(marker);
  }

  public removeMarker(marker: L.CircleMarker): void {
    if (this.map) {
      this.map.removeLayer(marker);
    }
  }

  public removeMarkers(): void {
    this.markers.forEach(marker => {
      this.removeMarker(marker);
    });
    this.markers = [];
  }

  public getMarkers(): L.CircleMarker[] {
    return this.markers;
  }

  public getMap(): L.Map | null {
    return this.map;
  }

  // Las funciones de antipánico se mantienen, pero no se conectarán al socket real
  async activateAntipanic() {
    const box = document.querySelector('.box') as HTMLElement;
    if (box) {
      box.style.display = 'block';
    }
    this.antipanicState = true;
    console.log('MODO SIMULACIÓN: Antipanico activado. No se enviará notificación.');
    // La llamada real al servicio se puede comentar para no generar errores
    /*
    const owner = await this._ownerStorage.getOwner();
    const ownerID = owner.user.id;
    // ...resto de la lógica
    this._antipanicService.activateAntipanic(...).subscribe(...)
    */
  /*} 

  async desactivateAntipanic() {
    this.presentAlert();

  }
  public async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Cancelar Antipanico',
      message: '¿Está seguro de cancelarantipánico?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Autorizar',
          role: 'confirm',
          handler: () => {
            this.antipanicState = false;
            const box = document.querySelector('.box') as HTMLElement;
            if (box) {
              box.style.display = 'none';
            }
            console.log('MODO SIMULACIÓN: Antipanico desactivado.');
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.antipanicState = true;
          },
        }
      ],
    });

    await alert.present();
  }
}*/