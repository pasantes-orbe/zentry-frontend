import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { AlertService } from '../helpers/alert.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: Socket | null = null;
  private connectionStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private alertController: AlertController,
    private alerts: AlertService
  ) {}

  /**
   * Conectar al servidor WebSocket
   */
  public conectar(): void {
    try {
      this.socket = io(environment.URL);

      this.socket.on('connect', () => {
        console.log('Conectado al servidor WebSocket.');
        this.connectionStatus.next(true);
      });

      this.socket.on('disconnect', () => {
        console.log('Desconectado del servidor WebSocket.');
        this.connectionStatus.next(false);
      });

      this.socket.on('connect_error', (err) => {
        console.error('Error de conexión:', err);
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
      if (this.socket) {
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
        console.warn('No se puede escuchar el evento. El socket no está conectado.');
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
        console.warn('No se puede eliminar el listener. El socket no está conectado.');
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