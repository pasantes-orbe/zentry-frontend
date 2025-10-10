import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { AlertService } from '../helpers/alert.service';
import { environment } from 'src/environments/environment';
import { AuthStorageService } from '../storage/auth-storage.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: Socket | null = null;
  private connectionStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private alertController: AlertController,
    private alerts: AlertService,
    private _authStorage: AuthStorageService
  ) {}

  /**
   * Conectar al servidor WebSocket
   * Se hace asíncrono para esperar el JWT antes de conectar (CORRECCIÓN P-WS).
   */
  public async conectar(): Promise<void> { // CORRECCIÓN: Se añade 'async'
    try { 

        // Si ya existe y está conectado, salimos.
        if (this.socket && this.socket.connected) {
            console.log('El socket ya está conectado. No se reconecta.');
            return;
        }

        // 1. Recuperar el JWT
        const token = await this._authStorage.getJWT();

        if (!token) {
            console.warn("JWT no encontrado. Conexión WebSocket no iniciada. Por favor, inicie sesión.");
            this.connectionStatus.next(false);
            return;
        }

        // 2. Conectar pasando el JWT en el handshake (CORRECCIÓN P-WS)
        this.socket = io(environment.URL, {
          auth: { 
            token: token 
          }
        });


      this.socket.on('connect', () => {
        console.log('Conectado al servidor WebSocket. ID:', this.socket?.id); // Se añade acceso seguro a .id
        this.connectionStatus.next(true);
      });

      this.socket.on('disconnect', () => {
        console.log('Desconectado del servidor WebSocket.');
        this.connectionStatus.next(false);
      });

      this.socket.on('connect_error', (err) => {
        console.error('Error de conexión WebSocket (Auth/Transporte):', err.message); // CORRECCIÓN: Mensaje más detallado
        this.connectionStatus.next(false); // CORRECCIÓN: Se actualiza el estado de conexión
      });

    } catch (error) {
      console.error('Error al conectar al servidor WebSocket:', error);
    }
  }

  /**
   * Desconectar del servidor WebSocket
   */
  public desconectar(): void {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
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
      if (this.socket && this.socket.connected) { // CORRECCIÓN P-WS: Se valida que el socket esté activo y conectado.
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
        console.warn('No se puede escuchar el evento. El socket no está inicializado.'); // CORRECCIÓN: Mensaje más preciso
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
        console.warn('No se puede eliminar el listener. El socket no está inicializado.'); // CORRECCIÓN: Mensaje más preciso
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
}