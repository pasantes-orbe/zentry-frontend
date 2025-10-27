import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class HomePage implements OnInit, OnDestroy {

  // Propiedad para almacenar el nombre del usuario dinámicamente.
  public userName: string = 'Cargando...';
  public userInitial: string = '';

  // Tracking GPS
  private locationWatchId: number | null = null;
  private locationInterval: any = null;
  private userId: number | null = null;
  private countryId: number | null = null;

  constructor(
    private router: Router,
    private _authStorage: AuthStorageService,
    private _userStorage: UserStorageService,
    private _countryStorageService: CountryStorageService,
    private _webSocketService: WebSocketService,
    public theme: ThemeService
  ) {}

  async ngOnInit() {
    this.theme.init('guard');
    await this.loadUserData();
    
    // Conectar socket ANTES de iniciar tracking
    await this._webSocketService.conectar();
    
    // Esperar 1 segundo para asegurar conexión
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Escuchar notificaciones de antipánico
    this._webSocketService.escucharNotificacionesAntipanico();
    
    await this.startLocationTracking();
  }

  ngOnDestroy() {
    this.stopLocationTracking();
  }
  
  /**
   * Carga los datos del usuario desde el almacenamiento de forma asíncrona.
   * Utiliza la interfaz UserInterface con `name` y `lastname`.
   */
  async loadUserData() {
    const user = await this._userStorage.getUser();
    const country = await this._countryStorageService.getCountry();

    if (user && user.lastname && user.name) {
      this.userName = `${user.lastname}, ${user.name}.`;
      this.userInitial = user.lastname.charAt(0).toUpperCase();
      this.userId = user.id;
    } else {
      this.userName = 'Usuario';
      this.userInitial = 'U';
    }

    if (country) {
      this.countryId = country.id;
    }

    console.log('[HomePage] User ID:', this.userId, 'Country ID:', this.countryId);
  }

  /**
   * Inicia el tracking GPS del guardia
   */
  private async startLocationTracking() {
    if (!navigator.geolocation) {
      console.warn('[HomePage] Geolocation no disponible en este dispositivo');
      return;
    }

    console.log('[HomePage] Iniciando tracking GPS...');

    // Enviar ubicación cada 10 segundos
    this.locationInterval = setInterval(() => {
      this.sendCurrentLocation();
    }, 10000);

    // Enviar ubicación inmediatamente
    this.sendCurrentLocation();
  }

  /**
   * Envía la ubicación actual al backend
   */
  private sendCurrentLocation() {
    if (!this.userId || !this.countryId) {
      console.warn('[HomePage] No se puede enviar ubicación: falta userId o countryId');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        console.log(`[HomePage] Precisión GPS: ${accuracy.toFixed(0)} metros`);
        
        const locationData = {
          id_user: this.userId,
          id_country: this.countryId,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          user_name: this.userName.split(',')[1]?.trim() || 'Guardia',
          user_lastname: this.userName.split(',')[0]?.trim() || ''
        };

        this._webSocketService.enviarUbicacionGuardia(locationData);
      },
      (error) => {
        console.error('[HomePage] Error al obtener ubicación:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,  // Aumentado a 15 segundos
        maximumAge: 0
      }
    );
  }

  /**
   * Detiene el tracking GPS
   */
  private stopLocationTracking() {
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
      this.locationInterval = null;
      console.log('[HomePage] Tracking GPS detenido');
    }

    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
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
    this.stopLocationTracking();
    this._authStorage.clearJWT();
    this._userStorage.clearUser();
    this._countryStorageService.clearCountry();
    this._webSocketService.desconectar();
    this.router.navigate(['/login']);
    console.log('Sesión cerrada correctamente.');
  }
}

