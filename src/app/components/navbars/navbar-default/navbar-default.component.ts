//src/app/components/navbars/navbar-default/navbar-default.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
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
    IonicModule
  ]
})
export class NavbarDefaultComponent implements OnInit {
  // Inyección de dependencias con inject()
  public _notificationsService = inject(NotificationsService);
  public _userStorage = inject(UserStorageService);
  public _ownerStorage = inject(OwnerStorageService);
  public navigation = inject(NavigationService);
  public menu = inject(MenuController);

  // Propiedades de entrada y estado
  @Input() titulo: string;
  
  public numberNotifications: number = 0;
  public user: UserInterface;
  public dropdownState: boolean = false;
  public notifications: Notification[] = [];

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
        // Obtener notificaciones del usuario
        this._notificationsService.getAllByUser(this.user.id)
          .subscribe({
            next: (notifications: Notification[]) => {
              this.notifications = notifications;
              this.numberNotifications = notifications.filter(n => !n.is_read).length;
            },
            error: (error) => {
              console.error('Error al obtener notificaciones', error);
            }
          });
      }
    } catch (error) {
      console.error('Error al obtener el usuario', error);
    }
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

  // Eliminar notificación
  public deleteNotification(notification: Notification, index: number): void {
    this._notificationsService.deleteNotification(notification.id)
      .subscribe({
        next: () => {
          // Eliminar notificación del arreglo
          this.notifications.splice(index, 1);
          // Actualizar contador de notificaciones no leídas
          this.numberNotifications = this.notifications.filter(n => !n.is_read).length;
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