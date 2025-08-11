// src/app/app.component.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular'; // <-- Importa IonicModule

@Component({
  selector: 'app-root',
  templateUrl: '../app.component.html',
  styleUrls: ['../app.component.scss'],
  standalone: true, // <-- Se declara como standalone
  imports: [IonicModule], // <-- Se importa IonicModule para que el HTML funcione
})
export class AppComponent {
  constructor() {}
}
