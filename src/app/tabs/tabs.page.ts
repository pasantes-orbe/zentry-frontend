import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

// Componentes Standalone de Ionic
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';

// Íconos que realmente usas
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  shieldOutline, 
  personCircleOutline,
  alertOutline,
  notificationsOutline 
} from 'ionicons/icons';

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
    IonLabel
  ]
})
export class TabsPage implements OnInit {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.URL);
    
    // Registrar todos los íconos que usas en la app
    addIcons({ 
      homeOutline, 
      shieldOutline, 
      personCircleOutline,
      alertOutline,
      notificationsOutline 
    });
  }

  ngOnInit(): void {
    // Conectar socket
    this.socket.on('connect', () => {
      console.log('Socket conectado');
    });

    this.socket.on('notificacion-check-in', (payload) => {
      console.log('Notificación check-in recibida:', payload);
      // Aquí puedes mostrar una notificación toast o similar
    });

    this.socket.on('notificacion-nuevo-confirmedByOwner', (payload) => {
      console.log('Notificación confirmada por propietario:', payload);
    });
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}