// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// ¡CORRECCIÓN! Importa solo los componentes necesarios desde @ionic/angular/standalone
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonApp,          // Componente principal de la app Ionic
    IonRouterOutlet, // El lugar donde se cargan las páginas
  ],
})
export class AppComponent {
  constructor() {}
}