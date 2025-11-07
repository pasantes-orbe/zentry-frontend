// src/app/services/notifications/notifications.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
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

// Interfaz para el conteo que devuelve la API
interface CountResponse {
    count: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  
  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  // Notificador para actualizar contadores/listas tras cambios de lectura
  private _refresh$ = new Subject<void>();
  public readonly refresh$ = this._refresh$.asObservable();
  public emitRefresh(): void { this._refresh$.next(); }

  // 🟢 Conteo de no leídas (por usuario)
  getUnreadCount(userId?: number): Observable<CountResponse> {
    if (userId != null) {
      return this.http.get<CountResponse>(`${environment.URL}/api/notifications/unread-count/${userId}`);
    }
    // Compatibilidad con backend anterior
    return this.http.get<CountResponse>(`${environment.URL}/api/notifications/unread/count`);
  }

  getAllByUser(userId?: number): Observable<NotificationInterface[]> {
    const url = (userId != null)
      ? `${environment.URL}/api/notifications/user/${userId}`
      : `${environment.URL}/api/notifications`;

    return this.http.get<any[]>(url).pipe(
      map((list) => (Array.isArray(list) ? list : []).map((n: any) => {
        const createdRaw = n?.createdAt ?? n?.created_at ?? null;
        const reservationId = n?.reservation_id ?? n?.id_reservation ?? null;
        const readVal = n?.read ?? n?.leida ?? n?.is_read ?? false;
        const titleVal = String(n?.title ?? n?.titulo ?? 'Notificación');

        // Intentar formatear texto si es una solicitud de reserva
        const type = n?.type ?? n?.tipo ?? n?.notification_type ?? n?.category ?? null;
        const ownerName = n?.ownerName ?? n?.owner_name ?? n?.owner ?? n?.meta?.ownerName ?? null;
        const amenityName = n?.amenityName ?? n?.amenity_name ?? n?.amenity ?? n?.meta?.amenityName ?? null;
        const whenStr = n?.whenStr ?? n?.start_fmt ?? n?.date ?? n?.meta?.date ?? null;

        let contentVal = n?.content ?? n?.message ?? n?.mensaje ?? '';
        if (type === 'reservation_request' && (ownerName || amenityName || whenStr)) {
          const owner = ownerName ?? 'Propietario';
          const amenity = amenityName ?? 'Amenidad';
          const suffix = whenStr ? ` (${whenStr})` : '';
          contentVal = `${owner} solicitó reserva para ${amenity}${suffix}`;
        } else {
          contentVal = String(contentVal);
        }

        return {
          id: Number(n?.id ?? n?.notification_id ?? 0) || undefined,
          title: titleVal,
          content: contentVal,
          read: Boolean(readVal),
          id_user: Number(n?.id_user ?? n?.user_id ?? 0),
          type: (n?.type ?? n?.tipo ?? n?.notification_type ?? n?.category)
            ? String(n?.type ?? n?.tipo ?? n?.notification_type ?? n?.category)
            : undefined,
          reservation_id: reservationId != null ? Number(reservationId) : undefined,
          createdAt: createdRaw ? new Date(createdRaw) : undefined,
          updatedAt: n?.updatedAt ? new Date(n?.updatedAt) : undefined,
        } as NotificationInterface;
      }))
    );
  }

  createNotification(notificationData: any): Observable<any> {
    // Normalizar para compatibilidad backend
    const id_user = notificationData?.id_user ?? (
      notificationData?.ownerId != null
        ? Number(notificationData.ownerId)
        : undefined
    );
    const title = String(notificationData?.title ?? 'Notificación');
    const content = notificationData?.content ?? notificationData?.message ?? '';
    const read = Boolean(notificationData?.read ?? false);

    const body: any = { id_user, title, content, read };
    return this.http.post(`${environment.URL}/api/notifications`, body);
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${environment.URL}/api/notifications/${notificationId}`);
  }

  markAsRead(notificationIds: number[]): Observable<any> {
    // Llama a la ruta: POST /api/notifications/read (compat: admite notificationIds o ids)
    return this.http.post(`${environment.URL}/api/notifications/read`, {
      notificationIds,
      ids: notificationIds
    });
  }
  
  async presentToast(title: string, message: string): Promise<void> {
    const toast = await this.toastController.create({
      header: title,
      message,
      duration: 3000,
      position: 'top',
      color: 'primary'
    });

    await toast.present();
  }
}