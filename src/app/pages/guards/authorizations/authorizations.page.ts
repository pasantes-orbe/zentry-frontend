import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

// Servicios / storage
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { GuardsService } from 'src/app/services/guards/guards.service';
import { CheckInService } from 'src/app/services/check-in/check-in.service';

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

  // Nuevo feed unificado
  public pendingFeed: any[] = [];
  public futureFeed: any[] = [];

  // Resumen de asistencia de recurrentes (semana)
  public attendanceFromISO: string = '';
  public attendanceToISO: string = '';
  public attendanceDays: string[] = []; // YYYY-MM-DD
  public attendanceItems: any[] = [];

  private userID!: number | string;
  private user_name!: string;
  private user_lastname!: string;
  public countryID!: number | string; // Público para pasarlo al componente hijo

  private socket!: Socket;

  @ViewChild('incomes') incomes: any;

  private openCheckins: any[] = [];
  private refreshTimer: any = null;
  private midnightTimer: any = null;
  private resumeSub: any = null;

  constructor(
    private alertCtrl: AlertController,
    private platform: Platform,
    private wsService: WebSocketService,
    private userStorage: UserStorageService,
    private countryStorage: CountryStorageService,
    private guardsService: GuardsService,
    private checkInService: CheckInService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.initIdentity();
    this.initSocket();
    this.listenSocketEvents();
    await this.refreshAll();
    this.scheduleMidnightRefresh();
  }

  // Normaliza estructura de ítems del feed pending/future
  private normalizePendingItem(raw: any) {
    const guest_name = raw?.guest_name ?? raw?.guest?.name ?? '';
    const guest_lastname = raw?.guest_lastname ?? raw?.guest?.lastname ?? '';
    const dni = raw?.dni ?? raw?.DNI ?? raw?.guest?.dni ?? '';
    const id_owner = raw?.id_owner ?? raw?.owner_id ?? null;
    const id_country = raw?.id_country ?? raw?.country_id ?? this.countryID ?? null;
    const id_property = raw?.id_property ?? raw?.property_id ?? raw?.owner?.property?.id ?? null;
    const available_for_checkin = raw?.available_for_checkin === true;
    const scheduled_at = raw?.scheduled_at ?? raw?.date ?? raw?.income_date ?? null;
    const type = (raw?.type ?? '').toString().toLowerCase();
    return {
      ...raw,
      guest_name,
      guest_lastname,
      dni,
      id_owner,
      id_country,
      id_property,
      available_for_checkin,
      scheduled_at,
      type
    };
  }

  // Navegar a formulario de Check-In con datos prellenados
  public goToCheckinFromItem(item: any) {
    const qp: any = {};
    if (item?.guest_name) qp.name = item.guest_name;
    if (item?.guest_lastname) qp.lastname = item.guest_lastname;
    if (item?.dni) qp.DNI = item.dni;
    if (item?.id_owner != null) qp.ownerID = String(item.id_owner);
    this.router.navigate(['/checkin'], { queryParams: qp });
  }

  ionViewWillEnter() {
    this.triggerRefresh();
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.off('notificacion-nuevo-confirmedByOwner');
      this.socket.off('autorizacion-creada');
      this.socket.disconnect();
    }
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (this.midnightTimer) clearTimeout(this.midnightTimer);
    if (this.resumeSub?.unsubscribe) this.resumeSub.unsubscribe();
  }

  // ================== Refresh & Open Checkins ==================
  private async refreshAll() {
    await this.loadAuthorizations();
    await this.loadRecurrentAttendance();
    this.loadOpenCheckins();
  }

  private loadOpenCheckins() {
    try {
      this.checkInService.getAllCheckoutFalse().subscribe({
        next: (rows: any[]) => {
          this.openCheckins = Array.isArray(rows) ? rows : [];
        },
        error: () => {
          this.openCheckins = [];
        }
      });
    } catch {
      this.openCheckins = [];
    }
  }

  private triggerRefresh(delayMs: number = 450) {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      this.refreshAll();
    }, delayMs);
  }

  private scheduleMidnightRefresh() {
    try {
      if (this.midnightTimer) clearTimeout(this.midnightTimer);
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1, 0); // 00:00:01
      const ms = Math.max(1000, next.getTime() - now.getTime());
      this.midnightTimer = setTimeout(() => {
        this.refreshAll();
        this.scheduleMidnightRefresh();
      }, ms);
    } catch {}
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
  }

  private initSocket() {
    this.socket = io(environment.URL, { transports: ['websocket'] });
  }

  private listenSocketEvents() {
    this.socket.on('notificacion-nuevo-confirmedByOwner', async () => {
      if (this.incomes?.actualizarListaCheckIn) this.incomes.actualizarListaCheckIn();
      this.triggerRefresh();
    });

    this.socket.on('autorizacion-creada', async () => {
      this.triggerRefresh();
    });

    this.socket.on('checkout-completed', async () => {
      this.triggerRefresh();
    });
  }

  // ================== Data ==================
  async loadAuthorizations() {
    console.log('[AuthorizationsPage] 🔄 loadAuthorizations() called');
    
    this.isLoading = true;
    try {
      console.log('[AuthorizationsPage] Fetching data for countryID:', this.countryID);

      // Cargar lista clásica solo si hay countryID disponible
      if (this.countryID) {
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
      } else {
        console.warn('[AuthorizationsPage] countryID no disponible: se omite lista clásica para evitar error');
        this.authorizations = [];
      }

      // Cargar feed unificado (pendientes de check-in y reservas futuras)
      try {
        const params = this.countryID ? { id_country: this.countryID } as any : {};
        const feed = await this.guardsService.getPendingCheckinFeed(params).toPromise();
        this.pendingFeed = Array.isArray(feed?.pending) ? feed!.pending.map(it => this.normalizePendingItem(it)) : [];
        this.futureFeed = Array.isArray(feed?.future) ? feed!.future.map(it => this.normalizePendingItem(it)) : [];
        console.log('[AuthorizationsPage] Feed pending/future:', this.pendingFeed.length, this.futureFeed.length);
      } catch (e) {
        console.warn('[AuthorizationsPage] No se pudo cargar pending-checkin feed:', e);
        this.pendingFeed = [];
        this.futureFeed = [];
      }
    } catch (err) {
      console.error('[AuthorizationsPage] ❌ Load error:', err);
      // No bloquear UI en pruebas visuales
    } finally {
      this.isLoading = false;
    }
  }

  // ================== Attendance (Recurrentes) ==================
  private computeCurrentWeekWindow(): { fromISO: string; toISO: string; days: string[] } {
    const now = new Date();
    const day = now.getDay(); // 0=Dom ... 6=Sab
    const diffToMonday = (day === 0 ? -6 : 1 - day); // Lunes
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(toYMD(d));
    }

    return {
      fromISO: new Date(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0, 0)).toISOString(),
      toISO: new Date(Date.UTC(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999)).toISOString(),
      days
    };
  }

  private async loadRecurrentAttendance() {
    try {
      if (!this.countryID) return;
      const win = this.computeCurrentWeekWindow();
      this.attendanceFromISO = win.fromISO;
      this.attendanceToISO = win.toISO;
      this.attendanceDays = win.days;
      const res = await this.guardsService.getRecurrentAttendance({
        id_country: this.countryID,
        from: this.attendanceFromISO,
        to: this.attendanceToISO,
      }).toPromise();
      this.attendanceItems = Array.isArray(res?.items) ? res!.items : [];
    } catch (e) {
      console.warn('[AuthorizationsPage] No se pudo cargar recurrent-attendance:', e);
      this.attendanceItems = [];
    }
  }

  public isPassed(item: any, ymd: string): boolean {
    return Array.isArray(item?.days_passed) && item.days_passed.includes(ymd);
  }
  public isMissing(item: any, ymd: string): boolean {
    return Array.isArray(item?.days_missing) && item.days_missing.includes(ymd);
  }
  public isToday(ymd: string): boolean {
    const today = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    const t = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    return ymd === t;
  }

  // Día autorizado si pertenece a days_passed ∪ days_missing
  public isAuthorized(item: any, ymd: string): boolean {
    return this.isPassed(item, ymd) || this.isMissing(item, ymd);
  }

  // ¿El recurrente está adentro hoy? Se determina por check-ins abiertos (checkout=false)
  private isOpenToday(item: any): boolean {
    if (!this.openCheckins?.length) return false;
    const dni = String(item?.dni ?? item?.DNI ?? '').trim();
    if (!dni) return false;
    const today = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    const ymd = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    return this.openCheckins.some((c: any) => {
      const cDni = String(c?.DNI ?? c?.dni ?? '').trim();
      // Comparar por DNI y fecha (ignorar hora)
      const d = c?.income_date ? new Date(c.income_date) : null;
      const cYmd = d && !isNaN(d.getTime()) ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : null;
      const open = c?.checkout === false || c?.check_out === false || c?.is_open === true;
      return open && cDni && cDni === dni && cYmd === ymd;
    });
  }

  // Color según reglas solicitadas
  public getDayColor(item: any, ymd: string): string | undefined {
    if (!this.isAuthorized(item, ymd)) return undefined;
    const today = new Date();
    const [y, m, d] = ymd.split('-').map(n => parseInt(n, 10));
    const date = new Date(y, (m || 1) - 1, d || 1);
    const isToday = this.isToday(ymd);

    if (isToday) {
      if (this.isMissing(item, ymd)) return 'warning'; // hoy aún no vino
      if (this.isPassed(item, ymd)) return this.isOpenToday(item) ? 'success' : 'danger'; // verde si adentro, rojo si ya salió
      return undefined;
    }

    // Pasado
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      if (this.isPassed(item, ymd)) return 'success'; // asistió
      if (this.isMissing(item, ymd)) return 'warning'; // ausente
      return undefined;
    }

    // Futuro: normalmente no autorizado (no mostrar)
    return undefined;
  }

  public getDayOutline(item: any, ymd: string): boolean {
    // Días habilitados: chip sólido (sin outline)
    return !this.isAuthorized(item, ymd);
  }

  // Etiqueta de día en español: 'Lun 03'
  public formatDayEs(ymd: string): string {
    try {
      // Espera 'YYYY-MM-DD'
      const [y, m, d] = ymd.split('-').map(v => parseInt(v, 10));
      if (!y || !m || !d) return ymd;
      const date = new Date(y, m - 1, d);
      const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dd = d < 10 ? `0${d}` : String(d);
      return `${dias[date.getDay()]} ${dd}`;
    } catch {
      return ymd;
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
