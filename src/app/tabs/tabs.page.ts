import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

// Componentes Standalone de Ionic
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';

// Íconos
import { addIcons } from 'ionicons';
import { home, newspaper, person, call } from 'ionicons/icons';

// Tus componentes
import { NavbarDefaultComponent } from '../components/navbars/navbar-default/navbar-default.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    NavbarDefaultComponent
  ]
})
export class TabsPage implements OnInit {

  @ViewChild('navbar') navbar: NavbarDefaultComponent;
  private socket: Socket;

  constructor() {
    this.socket = io(environment.URL);
    addIcons({ home, newspaper, person, call });
  }

  ngOnInit(): void {
    // Lógica de Sockets
    this.socket.on('notificacion-check-in', (payload) => {
      setTimeout(async cb => await this.navbar.ngOnInit(), 1000);
    });

    this.socket.on('notificacion-nuevo-confirmedByOwner', (payload) => {
      setTimeout(async cb => await this.navbar.ngOnInit(), 1000);
    });
  }
}
