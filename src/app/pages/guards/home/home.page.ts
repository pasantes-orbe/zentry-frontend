import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

// Servicios
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { ThemeService } from 'src/app/services/theme/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class HomePage implements OnInit {

  // Propiedad para almacenar el nombre del usuario dinámicamente.
  public userName: string = 'Cargando...';
  public userInitial: string = '';

  constructor(
    private router: Router,
    private _authStorage: AuthStorageService,
    private _userStorage: UserStorageService,
    private _countryStorageService: CountryStorageService,
    private _webSocketService: WebSocketService,
    public theme: ThemeService
  ) {}

  ngOnInit() {
    this.theme.init('guard');
    this.loadUserData();
  }
  
  /**
   * Carga los datos del usuario desde el almacenamiento de forma asíncrona.
   * Utiliza la interfaz UserInterface con `name` y `lastname`.
   */
  async loadUserData() {
    const user = await this._userStorage.getUser(); // Se añade await para resolver la promesa
    if (user && user.lastname && user.name) {
      // Formateamos el nombre como "Apellido, Nombre"
      this.userName = `${user.lastname}, ${user.name}.`;
      this.userInitial = user.lastname.charAt(0).toUpperCase();
    } else {
      this.userName = 'Usuario';
      this.userInitial = 'U';
    }
  }

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

