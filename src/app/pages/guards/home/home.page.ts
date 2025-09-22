import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { NavbarGuardsComponent } from 'src/app/components/navbars/navbar-guards/navbar-guards.component';

// Servicios
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';

// ***** 1. IMPORTAR THEME SERVICE *****
import { ThemeService } from 'src/app/services/theme/theme.service';

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
    private _authStorage: AuthStorageService,
    private _userStorage: UserStorageService,
    private _countryStorageService: CountryStorageService,
    private _webSocketService: WebSocketService,
    // ***** 2. INYECTAR THEME SERVICE *****
    public theme: ThemeService
  ) {}

  ngOnInit() {
    // ***** 3. INICIALIZAR EL TEMA PARA 'GUARD' *****
    this.theme.init('guard');
  }

  // ***** 4. AÑADIR LA FUNCIÓN PARA MANEJAR EL CAMBIO *****
  onThemeToggle(ev: any) {
    const checked = ev?.detail?.checked ?? (ev?.target as HTMLInputElement)?.checked ?? false;
    this.theme.set('guard', checked ? 'dark' : 'light');
  }

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
    this.router.navigate(['/admin/events-historial']);
  }

  logout() {
    console.log('Cerrando sesión del guardia...');
    this._authStorage.clearJWT();
    this._userStorage.clearUser();
    this._countryStorageService.clearCountry();
    this._webSocketService.desconectar();
    this.router.navigate(['/login']);
    console.log('Sesión cerrada correctamente.');
  }
}
