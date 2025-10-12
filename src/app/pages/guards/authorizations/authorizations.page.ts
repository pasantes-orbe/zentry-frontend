import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, Platform } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

import { Geolocation } from '@capacitor/geolocation';

import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

// Servicios / storage
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { IntervalStorageService } from 'src/app/services/storage/interval-storage.service';
import { GuardsService } from 'src/app/services/guards/guards.service';

// Componentes opcionales que ya tenías (si no los usás, podés quitar import)
import { RecurrentsViewAllComponent } from 'src/app/components/recurrentsViewAll/recurrents-view-all/recurrents-view-all.component';

// ==== Tipos locales (adaptá si tu backend devuelve otro shape) ====
interface AuthorizationItem {
  id: number | string;
  guest_name: string;
  DNI: string;
  type: string;                // 'Visita Única' | 'Personal Recurrente' | etc.
  authorized_by: string;       // Ej: "Familia Gomez (Lote 12A)"
  created_at?: string;         // ISO
}

@Component({
  selector: 'app-authorizations',
  templateUrl: './authorizations.page.html',
  styleUrls: ['./authorizations.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    FilterByPipe,
    RecurrentsViewAllComponent
  ]
})
export class AuthorizationsPage implements OnInit, OnDestroy {

  // ======= Estado UI =======
  public searchKey = '';
  public isLoading = false;
  public authorizations: AuthorizationItem[] = [];
  public recurrentsState = false;

  // ======= Ubicación/usuario/país =======
  private userID!: number | string;
  private user_name!: string;
  private user_lastname!: string;
  private countryID!: number | string;

  // ======= Socket / interval =======
  private socket!: Socket;
  private positionTimerId: number | null = null;

  // (Solo si usás un hijo con método actualizarListaCheckIn; si no, podés quitarlo)
  @ViewChild('incomes') incomes: any;

  constructor(
    private alertCtrl: AlertController,
    private platform: Platform,
    private wsService: WebSocketService,
    private userStorage: UserStorageService,
    private countryStorage: CountryStorageService,
    private intervalStorage: IntervalStorageService,
    private guardsService: GuardsService
  ) {}

  // ================== Lifecycle ==================
  async ngOnInit() {
    await this.initIdentity();
    this.initSocket();
    this.listenSocketEvents();
    await this.loadAuthorizations();   // carga inicial
    await this.startPositionLoop();    // comienza a enviar posición
  }

  ionViewWillEnter() {
    // refresco ligero al entrar
    this.loadAuthorizations();
  }

  ngOnDestroy() {
    // parar interval
    if (this.positionTimerId !== null) {
      window.clearInterval(this.positionTimerId);
      this.positionTimerId = null;
    }
    // limpiar socket
    if (this.socket) {
      this.socket.off('notificacion-nuevo-confirmedByOwner');
      this.socket.off('autorizacion-creada');
      this.socket.disconnect();
    }
  }

  // ================== Init helpers ==================
  private async initIdentity() {
    const user = await this.userStorage.getUser();
    const country = await this.countryStorage.getCountry();

    if (user) {
      this.userID = user.id;
      this.user_name = user.name;
      this.user_lastname = user.lastname;
    }
    if (country) this.countryID = country.id;

    // El servicio propio (si muestra alertas antipánico internas)
    this.wsService.escucharNotificacionesAntipanico?.();
  }

  private initSocket() {
    this.socket = io(environment.URL, { transports: ['websocket'] });
  }

  private listenSocketEvents() {
    // Cuando se confirma un ingreso por propietario, podría afectar las autorizaciones visibles
    this.socket.on('notificacion-nuevo-confirmedByOwner', async (_payload: any) => {
      // Si tenés un hijo con este método, lo llamás; si no, solo refrescás lista
      if (this.incomes?.actualizarListaCheckIn) {
        this.incomes.actualizarListaCheckIn();
      }
      await this.loadAuthorizations();
    });

    // Evento genérico para cuando se crea una autorización
    this.socket.on('autorizacion-creada', async (_payload: any) => {
      await this.loadAuthorizations();
    });
  }

  // ================== Data ==================
  async loadAuthorizations() {
    this.isLoading = true;
    try {
      // Ajustá este método al que tengas en tu GuardsService:
      // Ejemplos posibles:
      // const res = await firstValueFrom(this.guardsService.getAuthorizationsByCountryId(this.countryID));
      // const res = await firstValueFrom(this.guardsService.getPendingAuthorizations(this.countryID));
      const res$ = (this.guardsService as any).getAuthorizationsByCountryId
        ? (this.guardsService as any).getAuthorizationsByCountryId(this.countryID)
        : (this.guardsService as any).getPendingAuthorizations(this.countryID);

      const res = await new Promise<any[]>((resolve, reject) => {
        res$?.subscribe({ next: resolve, error: reject });
      });

      this.authorizations = (res || []).map(this.mapToAuthorizationItem);
    } catch (err) {
      console.error('[Authorizations] load error', err);
      this.presentSimple('No se pudieron cargar las autorizaciones.');
    } finally {
      this.isLoading = false;
    }
  }

  private mapToAuthorizationItem = (raw: any): AuthorizationItem => {
    // Normaliza los campos para la UI
    const name = raw?.guest_name ?? `${raw?.guest?.name ?? ''} ${raw?.guest?.lastname ?? ''}`.trim();
    const dni = raw?.DNI ?? raw?.guest?.dni ?? '';
    const type = raw?.type ?? raw?.authorization_type ?? 'Visita';
    const lot =
      raw?.authorized_by?.lot ??
      raw?.owner?.lot ??
      raw?.lot ??
      '';
    const family =
      raw?.authorized_by?.family_name ??
      raw?.owner?.family_name ??
      raw?.owner?.name ??
      raw?.user?.name ??
      'Propietario';

    const authorizedLabel = lot ? `${family} (Lote ${lot})` : family;

    return {
      id: raw?.id ?? raw?._id ?? `${name}-${dni}`,
      guest_name: name || '—',
      DNI: dni || '—',
      type,
      authorized_by: authorizedLabel,
      created_at: raw?.created_at ?? raw?.date
    };
  };

  // ================== Geolocalización loop ==================
  private async startPositionLoop() {
    try {
      // permisos (Capacitor)
      await Geolocation.requestPermissions();
    } catch {
      // Si falla permiso, seguimos intentando con navigator como fallback
    }

    const tick = async () => {
      try {
        // Preferí Capacitor
        const coords = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 5000 });
        const payload = this.buildPositionPayload(coords.coords.latitude, coords.coords.longitude);
        this.socket.emit('nueva-posicion-guardia', payload);
      } catch {
        // Fallback a navigator si Capacitor falla
        navigator.geolocation.getCurrentPosition(
          (resp) => {
            const { latitude, longitude } = resp.coords;
            const payload = this.buildPositionPayload(latitude, longitude);
            this.socket.emit('nueva-posicion-guardia', payload);
          },
          (err) => console.warn('[geo] navigator error', err),
          { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
        );
      }
    };

    // primer envío inmediato
    tick();

    // cada 3s (igual que tenías)
    this.positionTimerId = window.setInterval(tick, 3000);
    // guardo id del interval si lo usás en otras vistas
    this.intervalStorage.saveInterval_id(String(this.positionTimerId));
  }

  private buildPositionPayload(lat: number, lng: number) {
    return {
      lat,
      lng,
      id_user: this.userID,
      id_country: this.countryID,
      user_name: this.user_name,
      user_lastname: this.user_lastname
    };
  }

  // ================== UI actions ==================
  public toggleRecurrents() {
    this.recurrentsState = !this.recurrentsState;
  }

  // ================== Util ==================
  private async presentSimple(message: string) {
    const a = await this.alertCtrl.create({ header: 'Atención', message, buttons: ['OK'] });
    await a.present();
  }
}
