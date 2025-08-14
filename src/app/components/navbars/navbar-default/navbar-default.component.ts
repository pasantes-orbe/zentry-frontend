import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notifications } from 'ionicons/icons';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';

@Component({
  selector: 'app-navbar-default',
  templateUrl: './navbar-default.component.html',
  styleUrls: ['./navbar-default.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonIcon
  ]
})
export class NavbarDefaultComponent implements OnInit {

  @Input() titulo: string;
  public numberNotifications: number = 0;

  constructor(
    private _notificationsService: NotificationsService
  ) {
    addIcons({ notifications });
  }

  async ngOnInit() {
    this.numberNotifications = await this._notificationsService.getNotificationsNotRead();
  }

}