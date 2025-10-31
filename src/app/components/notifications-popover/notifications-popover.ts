// src/app/components/notifications-popover/notifications-popover.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { NotificationInterface } from 'src/app/interfaces/notification-interface';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications-popover',
  templateUrl: './notifications-popover.html',
  styleUrls: ['./notifications-popover.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ]
})
export class NotificationsPopoverComponent implements OnInit {

  @Input() notifications: NotificationInterface[] = [];
  @Input() userId: number | null = null;
  @Input() navigateOnClick: boolean = true;
  public loading: boolean = true;
  private readonly REFRESH_TIMEOUT: number = 3000;

  constructor(
    private popoverController: PopoverController,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  // Método para cerrar el popover
  close() {
    this.popoverController.dismiss();
  }

  // Método para marcar una notificación como leída
  markAsRead(notification: NotificationInterface) {
    if (!notification.read) {
      this.notificationsService.markAsRead([notification.id as number]).subscribe({
        next: () => {
          notification.read = true;
          this.notificationsService.emitRefresh();
        },
        error: (err) => {
          console.error('Error al marcar la notificación como leída', err);
        }
      });
    }
  }

  // Click: marcar como leída y navegar al historial de eventos
  openNotification(notification: NotificationInterface) {
    const go = () => {
      if (this.navigateOnClick) {
        const t = String((notification as any)?.type || '').toLowerCase();
        const title = String((notification as any)?.title || '').toLowerCase();
        const content = String((notification as any)?.content || '').toLowerCase();

        const isPasswordNotif = (
          t === 'password_request' ||
          t === 'password_change_request' ||
          t === 'password-change' ||
          title.includes('password') || title.includes('contraseña') ||
          content.includes('password') || content.includes('contraseña')
        );

        if (isPasswordNotif) {
          this.router.navigate(['/admin/password-requests']).then(() => this.close());
          return;
        }

        const isReservationLike = (
          t.includes('reservation') ||
          title.includes('reserva') ||
          content.includes('reserva') ||
          title.includes('reservation') ||
          content.includes('reservation')
        );

        if (notification?.reservation_id) {
          const qp: any = { openReservationId: notification.reservation_id };
          // Detectar si es guardia o admin por la URL actual
          const isGuard = this.router.url.includes('/guards');
          const route = isGuard ? '/view-events' : '/admin/events-historial';
          this.router.navigate([route], { queryParams: qp }).then(() => this.close());
          return;
        }

        // Fallback: si luce como notificación de reserva pero no trae ID, navegar igual al historial
        if (isReservationLike) {
          this.router.navigate(['/admin/events-historial']).then(() => this.close());
          return;
        }

        // Si no matchea nada conocido, solo cerrar para evitar redirecciones equivocadas
        this.close();
      } else {
        // Solo cerrar si no se navega
        this.close();
      }
    };

    if (!notification.read && notification.id != null) {
      this.notificationsService.markAsRead([notification.id]).subscribe({
        next: () => { notification.read = true; this.notificationsService.emitRefresh(); go(); },
        error: () => { go(); }
      });
    } else {
      go();
    }
  }

  // Método para recargar las notificaciones
  async doRefresh(event: any) {
    this.notificationsService.getAllByUser(this.userId ?? undefined).subscribe({
      next: (data) => {
        this.notifications = Array.isArray(data) ? data : [];
        event?.target?.complete?.();
      },
      error: (err) => {
        console.error('Error al recargar las notificaciones', err);
        event?.target?.complete?.();
      }
    });
  }

  private loadNotifications() {
    this.loading = true;
    this.notificationsService.getAllByUser(this.userId ?? undefined).subscribe({
      next: (data) => {
        this.notifications = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando notificaciones (popover):', err);
        this.notifications = [];
        this.loading = false;
      }
    });
  }

}