// src/app/services/websocket/web-socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AlertService } from '../helpers/alert.service';
import { environment } from 'src/environments/environment';
import { AuthStorageService } from '../storage/auth-storage.service';
import { ReservationsInterface } from 'src/app/interfaces/reservations-interface';
import { NotificationInterface } from 'src/app/interfaces/notification-interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: Socket | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);

  //Subject y Observable para actualizaciones de reserva
  private reservationUpdateSubject = new Subject<ReservationsInterface>();
  public reservationUpdate$ = this.reservationUpdateSubject.asObservable();

  //Subject y Observable para nuevas notificaciones
  private newNotificationSubject = new Subject<NotificationInterface>();
  public newNotification$ = this.newNotificationSubject.asObservable();

  //Subject y Observable para servicios pendientes
  private pendingServiceSubject = new Subject<any>();
  public pendingService$ = this.pendingServiceSubject.asObservable();
  
  private listenersRegistered = false;

  constructor(
    private alerts: AlertService,
    private authStorage: AuthStorageService,
    private router: Router
  ) {}

  /**
  * Conectar al servidor WebSocket
  */
  public async conectar(): Promise<void> { 
    try { 
      // Si ya existe y está conectado, salimos.
      if (this.socket && this.socket.connected) {
        console.log('El socket ya está conectado.');
        return;
      }

      // 1. Recuperar el JWT
      const token = await this.authStorage.getJWT();

      if (!token) {
        console.warn("JWT no encontrado. Conexión WebSocket no iniciada.");
        this.connectionStatus.next(false);
        return;
      }

      // 2. Conectar pasando el JWT en el handshake
      this.socket = io(environment.URL, {
        auth: { 
          token: token 
        }
      });

      this.socket.on('connect', () => {
        console.log('Conectado al servidor WebSocket. ID:', this.socket?.id);
        this.connectionStatus.next(true);
        this.registerCoreListeners();
      });

      this.socket.on('disconnect', () => {
        console.log('Desconectado del servidor WebSocket.');
        this.connectionStatus.next(false);
        this.listenersRegistered = false;
      });

      this.socket.on('connect_error', (err) => {
        console.error('Error de conexión WebSocket (Auth/Transporte):', err.message); 
        this.connectionStatus.next(false); 
      });

    } catch (error) {
      console.error('Error al conectar al servidor WebSocket:', error);
    }
  }
  
  private registerCoreListeners(): void {
    if (!this.socket || this.listenersRegistered) {
      return;
    }

    this.listenersRegistered = true;
    this.registerReservationUpdates();
    this.registerNotificationUpdates();
    this.registerPendingServiceUpdates();
    this.escucharNotificacionesCheckin();
    
    // Solo escuchar antipánico si NO estamos en rutas de admin
    const currentUrl = this.router.url;
    const isAdminRoute = currentUrl.includes('/admin');
    if (!isAdminRoute) {
      this.escucharNotificacionesAntipanico();
      console.log('[WebSocket] Listener de antipánico registrado (ruta de guardia)');
    } else {
      console.log('[WebSocket] Listener de antipánico NO registrado (ruta de admin)');
    }
  }

  // Método para escuchar el evento 'Nueva notificacion entrante' del backend
  private registerNotificationUpdates(): void {
    if (!this.socket) {
      console.warn('Socket no inicializado para escuchar nuevas notificaciones.');
      return;
    }
    const eventName = 'new-notification';
    this.socket.off('new-notification');
    this.socket.on('new-notification', (payload: NotificationInterface) => {
      console.log('WebSocket: Nueva notificación de reserva recibida:', payload);
      this.newNotificationSubject.next(payload);

        /* Agregaar: Mostrar la notificación como Toast (Mejora UX)
        const title = payload.title || 'Nueva Notificación';
        const message = payload.content || 'Contenido desconocido';
        this.alerts.presentToast(title, message, 'success'); 
        */
    });
    console.log('Escuchando evento:', eventName);
  }

  // Método para escuchar el evento 'reservation-status-updated' del backend
  private registerReservationUpdates(): void {
      if (!this.socket) {
          console.warn('Socket no inicializado para escuchar actualizaciones de reserva.');
          return;
      }
      this.socket.off('reservation-status-updated');
      this.socket.on('reservation-status-updated', (payload: ReservationsInterface) => {
          console.log('WebSocket: Actualización de reserva recibida:', payload);
          this.reservationUpdateSubject.next(payload);
      });
      console.log('Escuchando evento: reservation-status-updated');
  }

  // Método para escuchar eventos de servicios pendientes
  private registerPendingServiceUpdates(): void {
    if (!this.socket) {
      console.warn('Socket no inicializado para escuchar servicios pendientes.');
      return;
    }

    // Escuchar cuando se crea un nuevo check-in confirmado sin propietario
    this.socket.off('notificarNuevoConfirmedByOwner');
    this.socket.on('notificarNuevoConfirmedByOwner', (payload: any) => {
      console.log('WebSocket: Nuevo check-in confirmado recibido:', payload);
      
      // Si es un servicio sin propietario, emitir notificación
      if (payload?.checkIn && payload.checkIn.id_owner === null) {
        console.log('WebSocket: Es un servicio sin propietario, emitiendo notificación');
        this.pendingServiceSubject.next({
          type: 'new-service',
          data: payload.checkIn
        });
      }
    });

    // Escuchar cuando se aprueba un servicio
    this.socket.off('service-approved-by-guard');
    this.socket.on('service-approved-by-guard', (payload: any) => {
      console.log('WebSocket: Servicio aprobado por guardia:', payload);
      this.pendingServiceSubject.next({
        type: 'service-approved',
        data: payload
      });
    });

    this.socket.off('service-approved-by-admin');
    this.socket.on('service-approved-by-admin', (payload: any) => {
      console.log('WebSocket: Servicio aprobado por admin:', payload);
      this.pendingServiceSubject.next({
        type: 'service-approved',
        data: payload
      });
    });

    console.log('Escuchando eventos de servicios pendientes');
  }

  /**
   * Desconectar del servidor WebSocket
   */
  public desconectar(): void {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.listenersRegistered = false;
        console.log('Conexión WebSocket cerrada.');
        this.connectionStatus.next(false);
      }
    } catch (error) {
      console.error('Error al desconectar del servidor WebSocket:', error);
    }
  }

  /**
   * Obtener el estado de conexión del WebSocket
   * @returns Observable<boolean>
   */
  public getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  /**
   * Emitir un evento al servidor
   * @param evento - Nombre del evento
   * @param data - Datos a enviar
   */
  public emitirEvento(evento: string, data: any): void {
    try {
      if (this.socket && this.socket.connected) {
        this.socket.emit(evento, data);
        console.log(`Evento emitido: ${evento}`, data);
      } else {
        console.warn('No se puede emitir el evento. El socket no está conectado.');
      }
    } catch (error) {
      console.error(`Error al emitir el evento ${evento}:`, error);
    }
  }

  /**
   * Escuchar un evento del servidor
   * @param evento - Nombre del evento
   * @param callback - Función a ejecutar cuando se reciba el evento
   */
  public escucharEvento(evento: string, callback: (data: any) => void): void {
    try {
      if (this.socket) {
        this.socket.on(evento, callback);
        console.log(`Escuchando evento: ${evento}`);
      } else {
        console.warn('No se puede escuchar el evento. El socket no está inicializado.'); 
      }
    } catch (error) {
      console.error(`Error al escuchar el evento ${evento}:`, error);
    }
  }

  /**
   * Eliminar un listener de un evento
   * @param evento - Nombre del evento
   */
  public eliminarListener(evento: string): void {
    try {
      if (this.socket) {
        this.socket.off(evento);
        console.log(`Listener eliminado para el evento: ${evento}`);
      } else {
        console.warn('No se puede eliminar el listener. El socket no está inicializado.');
      }
    } catch (error) {
      console.error(`Error al eliminar el listener del evento ${evento}:`, error);
    }
  }

  /**
   * Escuchar notificaciones de check-in
   */
  public escucharNotificacionesCheckin(): void {
    this.escucharEvento('notificacion-check-in', async (payload) => {
      console.log('Notificación de check-in recibida:', payload);
      await this.alerts.presentAlert(payload);
    });
  }

  public notificarCheckIn(data: any): void {
    this.emitirEvento('notificar-check-in', data);
    console.log('Evento notificar-check-in enviado:', data);
  }

  /**
   * Escuchar notificaciones de antipánico
   */
  public escucharNotificacionesAntipanico(): void {
    this.escucharEvento('notificacion-antipanico', async (payload) => {
      console.log('Notificación de antipánico recibida:', payload);
      const alert = await this.alerts.presentAlertPanic(payload);

      this.escucharEvento('notificacion-antipanico-finalizado', () => {
        console.log('Antipánico finalizado.');
        alert.dismiss();
      });
    });
  }

  /**
   * Notificar un nuevo evento confirmado por el propietario
   * @param data - Datos del evento
   */
  public notificarNuevoConfirmedByOwner(data: any): void {
    this.emitirEvento('notificar-nuevo-confirmedByOwner', data);
    console.log('Evento notificar-nuevo-confirmedByOwner enviado:', data);
  }

  /**
   * Notificar un evento de antipánico
   * @param data - Datos del evento
   */
  public notificarAntipanico(data: any): void {
    this.emitirEvento('notificar-antipanico', data);
    console.log('Evento notificar-antipanico enviado:', data);
  }

  /**
   * Enviar ubicación del guardia al backend
   * @param locationData - Datos de ubicación { id_user, id_country, lat, lng, user_name, user_lastname }
   */
  public enviarUbicacionGuardia(locationData: any): void {
    this.emitirEvento('update-guard-location', locationData);
    console.log('[WebSocket] Ubicación del guardia enviada:', locationData);
  }
}