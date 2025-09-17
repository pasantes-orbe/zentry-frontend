//src/app/services/notifications/notifications.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { NotificationInterface } from 'src/app/interfaces/notification-interface';


// Interfaz para la nueva notificación que se enviará a la API
export interface NewNotification {
  ownerId: string;
  title: string;
  message: string;
  read: boolean;
  reservationId: string;
  status: 'aprobada' | 'rechazada';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private socket: Socket;

  // Creamos un `Subject` para notificar a los componentes
  private reservationNotificationSubject = new Subject<any>();

  constructor(private _http: HttpClient) { 
    // Inicializamos la conexión al socket
    this.socket = io(environment.URL);
    // Agregamos un listener para el evento 'notificacion-reserva-actualizada'
    this.socket.on('Nueva notificacion entrante', (payload) => {
        console.log("Notificación de reserva en tiempo real recibida:", payload);
        this.reservationNotificationSubject.next(payload);
    });
  }

    // Nuevo método para que los componentes se suscriban a las notificaciones en tiempo real
  public onNewNotification(): Observable<any> {
    return this.reservationNotificationSubject.asObservable();
  }

  getAllByUser(id: number): Observable<any[]> {
    return this._http.get<any[]>(`${environment.URL}/api/notifications/${id}`);
  }

    // Crea una nueva notificación a través de la API
  createNotification(notificationData: NewNotification): Observable<any> {
    return this._http.post(`${environment.URL}/api/notifications`, notificationData);
  }

  // Borrar una notificación por su ID.
  deleteNotification(notificationId: number): Observable<any> {
    return this._http.delete(`${environment.URL}/api/notifications/${notificationId}`);
  }

    // Nuevo método para marcar la notificación como leída
  markAsRead(notificationId: number): Observable<any> {
    return this._http.patch(`${environment.URL}/api/notifications/read/${notificationId}`, {});
  }
  // NOTA: No existe un método 'getNotificationsNotReaded' en el servicio.
  // La lógica para contar se debe hacer en el componente después de obtener todas las notificaciones.
}
