// src/app/components/notifications-popover/notifications-popover.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { NotificationInterface } from 'src/app/interfaces/notification-interface';
import { RouterModule } from '@angular/router';

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
  public loading: boolean = true;
  private readonly REFRESH_TIMEOUT: number = 3000;

  constructor(
    private popoverController: PopoverController,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    this.loading = false;
  }

  // Método para cerrar el popover
  close() {
    this.popoverController.dismiss();
  }

  // Método para marcar una notificación como leída
  markAsRead(notification: NotificationInterface) {
    if (!notification.read) {
      this.notificationsService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
        },
        error: (err) => {
          console.error('Error al marcar la notificación como leída', err);
        }
      });
    }
  }

  // Método para recargar las notificaciones
  async doRefresh(event: any) {
    this.notificationsService.getAllByUser(this.notifications[0].id_user).subscribe(data => {
      this.notifications = data;
      event.target.complete();
    }, (err) => {
      console.error('Error al recargar las notificaciones', err);
      event.target.complete();
    });
  }

}