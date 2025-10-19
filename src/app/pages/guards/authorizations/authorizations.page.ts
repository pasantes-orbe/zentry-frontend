import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, Platform } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

// Servicios / storage
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { GuardsService } from 'src/app/services/guards/guards.service';

// Componentes opcionales
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
  public searchKey = '';
  public isLoading = false;
  public authorizations: AuthorizationItem[] = [];
  public recurrentsState = false;

  private userID!: number | string;
  private user_name!: string;
  private user_lastname!: string;
  public countryID!: number | string; // Público para pasarlo al componente hijo

  private socket!: Socket;

  @ViewChild('incomes') incomes: any;

  constructor(
    private alertCtrl: AlertController,
    private platform: Platform,
    private wsService: WebSocketService,
    private userStorage: UserStorageService,
    private countryStorage: CountryStorageService,
    private guardsService: GuardsService
  ) {}

  async ngOnInit() {
    await this.initIdentity();
    this.initSocket();
    this.listenSocketEvents();
    await this.loadAuthorizations();
  }

  ionViewWillEnter() {
    this.loadAuthorizations();
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.off('notificacion-nuevo-confirmedByOwner');
      this.socket.off('autorizacion-creada');
      this.socket.disconnect();
    }
  }

  // ================== Init ==================
  private async initIdentity() {
    const user = await this.userStorage.getUser();
    const country = await this.countryStorage.getCountry();

    console.log('[AuthorizationsPage] User from storage:', user);
    console.log('[AuthorizationsPage] Country from storage:', country);

    if (user) {
      this.userID = user.id;
      this.user_name = user.name;
      this.user_lastname = user.lastname;
    }
    if (country) {
      this.countryID = country.id;
      console.log('[AuthorizationsPage] Country ID set to:', this.countryID);
    } else {
      console.warn('[AuthorizationsPage] ⚠️ No country found in storage!');
    }

    this.wsService.escucharNotificacionesAntipanico?.();
  }

  private initSocket() {
    this.socket = io(environment.URL, { transports: ['websocket'] });
  }

  private listenSocketEvents() {
    this.socket.on('notificacion-nuevo-confirmedByOwner', async () => {
      if (this.incomes?.actualizarListaCheckIn) this.incomes.actualizarListaCheckIn();
      await this.loadAuthorizations();
    });

    this.socket.on('autorizacion-creada', async () => {
      await this.loadAuthorizations();
    });
  }

  // ================== Data ==================
  async loadAuthorizations() {
    console.log('[AuthorizationsPage] 🔄 loadAuthorizations() called');
    
    if (!this.countryID) {
      console.error('[AuthorizationsPage] ❌ No countryID available. Cannot load authorizations.');
      this.presentSimple('No se pudo obtener el ID del country. Verifica tu sesión.');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    try {
      console.log('[AuthorizationsPage] Fetching data for countryID:', this.countryID);
      
      const [auths, recurrents] = await Promise.all([
        this.guardsService.getConfirmedAuthorizations(this.countryID).toPromise(),
        this.guardsService.getRecurrentsByCountry(this.countryID).toPromise()
      ]);

      console.log('[AuthorizationsPage] ✅ Confirmed authorizations:', auths);
      console.log('[AuthorizationsPage] ✅ Recurrents:', recurrents);

      const merged = [
        ...(auths || []),
        ...(recurrents || []).map((r: any) => ({
          ...r,
          type: 'Recurrente'
        }))
      ];

      console.log('[AuthorizationsPage] Merged data (before mapping):', merged);
      this.authorizations = merged.map(this.mapToAuthorizationItem);
      console.log('[AuthorizationsPage] Final authorizations:', this.authorizations);
    } catch (err) {
      console.error('[AuthorizationsPage] ❌ Load error:', err);
      this.presentSimple('No se pudieron cargar las autorizaciones. Revisa la consola para más detalles.');
    } finally {
      this.isLoading = false;
    }
  }

  private mapToAuthorizationItem = (raw: any): AuthorizationItem => {
    const name =
      raw?.guest_name ??
      `${raw?.guest_name ?? ''} ${raw?.guest_lastname ?? ''}`.trim() ??
      `${raw?.guest?.name ?? ''} ${raw?.guest?.lastname ?? ''}`.trim();

    const dni = raw?.DNI ?? raw?.guest?.dni ?? raw?.dni ?? '';

    const lot = raw?.owner?.property?.number ?? raw?.lot ?? raw?.owner?.lot ?? '';
    const family =
      raw?.owner?.family_name ??
      raw?.owner?.name ??
      raw?.user?.name ??
      'Propietario';

    const authorizedLabel = lot ? `${family} (Lote ${lot})` : family;

    return {
      id: raw?.id ?? raw?._id ?? `${name}-${dni}`,
      guest_name: name || '—',
      DNI: dni || '—',
      type: raw?.type ?? 'Visita',
      authorized_by: authorizedLabel,
      created_at: raw?.income_date ?? raw?.created_at ?? raw?.date
    };
  };

  public toggleRecurrents() {
    this.recurrentsState = !this.recurrentsState;
  }

  private async presentSimple(message: string) {
    const a = await this.alertCtrl.create({ header: 'Atención', message, buttons: ['OK'] });
    await a.present();
  }
}
