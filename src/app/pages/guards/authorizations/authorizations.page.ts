import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, Platform } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@capacitor/geolocation';

import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

// Servicios / storage
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { IntervalStorageService } from 'src/app/services/storage/interval-storage.service';
import { GuardsService, AuthorizationInterface } from 'src/app/services/guards/guards.service';

// Componente opcional (si lo usás en tu template)
import { RecurrentsViewAllComponent } from 'src/app/components/recurrentsViewAll/recurrents-view-all/recurrents-view-all.component';


interface AuthorizationItem {
  id: number | string;
  guest_name: string;
  DNI: string;
  type: string;
  authorized_by: string;
  created_at?: string;
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

  // ======= Estado general =======
  public searchKey = '';
  public isLoading = false;
  public authorizations: AuthorizationItem[] = [];
  public recurrentsState = false;

  // ======= Usuario / País =======
  private userID!: number | string;
  private user_name!: string;
  private user_lastname!: string;
  private countryID!: number | string;

  // ======= Socket / Interval =======
  private socket!: Socket;
  private positionTimerId: number | null = null;

  // Si tenés un hijo que actualiza lista de ingresos
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

  // ================== Ciclo de vida ==================
  async ngOnInit() {
    await this.initIdentity();
    this.initSocket();
    this.listenSocketEvents();
    await this.loadAuthorizations();
    await this.startPositionLoop();
  }

  ionViewWillEnter() {
    // Refresca cada vez que el guardia entra al tab
    this.loadAuthorizations();
  }

  ngOnDestroy() {
    if (this.positionTimerId !== null) {
      window.clearInterval(this.positionTimerId);
      this.positionTimerId = null;
    }
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

    // Arranca escucha de alertas antipánico (si aplica)
    this.wsService.escucharNotificacionesAntipanico?.();
  }

  private initSocket() {
    this.socket = io(environment.URL, { transports: ['websocket'] });
  }

  private listenSocketEvents() {
    // Cuando un propietario confirma un ingreso → refrescar lista
    this.socket.on('notificacion-nuevo-confirmedByOwner', async () => {
      if (this.incomes?.actualizarListaCheckIn) this.incomes.actualizarListaCheckIn();
      await this.loadAuthorizations();
    });

    // Cuando se crea una nueva autorización
    this.socket.on('autorizacion-creada', async () => {
      await this.loadAuthorizations();
    });
  }

  // ================== Carga de autorizaciones ==================
  async loadAuthorizations() {
    this.isLoading = true;
    try {
      // Llamada directa al método estable del servicio
      const res = await firstValueFrom(
        this.guardsService.getAuthorizationsByCountryId(this.countryID)
      );
      this.authorizations = (res || []).map(this.mapToAuthorizationItem);
    } catch (err) {
      console.error('[Authorizations] load error', err);
      this.presentSimple('No se pudieron cargar las autorizaciones.');
    } finally {
      this.isLoading = false;
    }
  }

  // Mapeo a estructura de UI
  private mapToAuthorizationItem = (raw: AuthorizationInterface): AuthorizationItem => {
    const name = raw?.guest_name ?? `${(raw as any)?.guest?.name ?? ''} ${(raw as any)?.guest?.lastname ?? ''}`.trim();
    const dni = raw?.DNI ?? (raw as any)?.guest?.dni ?? '—';
    const type = raw?.type ?? raw?.authorization_type ?? 'Visita';

    const lot = raw?.lot ?? (raw.owner?.lot ?? '');
    const family =
      (raw.owner?.family_name ?? raw.owner?.name ?? 'Propietario');

    const authorizedLabel = lot ? `${family} (Lote ${lot})` : family;

    return {
      id: raw.id ?? `${name}-${dni}`,
      guest_name: name || '—',
      DNI: dni || '—',
      type,
      authorized_by: authorizedLabel,
      created_at: raw.created_at ?? raw.date
    };
  };

  // ================== Geolocalización ==================
  private async startPositionLoop() {
    try { await Geolocation.requestPermissions(); } catch {}

    const tick = async () => {
      try {
        const coords = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 5000 });
        const payload = this.buildPositionPayload(coords.coords.latitude, coords.coords.longitude);
        this.socket.emit('nueva-posicion-guardia', payload);
      } catch {
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

    tick();
    this.positionTimerId = window.setInterval(tick, 3000);
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

  // ================== Acciones UI ==================
  public toggleRecurrents() {
    this.recurrentsState = !this.recurrentsState;
  }

  // ================== Utilidades ==================
  private async presentSimple(message: string) {
    const a = await this.alertCtrl.create({ header: 'Atención', message, buttons: ['OK'] });
    await a.present();
  }
}
