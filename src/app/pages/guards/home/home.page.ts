/* ====================================================== */
/* GUARDS/HOME.PAGE.TS */
/* ====================================================== */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { NavbarGuardsComponent } from 'src/app/components/navbars/navbar-guards/navbar-guards.component';

// Importar los servicios necesarios
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NavbarGuardsComponent
  ]
})
export class HomePage implements OnInit {

  constructor(
    private router: Router,
    private _authStorage: AuthStorageService, // Servicio para manejar el token JWT
    private _userStorage: UserStorageService, // Servicio para manejar los datos del usuario
    private _countryStorageService: CountryStorageService, // Servicio para manejar datos del país
    private _webSocketService: WebSocketService // Servicio para manejar WebSocket
  ) {}

  ngOnInit() {}

  navigateToCheckin() {
    this.router.navigate(['/checkin']);
  }

  navigateToAuthorizations() {
    this.router.navigate(['/guards/authorizations']);
  }

  navigateToCheckout() {
    this.router.navigate(['/checkout']);
  }

  navigateToEvents() {
    // NOTA: La ruta se basa en tu archivo app.routes.ts
    this.router.navigate(['/admin/events-historial']);
  }

  logout() {
    console.log('Cerrando sesión del guardia...');

    // 1. Limpiar el almacenamiento local
    this._authStorage.clearJWT(); // Limpia el token JWT
    this._userStorage.clearUser(); // Limpia los datos del usuario
    this._countryStorageService.clearCountry(); // Limpia datos relacionados con el country

    // 2. Cerrar conexiones activas
    this._webSocketService.desconectar(); // Cierra la conexión WebSocket

    // 3. Redirigir al usuario a la página de login
    this.router.navigate(['/login']);

    console.log('Sesión cerrada correctamente.');
  }
}