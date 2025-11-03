// src/app/tab1/tab1.page.ts

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Observable, Subscription } from 'rxjs';

// Ionic standalone
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonAvatar, IonGrid, IonRow, IonCol, IonItem, IonInput,
  IonList, IonModal, IonSelect, IonSelectOption, IonDatetime, IonCheckbox,
  IonToggle, IonRefresher, IonRefresherContent, IonLabel, IonListHeader,
  IonBadge, IonPopover, IonCard, IonCardContent, IonChip,
} from '@ionic/angular/standalone';

// Theme
import { ThemeService } from '../services/theme/theme.service';
import { environment } from 'src/environments/environment';

// Servicios
import { UserStorageService } from '../services/storage/user-storage.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { OwnersService } from '../services/owners/owners.service';
import { OwnerResponse } from '../interfaces/ownerResponse-interface';
import { AlertService } from '../services/helpers/alert.service';
import { ReservationsService } from '../services/amenities/reservations.service';
import { CheckInService } from '../services/check-in/check-in.service';
import { RecurrentsService } from '../services/recurrents/recurrents.service';
import { RecurrentsInterface } from '../interfaces/recurrents-interface';
import { WebSocketService } from '../services/websocket/web-socket.service';
import { AmenitieService } from '../services/amenities/amenitie.service';
import { AmenitieInterface } from '../interfaces/amenitie-interface';
import { Guest } from '../interfaces/reservations-interface';
import { NotificationsService } from '../services/notifications/notifications.service';
import { NotificationsPopoverComponent } from '../components/notifications-popover/notifications-popover';
import { UserService } from '../services/user/user.service';

// Componentes
import { ReservationsComponent } from '../components/reservations/reservations.component';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonAvatar, IonGrid, IonRow, IonCol, IonItem, IonInput,
    IonList, IonModal, IonSelect, IonSelectOption, IonDatetime, IonCheckbox,
    IonToggle, IonRefresher, IonRefresherContent, IonLabel, IonListHeader,
    IonBadge, IonPopover, IonCard, IonCardContent, IonChip,
    NotificationsPopoverComponent,
  ]
})
export class Tab1Page implements OnInit, OnDestroy {

  private loading = true;
  public userID: any;
  protected owner: OwnerResponse | null = null;
  public unreadCount: number = 0;

  // Form (Visita Rápida)
  public guestName = '';
  public guestLastname = '';
  public guestDNI = '';

  // Modals
  public isReservationModalOpen = false;
  public isRecurrentModalOpen = false;

  // Reserva de amenity
  // FIX: Renombrado a selectedAmenityId para coincidir con el template y tipo numérico
  public selectedAmenityId: number | null = null;
  public selectedDate: string = '';
  public selectedTime: string = '';

  public amenities$: Observable<AmenitieInterface[]> | undefined;

  //Invitados
  guestNameReservation: string = '';
  guestLastnameReservation: string = '';
  guestDNIReservation: string = '';
  
  // Array para almacenar los invitados de la reserva
  guests: Guest[] = []; // Inicializar guests como un array vacío
  
  // Recurrentes (Formulario de Gestión)
  public recurrentName = '';
  public recurrentLastname = '';
  public recurrentDNI = '';
  public roleRecurrent = '';
  public selectedDays: string[] = [];
  public weekDays = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  // Lista de recurrentes. Usa la interfaz real y se carga del backend.
  public registeredRecurrents: RecurrentsInterface[] = [];

  // Referencia al componente de reservas
  @ViewChild('reservationsComponent') reservationsComponent!: ReservationsComponent;

  // 1. Observable reactivo para las reservas del owner
  public ownerReservations$: Observable<any[]> | undefined;
  details: null;

  // Subscriptions para notificaciones
  private wsSub?: Subscription;
  private refreshSub?: Subscription;

  private notificationsSubscription: Subscription;

  constructor(
    private router: Router,
    private _userStorageService: UserStorageService,
    private _ownerStorageService: OwnerStorageService,
    private _ownersService: OwnersService,
    private alerts: AlertService,
    public theme: ThemeService,
    private _reservationsService: ReservationsService,
    private _checkInService: CheckInService,
    private _recurrentsService: RecurrentsService,
    private _webSocketService: WebSocketService,
    private _amenitiesService: AmenitieService,
    private _notificationsService: NotificationsService,
    private _userService: UserService,
  ) {
    this.setLoading(true);
    // 2. Conectar al WebSocket al iniciar
    void this._webSocketService.conectar();
  }

  // Normaliza el shape del owner
  private normalizeOwner(owner: OwnerResponse | null): OwnerResponse | null {
    if (!owner) { return null; }
    const normalized: any = { ...(owner as any) };
    if (normalized.id_user) {
      normalized.user = {
        id: normalized.id_user,
        ...(normalized.user || {})
      };
      delete normalized.id_user;
    }
    const properties = Array.isArray(normalized.properties) ? normalized.properties : [];
    const property = normalized.property ?? properties[0] ?? null;
    if (property) {
      normalized.property = {
        ...property,
        id_country:
          property?.id_country !== undefined && property?.id_country !== null
            ? Number(property.id_country)
            : property?.id_country ?? null
      };
    }
    if (Array.isArray(properties)) {
      normalized.properties = properties.map((p: any) => ({
        ...p,
        id_country:
          p?.id_country !== undefined && p?.id_country !== null
            ? Number(p.id_country)
            : p?.id_country ?? null
      }));
    }
    return normalized as OwnerResponse;
  }

  // ngOnInit
  async ngOnInit() {
    this.theme.init('owner');
    try {
      const user = await this._userStorageService.getUser();
      if (user) {
        this.userID = user.id;
        this.initNotifications(this.userID);

        this._ownersService.getByID(this.userID).subscribe({
          next: (owner) => {
            const normalizedOwner = this.normalizeOwner(owner);
            this.owner = normalizedOwner;
            if (normalizedOwner) {
              void this._ownerStorageService.saveOwner(normalizedOwner);
              // Cargar lista de reservas al obtener el Owner
              this.loadOwnerReservations();
              this.loadReservationsAndAmenities(); // Cargar amenities
              // Refrescar datos del usuario (incluido avatar) desde /api/users/:id
              try {
                if (this.userID) {
                  this._userService.getUserByID(this.userID).subscribe((u: any) => {
                    const avatar = u?.avatar;
                    if (avatar && (this as any).owner?.user) {
                      (this as any).owner.user.avatar = avatar;
                    }
                  });
                }
              } catch {}
            }
            this.setLoading(false);
          },
          error: (error) => {
            console.error('Error loading owner:', error);
            this.owner = null;
            this.setLoading(false);
          }
        });
      } else {
        this.setLoading(false);
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.owner = null;
      this.setLoading(false);
    }
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.wsSub = undefined;
    this.refreshSub?.unsubscribe();
    this.refreshSub = undefined;
  }

  private initNotifications(userId: number): void {
    // Cargar lista para contar no leídas
    this._notificationsService.getAllByUser(userId).subscribe({
      next: (list: any[]) => {
        const arr = Array.isArray(list) ? list : [];
        this.unreadCount = arr.filter((n: any) => (typeof n.read === 'boolean' ? !n.read : !n.is_read)).length;
      },
      error: () => { this.unreadCount = 0; }
    });

    // Refrescar badge cuando se marquen como leídas
    this.refreshSub = this._notificationsService.refresh$.subscribe(() => {
      this._notificationsService.getAllByUser(userId).subscribe({
        next: (list: any[]) => {
          const arr = Array.isArray(list) ? list : [];
          this.unreadCount = arr.filter((n: any) => (typeof n.read === 'boolean' ? !n.read : !n.is_read)).length;
        },
        error: () => { this.unreadCount = 0; }
      });
    });

    // Escuchar notificaciones en vivo
    this.wsSub = this._webSocketService.newNotification$.subscribe((payload: any) => {
      if (!payload || typeof payload !== 'object' || payload.id_user == null || Number(payload.id_user) === Number(userId)) {
        this._notificationsService.getAllByUser(userId).subscribe({
          next: (list: any[]) => {
            const arr = Array.isArray(list) ? list : [];
            this.unreadCount = arr.filter((n: any) => (typeof n.read === 'boolean' ? !n.read : !n.is_read)).length;
          },
          error: () => { this.unreadCount = 0; }
        });
      }
    });
  }

  // 3. Método para cargar y mantener la reactividad de reservas
  public loadOwnerReservations() {
    // 3a. Obtener el Observable reactivo del servicio
    this.ownerReservations$ = this._reservationsService.getReservationsByOwner();

    // 3b. Forzar la primera carga (solo la primera vez o en refresh)
    void this._reservationsService.loadOwnerReservations();
  }

  // Asegura contexto del Owner
  private async ensureOwnerContext() {
    try {
      if (this.owner?.user?.id && (this.owner as any)?.property?.id_country) {
        return;
      }
      const stored = await this._ownerStorageService.getOwner();
      if (stored) {
        this.owner = this.normalizeOwner(stored);
        if (this.owner?.user?.id && (this.owner as any)?.property?.id_country) {
          return;
        }
      }
      const user = await this._userStorageService.getUser();
      if (!user?.id) { throw new Error('Sin sesión de usuario'); }

      const owner = await firstValueFrom(this._ownersService.getByID(user.id));
      this.owner = this.normalizeOwner(owner);
      if (this.owner) {
        void this._ownerStorageService.saveOwner(this.owner);
      }
    } catch (error) {
      console.error('No se pudo cargar el owner:', error);
      this.owner = null;
    }
  }

  onThemeToggle(ev: any) {
    const checked = ev?.detail?.checked ?? (ev?.target as HTMLInputElement)?.checked ?? false;
    this.theme.set('owner', checked ? 'dark' : 'light');
  }

  async ionViewWillEnter() {
    // 4. Recargar el contexto y las reservas cada vez que se entra a la vista
    await this.ensureOwnerContext();
    void this.loadRecurrents(); // Recargar recurrentes
    this.loadOwnerReservations(); // Recargar reservas
    this.loadReservationsAndAmenities(); // Cargar amenities
  }

  /**
   * Navega a la página de gestión de ingresos pendientes
   */
  public managePendingCheckins() {
    this.router.navigate(['/pending-checkins']);
  }

  // --- LÓGICA DE VISITA RÁPIDA ---
  public async authorizeQuickVisit() {
    if (!this.guestName.trim() || !this.guestLastname.trim() || !this.guestDNI.trim()) {
      await this.alerts.showAlert('Error', 'Nombre, Apellido y DNI son obligatorios');
      return;
    }

    if (isNaN(Number(this.guestDNI))) {
      await this.alerts.showAlert('Error', 'El DNI debe ser numérico.');
      return;
    }

    try {
      await this.ensureOwnerContext();

      if (!this.owner?.user?.id || !(this.owner as any)?.property?.id_country) {
        await this.alerts.showAlert('Error', 'No se pudo cargar tu perfil de propietario. Reingresá.');
        return;
      }

      const id_owner = this.owner.user.id;
      const id_country = (this.owner as any).property.id_country;
      const income_date = new Date().toISOString();

      await this._checkInService.createCheckInFromOwner(
        this.guestName.trim(),
        this.guestLastname.trim(),
        this.guestDNI.trim(),
        income_date,
        id_owner,
        id_country
      );

      await this.alerts.showAlert(
        'Visita Autorizada',
        `Visita autorizada para:<br><strong>${this.guestName} ${this.guestLastname}</strong><br>DNI: ${this.guestDNI}`
      );

      this.guestName = '';
      this.guestLastname = '';
      this.guestDNI = '';
    } catch (error: any) {
      console.error('Error al autorizar visita rápida:', error);
      let message = 'Ocurrió un error inesperado al autorizar la visita.';
      if (error?.error?.msg) { message = error.error.msg; }
      else if (error?.statusText) { message = `Error de red o conexión: ${error.statusText}`; }
      await this.alerts.showAlert('Error de Autorización', message);
    }
  }

  public onNotificationClick() {
    const notifications = [
      { id: 1, type: 'visit', message: 'Juan Pérez solicitó acceso', time: '10:30 AM' },
      { id: 2, type: 'delivery', message: 'Paquete entregado en recepción', time: '09:15 AM' },
      { id: 3, type: 'maintenance', message: 'Mantenimiento programado mañana', time: 'Ayer' }
    ];
    let message = '<strong>Notificaciones Recientes:</strong><br><br>';
    notifications.forEach(n => {
      const icon = n.type === 'visit' ? '👤' : n.type === 'delivery' ? '📦' : '🔧';
      message += `${icon} ${n.message}<br><small style="color:#666;">${n.time}</small><br><br>`;
    });
    this.alerts.showAlert('Notificaciones', message);
  }

  // --- LÓGICA DE RESERVACIÓN ---
  public reserveAmenity() {
    this.isReservationModalOpen = true;
    this.loadReservationsAndAmenities();
  }

  // confirmReservation usando firstValueFrom y actualización reactiva interna
  public async confirmReservation() {
    if (this.selectedAmenityId === null || !this.selectedDate || !this.selectedTime) {
      this.alerts.showAlert('Error', 'Por favor complete todos los campos.');
      return;
    }

await this.ensureOwnerContext();
  const id_property = (this.owner as any)?.property?.id;
  if (!id_property) {
    this.alerts.showAlert('Error', 'No se pudo obtener la propiedad del propietario. Reingresá.');
    return;
  }

    const dateObj = new Date(this.selectedDate);
    const [hours, minutes] = this.selectedTime.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    const combinedDateTime = dateObj.toISOString();

    const reservationData = {
      id_amenity: Number (this.selectedAmenityId),
      date: combinedDateTime,
      id_property,
      details: this.details ?? null,
      guests: this.guests.map(g => ({
      guest_name: g.name,
        guest_lastname: g.lastname,
        DNI: g.dni
      })) 
    };

    try {
      // Obtener el nombre del amenity para el mensaje de confirmación
      let amenityName = 'Amenity Desconocido';
      const amenities = await firstValueFrom(this.amenities$ as Observable<AmenitieInterface[]>);
      const selectedAmenity = amenities.find(a => a.id === this.selectedAmenityId);
      if(selectedAmenity) {
        amenityName = selectedAmenity.name;
      }
      
      // Esperar la respuesta del POST; la lista se actualiza vía el servicio (loadOwnerReservations)
      await firstValueFrom(this._reservationsService.createReservation(reservationData));

      this.alerts.showAlert('Pedido de Reserva enviada al Administrador');
      this.closeReservationModal();
    } catch (error: any) {
      console.error('Error al crear la reserva:', error);
      if (error?.error?.errors?.length > 0) {
        const msg = error.error.errors[0].msg;
        this.alerts.showAlert('Error', msg);
      } else {
        this.alerts.showAlert('Error', 'Hubo un problema al crear la reserva. Intente de nuevo.');
      }
    }
  }

  addGuestToReservation() {
  if (this.guestNameReservation && this.guestLastnameReservation && this.guestDNIReservation) {
    this.guests.push({
      name: this.guestNameReservation,
      lastname: this.guestLastnameReservation,
      dni: this.guestDNIReservation
    });
    // Limpiar inputs
    this.guestNameReservation = '';
    this.guestLastnameReservation = '';
    this.guestDNIReservation = '';
  }
}

removeGuestFromReservation(index: number) {
  this.guests.splice(index, 1);
}

  loadReservationsAndAmenities() {
    this.amenities$ = this._amenitiesService.getAllByOwner();
  }

  public closeReservationModal() {
    this.isReservationModalOpen = false;
    this.selectedAmenityId = null; // FIX: Resetear a null
    this.selectedDate = '';
    this.selectedTime = '';
  }

  // --- LÓGICA DE RECURRENTES ---
  private async loadRecurrents() {
    await this.ensureOwnerContext();

    const ownerId = this.owner?.user?.id;
    if (!ownerId) {
      console.error('No se pudo obtener el ID del propietario para cargar recurrentes.');
      this.registeredRecurrents = [];
      return;
    }

    this._recurrentsService.getRecurrentsByOwner(ownerId).subscribe({
      next: (data) => {
        this.registeredRecurrents = data;
      },
      error: (err) => {
        console.error('Error al cargar recurrentes:', err);
        this.alerts.showAlert('Error', 'No se pudo cargar la lista de invitados recurrentes.');
        this.registeredRecurrents = [];
      }
    });
  }

  public manageRecurrent() {
    // Cargar la lista del backend antes de abrir
    void this.loadRecurrents();
    this.isRecurrentModalOpen = true;
  }

  public async addRecurrent() {
    // 1. Validar campos requeridos para la API
    if (!this.recurrentName.trim() || !this.recurrentLastname.trim() || !this.recurrentDNI.trim()
      || !this.roleRecurrent.trim() || this.selectedDays.length === 0) {
      await this.alerts.showAlert('Error', 'Nombre, Apellido y DNI son obligatorios');
      return;
    }

    // 2. Asegurar el contexto para obtener id_property
    await this.ensureOwnerContext();
    const id_property = (this.owner as any)?.property?.id;

    if (!id_property) {
      await this.alerts.showAlert('Error', 'No se pudo obtener la propiedad del propietario. Reingresá.');
      return;
    }

    const daysString = this.selectedDays.join(',');

    try {
      await this._recurrentsService.addRecurrent(
        id_property,
        this.recurrentName.trim(),
        this.recurrentLastname.trim(),
        this.recurrentDNI.trim(),
        'owner',                   // userRole
        this.roleRecurrent.trim(), // roleRecurrent
        daysString                 // access_days
      );

      // 4. Recargar la lista del backend
      void this.loadRecurrents();

      // 5. Limpiar el formulario
      this.clearRecurrentForm();
    } catch (error) {
      console.error('Fallo al agregar recurrente:', error);
      this.alerts.showAlert('Error de Registro', 'No se pudo completar el registro del recurrente. Verifique los datos.');
    }
  }

  public async removeRecurrent(id: number) {
    try {
      await this.alerts.setLoading();

      // 1. Llamar al servicio para eliminar
      const result = await firstValueFrom(this._recurrentsService.deleteRecurrent(id));

      // 2. Si es exitoso, recargar la lista
      if (result) {
        await this.loadRecurrents();
        this.alerts.showAlert('Recurrente Eliminado', 'El recurrente ha sido eliminado exitosamente del sistema.');
      } else {
        this.alerts.showAlert('Error', 'No se pudo eliminar el recurrente. Intente de nuevo.');
      }
    } catch (error) {
      console.error('Error al eliminar recurrente:', error);
      this.alerts.showAlert('Error', 'Ocurrió un error inesperado al intentar eliminar.');
    } finally {
      await this.alerts.removeLoading();
    }
  }

  public closeRecurrentModal() {
    this.isRecurrentModalOpen = false;
    this.clearRecurrentForm();
  }

  private clearRecurrentForm() {
    this.recurrentName = '';
    this.recurrentLastname = '';
    this.recurrentDNI = '';
    this.roleRecurrent = '';
    this.selectedDays = [];
  }

  public onDayChange(day: string, event: any) {
    if (event.detail.checked) this.selectedDays.push(day);
    else this.selectedDays = this.selectedDays.filter(d => d !== day);
  }

  public getFormattedDays(days: string | string[] | null | undefined): string {
    if (!days) return 'No especificado';

    const dayValues = Array.isArray(days) ? days : String(days).split(',');

    return dayValues
      .map(d => d.trim())
      .filter(Boolean)
      .map(value => this.weekDays.find(w => w.value === value)?.label ?? value)
      .join(', ');
  }

  protected async doRefresh(event: any) {
    // Recargar Owner y Recurrentes al hacer pull-to-refresh
    await this.ensureOwnerContext();
    await this.loadRecurrents();
    // Forzar recarga de reservas
    void this._reservationsService.loadOwnerReservations();
    this.loadReservationsAndAmenities(); // Recargar amenities
    event.target.complete();
  }

  // Funciones de control de carga
  public isLoading(): boolean { return this.loading; }
  public setLoading(loading: boolean): void { this.loading = loading; }

  // Avatar helpers (mostrar foto real del propietario en el header)
  public getAvatarInitial(): string {
    const n = this.owner?.user?.name ?? '';
    return n ? n.charAt(0).toUpperCase() : 'U';
  }

  public getAvatarUrl(): string {
    const avatar = (this as any)?.owner?.user?.avatar;
    const url = this.normalizeAvatarUrl(avatar);
    if (url) return url;
    return `https://placehold.co/64x64/374151/FFFF?text=${this.getAvatarInitial()}`;
  }
  
  private normalizeAvatarUrl(a: any): string {
    if (!a || typeof a !== 'string' || a.length === 0) return '';
    if (/^https?:\/\//i.test(a)) return a;
    if (a.startsWith('/')) return `${environment.URL}${a}`;
    return `${environment.URL}/${a}`;
  }
}