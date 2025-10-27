//src/app/components/navbars/navbar-default/navbar-default.component.ts
import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  MenuController, 
  IonicModule 
} from '@ionic/angular';

// Íconos
import { addIcons } from 'ionicons';
import { notifications, menuOutline, shieldHalfOutline, trashOutline, personCircleOutline, bookOutline, logOutOutline } from 'ionicons/icons';

// Servicios y otros
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { NavigationService } from 'src/app/helpers/navigation.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { Subscription } from 'rxjs';
import { NotificationsPopoverComponent } from 'src/app/components/notifications-popover/notifications-popover';

// Definición de interfaz para notificaciones
interface Notification {
  id: number;
  is_read: boolean;
  title: string;
  content: string; // Asumimos 'content' es el mensaje
  [key: string]: any;
}

@Component({
  selector: 'app-navbar-default',
  templateUrl: './navbar-default.component.html',
  styleUrls: ['./navbar-default.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    NotificationsPopoverComponent
  ]
})
export class NavbarDefaultComponent implements OnInit, OnDestroy {
  // Inyección de dependencias con inject()
  public _notificationsService = inject(NotificationsService);
  public _userStorage = inject(UserStorageService);
  public _ownerStorage = inject(OwnerStorageService);
  public navigation = inject(NavigationService);
  public menu = inject(MenuController);

  // Propiedades de entrada y estado
  @Input() titulo: string;
  
  public numberNotifications: number = 0;
  public unreadCount: number = 0;
  public user: UserInterface;
  public dropdownState: boolean = false;
  public notifications: Notification[] = [];
  private wsSub?: Subscription;
  private refreshSub?: Subscription;

  constructor() {
    // Añadir íconos de Ionicons
    addIcons({ 
      notifications, 
      menuOutline,
      trashOutline,
      personCircleOutline,
      bookOutline,
      shieldHalfOutline,
      logOutOutline 
    });
  }

  async ngOnInit() {
    try {
      // Obtener usuario
      this.user = await this._userStorage.getUser();
      
      if (this.user) {
        this.loadNotifications(this.user.id);

        // Refrescar cuando se marquen como leídas desde otros componentes
        this.refreshSub = this._notificationsService.refresh$.subscribe(() => {
          this.loadNotifications(this.user.id);
        });

        // Refrescar cuando llegue una nueva notificación por WebSocket
        const ws = inject(WebSocketService);
        ws.conectar?.();
        this.wsSub = ws.newNotification$.subscribe((n: any) => {
          // Si el payload indica usuario destino, refrescar solo si corresponde
          if (!n || typeof n !== 'object' || n.id_user == null || Number(n.id_user) === Number(this.user.id)) {
            this.loadNotifications(this.user.id);
          }
        });
      }
    } catch (error) {
      console.error('Error al obtener el usuario', error);
    }
  }

  ngOnDestroy(): void {
    if (this.wsSub) { this.wsSub.unsubscribe(); this.wsSub = undefined; }
    if (this.refreshSub) { this.refreshSub.unsubscribe(); this.refreshSub = undefined; }
  }

  private loadNotifications(userId: number) {
    this._notificationsService.getAllByUser(userId)
      .subscribe({
        next: (list: any[]) => {
          const all = Array.isArray(list) ? (list as any[]) as Notification[] : [];
          // Preferir solo estado de reserva; si no hay, mostrar todas para no ocultar mensajes
          const onlyStatus = all.filter((n: any) => (n.type ?? n?.['type']) === 'reservation_status');
          this.notifications = onlyStatus.length > 0 ? onlyStatus : all;
          this.numberNotifications = this.notifications.filter((n: any) => {
            if (typeof n.read === 'boolean') return !n.read;
            if (typeof n.is_read === 'boolean') return !n.is_read;
            return false;
          }).length;
          this.unreadCount = this.numberNotifications;
        },
        error: (error) => {
          console.error('Error al obtener notificaciones', error);
          this.notifications = [];
          this.numberNotifications = 0;
          this.unreadCount = 0;
        }
      });
  }

  // Método para navegar
  public navigate(url: string): void {
    this.navigation.navigate(url);
  }

  // Abrir menú
  public openFirst(menuId: string): void {
    this.menu.enable(true, menuId);
    this.menu.open(menuId);
  }

  // Alternar estado de notificaciones
  public openNotifications(): void {
    this.dropdownState = !this.dropdownState;
  }

  // Marcar como leída al hacer click
  public markAsRead(notification: Notification, index: number): void {
    if (!notification?.id) return;
    const alreadyRead = typeof notification.read === 'boolean' ? notification.read : notification.is_read === true;
    if (alreadyRead) return;
    this._notificationsService.markAsRead([notification.id]).subscribe({
      next: () => {
        // actualizar local
        (this.notifications[index] as any).read = true;
        (this.notifications[index] as any).is_read = true;
        this.numberNotifications = this.notifications.filter((n: any) => {
          if (typeof n.read === 'boolean') return !n.read;
          if (typeof n.is_read === 'boolean') return !n.is_read;
          return false;
        }).length;
        this._notificationsService.emitRefresh();
      },
      error: (err) => console.error('Error al marcar leída', err)
    });
  }

  // Eliminar notificación
  public deleteNotification(notification: Notification, index: number): void {
    this._notificationsService.deleteNotification(notification.id)
      .subscribe({
        next: () => {
          // Eliminar notificación del arreglo
          this.notifications.splice(index, 1);
          // Actualizar contador de no leídas soportando read/is_read
          this.numberNotifications = this.notifications.filter((n: any) => {
            if (typeof n.read === 'boolean') return !n.read;
            if (typeof n.is_read === 'boolean') return !n.is_read;
            return false;
          }).length;
        },
        error: (error) => {
          console.error('Error al eliminar notificación', error);
        }
      });
  }

  // Métodos públicos para acceder a servicios en el template si es necesario
  public getUserStorage() {
    return this._userStorage;
  }

  public getOwnerStorage() {
    return this._ownerStorage;
  }
}