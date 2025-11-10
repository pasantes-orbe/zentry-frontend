import { Component, OnDestroy, OnInit, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';

// Servicios + tipos
import { CountriesService } from '../../../services/countries/countries.service';
import { CountryStorageService } from '../../../services/storage/country-storage.service';
import { ThemeService } from 'src/app/services/theme/theme.service';
import { CountryInteface } from '../../../interfaces/country-interface';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { NotificationInterface } from 'src/app/interfaces/notification-interface';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { CheckInService } from 'src/app/services/check-in/check-in.service';

// Componentes
import { NavbarAdminComponent } from 'src/app/components/navbars/navbar-admin/navbar-admin.component';
import { NotificationsPopoverComponent } from 'src/app/components/notifications-popover/notifications-popover';

@Component({
  selector: 'app-country-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    NavbarAdminComponent,
    NotificationsPopoverComponent
  ],
  templateUrl: './country-dashboard.page.html',
  styleUrls: ['./country-dashboard.page.scss']
})
export class CountryDashboardPage implements OnInit, OnDestroy {
  @ViewChild(NavbarAdminComponent) navbar?: NavbarAdminComponent;

  // Estado
  loading = true;
  type = 'propiedades'; // segmento activo
  country: CountryInteface | null = null;
  // Control popover usuario
  isUserMenuOpen = false;
  userMenuEvent: any = null;

  // Notificaciones
  notifications: NotificationInterface[] = [];
  unreadCount = 0;
  userIdForNotifications: number | null = null;
  private newNotifSub?: Subscription;
  private notifRefreshSub?: Subscription;

  // Servicios pendientes
  pendingServicesCount = 0;

  // Mock por defecto para poder entrar al dashboard sin data real
  private readonly MOCK_COUNTRY: CountryInteface = {
    id: 0,
    name: 'Demo Country',
    avatar: 'https://placehold.co/800x400?text=Country+Demo',
    image: '',
    latitude: -27.56,
    longitude: -58.75,
    isActive: true
  };

  // Señales/derivadas
  countryName = computed(() => this.country?.name ?? 'Country');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private countriesSvc: CountriesService,
    private countryStorage: CountryStorageService,
    public theme: ThemeService,
    private notificationsSvc: NotificationsService,
    private userStorage: UserStorageService,
    private wsService: WebSocketService,
    private popoverController: PopoverController,
    private checkInService: CheckInService
  ) {}

  async ngOnInit(): Promise<void> {
    // Tema por rol
    this.theme.init('admin');

    try {
      const user = await this.userStorage.getUser().catch(() => null);
      if (user?.id) {
        this.userIdForNotifications = Number(user.id);
      }
    } catch (e) {
      console.error('Error obteniendo ID de usuario para notificaciones', e);
    }

    this.wsService.conectar().catch(err => console.error('❌ Error al conectar el WebSocket en dashboard:', err));
    this.subscribeToNewNotifications();
    // Refrescar contador/lista cuando se marquen como leídas desde el popover
    if (!this.notifRefreshSub) {
      this.notifRefreshSub = this.notificationsSvc.refresh$.subscribe(() => this.loadNotifications());
    }

    // Carga de country por parámetro o query
    const idParam = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.queryParamMap.get('id');
    if (idParam) {
      this.countriesSvc.getByID(+idParam).subscribe({
        next: (c) => {
          this.country = c as CountryInteface;
          this.countryStorage.saveCountry(this.country);
          this.loading = false;
          this.loadNotifications();
          this.loadPendingServices();
        },
        error: async (err) => {
          console.error('No se pudo cargar el country por id:', err);
          await this.loadFromStorageOrMock();
          this.loadNotifications();
          this.loadPendingServices();
        }
      });
      return;
    }

    await this.loadFromStorageOrMock();
    this.loadNotifications();
    this.loadPendingServices();
    this.setupServiceListeners();
  }

  /**
   * Configurar listeners de socket para servicios pendientes
   */
  private setupServiceListeners(): void {
    // Suscribirse al observable de servicios pendientes
    this.wsService.pendingService$.subscribe((event: any) => {
      console.log('[Admin Dashboard] Evento de servicio pendiente recibido:', event);
      
      if (event.type === 'new-service') {
        // Nuevo servicio sin propietario
        const service = event.data;
        this.createServiceNotification({
          title: 'Nuevo Servicio Pendiente',
          content: `${service.guest_name} ${service.guest_lastname} requiere autorización`,
          type: 'service-pending',
          data: service
        });
        this.loadPendingServices();
      } else if (event.type === 'service-approved') {
        // Servicio aprobado
        const approval = event.data;
        this.createServiceNotification({
          title: 'Servicio Autorizado',
          content: `${approval.guest_name} ${approval.guest_lastname} fue autorizado`,
          type: 'service-approved',
          data: approval
        });
        this.loadPendingServices();
      }
    });
  }

  /**
   * Crea una notificación de servicio pendiente y la agrega al array
   */
  private createServiceNotification(notification: any) {
    // Crear objeto de notificación
    const newNotif: any = {
      id: Date.now(), // ID temporal
      title: notification.title,
      content: notification.content,
      type: notification.type,
      id_user: this.userIdForNotifications || 0,
      read: false,
      createdAt: new Date()
    };

    // Agregar al inicio del array
    this.notifications.unshift(newNotif);
    
    // Mantener solo las últimas 10
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10);
    }

    // Incrementar contador de no leídas
    this.unreadCount++;

    console.log('[Admin Dashboard] Notificación de servicio creada:', newNotif);
  }

  private subscribeToNewNotifications(): void {
    if (this.newNotifSub) {
      return;
    }

    this.newNotifSub = this.wsService.newNotification$.subscribe((newNotification: NotificationInterface) => {
      console.log('Admin Dashboard: Nueva notificación recibida por WebSocket.', newNotification);
      // Recargar la lista completa al recibir un evento para asegurar la sincronía
      this.loadNotifications();
    });
  }

  private async loadFromStorageOrMock() {
    try {
      const c = await this.countryStorage.getCountry();
      if (c) {
        this.country = c;
      } else {
        this.country = this.MOCK_COUNTRY;
      }
    } catch (e) {
      console.error('Error leyendo country del storage:', e);
      this.country = this.MOCK_COUNTRY;
    } finally {
      this.loading = false;
    }
  }

  // ==========================
  // Notificaciones (Refresca lista y contador)
  // ==========================
  private loadNotifications(): void {
    // Cargar notificaciones del usuario autenticado (sin filtros por país/rol en el frontend)
    const uid = this.userIdForNotifications ?? undefined;
    this.notificationsSvc.getAllByUser(uid).subscribe({
      next: (list: any[]) => {
        const arr = Array.isArray(list) ? list : [];
        if (arr.length === 0) {
          // Fallback a endpoint genérico si el backend guarda notifs de admin en un id fijo
          this.notificationsSvc.getAllByUser(undefined).subscribe({
            next: (all: any[]) => {
              this.notifications = (Array.isArray(all) ? all : []) as NotificationInterface[];
              this.unreadCount = this.notifications.filter(n => !n.read).length;
            },
            error: (err2) => {
              console.error('Error cargando notificaciones (fallback):', err2);
              this.notifications = [];
              this.unreadCount = 0;
            }
          });
          return;
        }
        this.notifications = arr as NotificationInterface[];
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      },
      error: (err) => {
        console.error('Error cargando notificaciones:', err);
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  // ==========================
  // Popover de Notificaciones (Se mantiene por si decides volver a usarlo así)
  // ==========================
  async openNotificationsPopover(ev: any) {
    // Validación básica de datos cargados
    if (this.loading || !this.notifications || !this.userIdForNotifications) {
      console.warn('No se puede abrir el popover: datos no cargados o falta ID de usuario.');
      return;
    }

    const pop = await this.popoverController.create({
      component: NotificationsPopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { 
        notifications: this.notifications,
        userId: this.userIdForNotifications
      }
    });

    pop.onDidDismiss().then(() => {
      this.loadNotifications();
    });

    return pop.present();
  }

  // ==========================
  // UI helpers
  // ==========================
  openUserMenu(ev: any) {
    this.userMenuEvent = ev;
    this.isUserMenuOpen = true;
  }

  onUserMenuDidDismiss() {
    this.isUserMenuOpen = false;
    this.userMenuEvent = null;
  }

  onThemeToggle(ev: any) {
    const checked = ev?.detail?.checked ?? (ev?.target as HTMLInputElement)?.checked ?? false;
    this.theme.set('admin', checked ? 'dark' : 'light');
  }

  getCountryImage(c?: CountryInteface): string {
    const item = c ?? this.country;
    return (
      item?.image ||
      item?.avatar ||
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
    );
  }

  // ==========================
  // Navegación
  // ==========================
  backToAdminHome() {
    this.router.navigate(['/admin/home']);
  }

  async logout(): Promise<void> {
    try {
      await this.userStorage.clearUser();
      await this.countryStorage.clearCountry();
    } catch (e) {
      console.warn('Error limpiando storage en logout:', e);
    } finally {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
  // Propiedades / Dueños
  goToViewProperties() {
    this.router.navigate(['/admin/view-properties'], { queryParams: { countryId: this.country?.id } });
  }
  goToAddOwner() {
    this.router.navigate(['/admin/add-country-owner'], { queryParams: { countryId: this.country?.id } });
  }
  goToViewOwners() {
    this.router.navigate(['/admin/view-owners'], { queryParams: { countryId: this.country?.id } });
  }
  goToRecurrents() {
    this.router.navigate(['/admin/country-recurrents'], { queryParams: { countryId: this.country?.id } });
  }
  goToAddProperty() {
    this.router.navigate(['/admin/add-property'], { queryParams: { countryId: this.country?.id } });
  }
  goToAssignCountryToOwner(): void {
    this.router.navigate(['/admin/assign-country-to-owner'], { queryParams: { countryId: this.country?.id } });
  }

  // Vigiladores
  goToAllGuards() {
    this.router.navigate(['/admin/all-guards'], { queryParams: { countryId: this.country?.id } });
  }
  goToCheckInOutHistorial() {
    this.router.navigate(['/admin/checkin-out-historial'], { queryParams: { countryId: this.country?.id } });
  }
  goToAntipanicHistorial() {
    this.router.navigate(['/admin/antipanic-historial'], { queryParams: { countryId: this.country?.id } });
  }
  goToMapGuards() {
    this.router.navigate(['/map-guards'], { queryParams: { countryId: this.country?.id } });
  }
  goToAddGuard() {
    this.router.navigate(['/admin/add-guard'], { queryParams: { countryId: this.country?.id } });
  }
  goToPasswordRequests() {
    this.router.navigate(['/admin/password-requests'], { queryParams: { countryId: this.country?.id } });
  }
  goToServicesPending() {
    this.router.navigate(['/admin/services-pending'], { queryParams: { countryId: this.country?.id } });
  }

  /**
   * Carga el contador de servicios pendientes
   */
  loadPendingServices() {
    if (!this.country?.id) return;

    this.checkInService.getAllCheckInConfirmedByOwner(this.country.id).subscribe({
      next: (checkins) => {
        // Filtrar solo los que no tienen propietario (servicios)
        const pendingServices = checkins.filter(c => c.id_owner === null);
        this.pendingServicesCount = pendingServices.length;
        console.log('[Admin Dashboard] Servicios pendientes:', this.pendingServicesCount);
      },
      error: (err) => {
        console.error('[Admin Dashboard] Error al cargar servicios pendientes:', err);
        this.pendingServicesCount = 0;
      }
    });
  }

  /**
   * Se ejecuta cada vez que la vista está por entrar
   */
  ionViewWillEnter() {
    this.loadPendingServices();
    this.loadNotifications();
  }

  // Eventos / Amenities
  goToAmenities() {
    this.router.navigate(['/admin/view-all-amenities'], { queryParams: { countryId: this.country?.id } });
  }
  goToEventsHistorial() {
    this.router.navigate(['/admin/events-historial'], { queryParams: { countryId: this.country?.id } });
  }

  ngOnDestroy(): void {
    if (this.newNotifSub) {
      this.newNotifSub.unsubscribe();
      this.newNotifSub = undefined;
    }
    if (this.notifRefreshSub) {
      this.notifRefreshSub.unsubscribe();
      this.notifRefreshSub = undefined;
    }
  }
}