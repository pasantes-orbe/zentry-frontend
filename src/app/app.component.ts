import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

// 1. Importa el servicio de Storage
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule
  ],
})
export class AppComponent implements OnInit {
  constructor(
    // 2. Inyecta el servicio en el constructor
    private storage: Storage
  ) {}

  // Implementa OnInit para manejar la inicialización
  async ngOnInit() {
    // 3. Inicializa el storage
    await this.storage.create();
  }
}