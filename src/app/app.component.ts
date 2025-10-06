// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthStorageService } from './services/storage/auth-storage.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule
  ]
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthStorageService) {}

  async ngOnInit() {
    await this.auth.init(); // token queda en memoria antes de las requests
  }
}
