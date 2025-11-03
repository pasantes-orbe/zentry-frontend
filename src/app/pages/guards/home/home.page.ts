import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

// Servicios
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { ThemeService } from 'src/app/services/theme/theme.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { CheckInService } from 'src/app/services/check-in/check-in.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class HomePage implements OnInit, OnDestroy {

  // Propiedad para almacenar el nombre del usuario dinámicamente.
  public userName: string = 'Cargando...';
  public userInitial: string = '';
  public userId: number | null = null;
  public countryId: number | null = null;

  // Notificaciones
  public notifications: any[] = [];
  public unreadCount: number = 0;
  private wsSub?: Subscription;
  private refreshSub?: Subscription;

  // Servicios pendientes
  public pendingServicesCount: number = 0;
  private servicesSub?: Subscription;
  private pendingServiceSub?: Subscription;

  // Tracking GPS
  private locationInterval: any = null;
  private locationWatchId: number | null = null;

  constructor(
    private router: Router,
    private _authStorage: AuthStorageService,
    private _userStorage: UserStorageService,
    private _countryStorageService: CountryStorageService,
    private _webSocketService: WebSocketService,
    public theme: ThemeService,
    private _notificationsService: NotificationsService,
    private _checkInService: CheckInService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.theme.init('guard');
    await this.loadUserData();
    
    // Conectar socket ANTES de iniciar tracking
    console.log('🔌 [HomePage] Conectando socket...');
    await this._webSocketService.conectar();
    console.log('🔌 [HomePage] Socket conectado, esperando 1 segundo...');
    
    // Esperar 1 segundo para asegurar conexión
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('🔌 [HomePage] Listo para registrar listeners');
    
    // Escuchar notificaciones de antipánico
    this._webSocketService.escucharNotificacionesAntipanico();
    
    // Cargar notificaciones
    if (this.userId) {
      this.loadNotifications(this.userId);
      
      // Suscribirse a nuevas notificaciones por WebSocket
      this.wsSub = this._webSocketService.newNotification$.subscribe((n: any) => {
        if (!n || typeof n !== 'object' || n.id_user == null || Number(n.id_user) === Number(this.userId)) {
          this.loadNotifications(this.userId!);
        }
      });

      // Refrescar cuando se marquen como leídas
      this.refreshSub = this._notificationsService.refresh$.subscribe(() => {
        this.loadNotifications(this.userId!);
      });
    }

    // Escuchar cuando el propietario autoriza/rechaza un ingreso (SIEMPRE, no depende de countryId)
    console.log('🔔 [HomePage] Registrando listener para checkin-confirmado-por-propietario...');
    this._webSocketService.escucharEvento('checkin-confirmado-por-propietario', (data: any) => {
      console.log('🔔 [HomePage] ===== EVENTO RECIBIDO =====');
      console.log('🔔 [HomePage] Evento checkin-confirmado-por-propietario recibido:', data);
      console.log('🔔 [HomePage] Tipo de data:', typeof data, data);
      
      if (data?.checkIn) {
        const checkIn = data.checkIn;
        console.log('🔔 [HomePage] CheckIn procesado:', checkIn);
        
        const status = checkIn.confirmed_by_owner ? 'AUTORIZADO' : 'RECHAZADO';
        const color = checkIn.confirmed_by_owner ? 'success' : 'danger';
        
        console.log('🔔 [HomePage] Mostrando toast:', status, color);
        
        this.showToast(
          `Ingreso ${status}: ${checkIn.guest_name} ${checkIn.guest_lastname}`,
          color
        );
      } else {
        console.warn('🔔 [HomePage] Data no tiene checkIn:', data);
      }
    });

    // Cargar servicios pendientes y suscribirse a notificaciones
    if (this.countryId) {
      this.loadPendingServices();
      
      // Suscribirse al observable de servicios pendientes
      this.pendingServiceSub = this._webSocketService.pendingService$.subscribe((event: any) => {
        console.log('[HomePage] Evento de servicio pendiente recibido:', event);
        
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
    } else {
      console.warn('🔔 [HomePage] countryId es null, no se cargan servicios pendientes');
    }
    
    await this.startLocationTracking();
  }

  /**
   * Se ejecuta cada vez que la vista está por entrar
   * Útil para refrescar datos cuando se vuelve de otra página
   */
  ionViewWillEnter() {
    // Recargar servicios pendientes
    if (this.countryId) {
      this.loadPendingServices();
    }
    // Recargar notificaciones
    if (this.userId) {
      this.loadNotifications(this.userId);
    }
  }

  ngOnDestroy() {
    this.stopLocationTracking();
    if (this.wsSub) this.wsSub.unsubscribe();
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }
  
  /**
   * Carga los datos del usuario desde el almacenamiento de forma asíncrona.
   * Utiliza la interfaz UserInterface con `name` y `lastname`.
   */
  async loadUserData() {
    const user = await this._userStorage.getUser();
    const country = await this._countryStorageService.getCountry();

    if (user && user.lastname && user.name) {
      this.userName = `${user.lastname}, ${user.name}.`;
      this.userInitial = user.lastname.charAt(0).toUpperCase();
      this.userId = user.id;
    } else {
      this.userName = 'Usuario';
      this.userInitial = 'U';
    }

    if (country) {
      this.countryId = country.id;
    }

    console.log('[HomePage] User ID:', this.userId, 'Country ID:', this.countryId);
  }

  /**
   * Inicia el tracking GPS del guardia
   */
  private async startLocationTracking() {
    if (!navigator.geolocation) {
      console.warn('[HomePage] Geolocation no disponible en este dispositivo');
      return;
    }

    console.log('[HomePage] Iniciando tracking GPS...');

    // Enviar ubicación cada 10 segundos
    this.locationInterval = setInterval(() => {
      this.sendCurrentLocation();
    }, 10000);

    // Enviar ubicación inmediatamente
    this.sendCurrentLocation();
  }

  /**
   * Envía la ubicación actual al backend
   */
  private sendCurrentLocation() {
    if (!this.userId || !this.countryId) {
      console.warn('[HomePage] No se puede enviar ubicación: falta userId o countryId');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        console.log(`[HomePage] Precisión GPS: ${accuracy.toFixed(0)} metros`);
        
        const locationData = {
          id_user: this.userId,
          id_country: this.countryId,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          user_name: this.userName.split(',')[1]?.trim() || 'Guardia',
          user_lastname: this.userName.split(',')[0]?.trim() || ''
        };

        this._webSocketService.enviarUbicacionGuardia(locationData);
      },
      (error) => {
        console.error('[HomePage] Error al obtener ubicación:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,  // Aumentado a 15 segundos
        maximumAge: 0
      }
    );
  }

  /**
   * Detiene el tracking GPS
   */
  private stopLocationTracking() {
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
      this.locationInterval = null;
      console.log('[HomePage] Tracking GPS detenido');
    }

    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  onThemeToggle(ev: any) {
    const checked = ev?.detail?.checked ?? (ev?.target as HTMLInputElement)?.checked ?? false;
    this.theme.set('guard', checked ? 'dark' : 'light');
  }

  navigateToCheckin() {
    this.router.navigate(['/checkin']);
  }

  navigateToAuthorizations() {
    this.router.navigate(['/guards/authorizations']);
  }
  
  navigateToEvents() {
    this.router.navigate(['/view-events']);
  }

  navigateToCheckout() {
    this.router.navigate(['/checkout']);
  }

  navigateToServicesPending() {
    this.router.navigate(['/guards/services-pending']);
  }

  /**
   * Carga el contador de servicios pendientes (check-ins sin propietario)
   */
  private loadPendingServices() {
    if (!this.countryId) return;

    this._checkInService.getAllCheckInConfirmedByOwner(this.countryId).subscribe({
      next: (checkins) => {
        // Filtrar solo los que no tienen propietario (servicios)
        const pendingServices = checkins.filter(c => c.id_owner === null);
        this.pendingServicesCount = pendingServices.length;
        console.log('[HomePage] Servicios pendientes:', this.pendingServicesCount);
      },
      error: (err) => {
        console.error('[HomePage] Error al cargar servicios pendientes:', err);
        this.pendingServicesCount = 0;
      }
    });
  }

  logout() {
    console.log('Cerrando sesión del guardia...');
    this.stopLocationTracking();
    this._authStorage.clearJWT();
    this._userStorage.clearUser();
    this._countryStorageService.clearCountry();
    this._webSocketService.desconectar();
    this.router.navigate(['/login']);
    console.log('Sesión cerrada correctamente.');
  }

  /**
   * Carga las notificaciones del usuario
   */
  private loadNotifications(userId: number) {
    this._notificationsService.getAllByUser(userId).subscribe({
      next: (res) => {
        const all = Array.isArray(res) ? res : [];
        // Mostrar solo las últimas 5 notificaciones
        this.notifications = all.slice(Math.max(all.length - 5, 0)).reverse();
        // Contar no leídas
        this.unreadCount = all.filter((n: any) => !n.read && !n.is_read).length;
      },
      error: (err) => {
        console.error('Error al cargar notificaciones:', err);
        this.notifications = [];
        this.unreadCount = 0;
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
      id_user: this.userId || 0,
      read: false,
      createdAt: new Date()
    };

    // Agregar al inicio del array
    this.notifications.unshift(newNotif);
    
    // Mantener solo las últimas 5
    if (this.notifications.length > 5) {
      this.notifications = this.notifications.slice(0, 5);
    }

    // Incrementar contador de no leídas
    this.unreadCount++;

    console.log('[HomePage] Notificación de servicio creada:', newNotif);
  }

  /**
   * Abre una notificación y navega al evento
   */
  public openNotification(notification: any) {
    // Marcar como leída si no lo está
    if (!notification.read && notification.id) {
      this._notificationsService.markAsRead([notification.id]).subscribe({
        next: () => {
          notification.read = true;
          this._notificationsService.emitRefresh();
        },
        error: (err) => console.error('Error al marcar como leída:', err)
      });
    }

    // Navegar al evento si tiene reservation_id
    if (notification?.reservation_id) {
      this.router.navigate(['/view-events'], { 
        queryParams: { openReservationId: notification.reservation_id } 
      });
    }
  }

  /**
   * Muestra un toast con un mensaje
   */
  async showToast(message: string, color: string = 'primary') {
    console.log('🔔 [showToast] Creando toast:', { message, color });
    try {
      const toast = await this.toastController.create({
        message: message,
        duration: 3000,
        position: 'top',
        color: color,
        buttons: [
          {
            text: 'OK',
            role: 'cancel'
          }
        ]
      });
      console.log('🔔 [showToast] Toast creado, presentando...');
      await toast.present();
      console.log('🔔 [showToast] Toast presentado exitosamente');
    } catch (error) {
      console.error('🔔 [showToast] Error al mostrar toast:', error);
    }
  }
}

