// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

// 1. Importa el servicio de Storage
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonApp,
    IonRouterOutlet,
  ],
})
export class AppComponent {
  constructor(
    // 2. Inyecta el servicio en el constructor
    private storage: Storage
  ) {
    // 3. Llama al método para inicializar la base de datos
    this.initializeApp();
  }

  async initializeApp() {
    // Esta línea crea la base de datos y la deja lista para ser usada.
    // Es fundamental para que el servicio esté listo cuando las páginas lo pidan.
    await this.storage.create();
  }
}
