import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private _http: HttpClient) { }

  getAllByUser(id: number): Observable<any[]> {
    return this._http.get<any[]>(`${environment.URL}/api/notifications/${id}`);
  }

  // MÉTODO AÑADIDO: Para borrar una notificación por su ID.
  deleteNotification(notificationId: number): Observable<any> {
    return this._http.delete(`${environment.URL}/api/notifications/${notificationId}`);
  }

  // NOTA: No existe un método 'getNotificationsNotReaded' en el servicio.
  // La lógica para contar se debe hacer en el componente después de obtener todas las notificaciones.
}
