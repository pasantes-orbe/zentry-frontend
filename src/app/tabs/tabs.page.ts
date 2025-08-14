import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    // Componentes de Ionic
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    // Tus componentes
    NavbarDefaultComponent
  ]
})
export class TabsPage implements OnInit {

  @ViewChild('navbar') navbar: NavbarDefaultComponent;

  constructor() {
    // Registra los íconos que se usarán en la barra de pestañas
    addIcons({ home, newspaper, person, call });
  }

  ngOnInit(): void {
    // La lógica de Sockets se mantiene, pero asegúrate de que el servicio
    // esté correctamente inyectado si lo mueves a un servicio dedicado.
  }
}
