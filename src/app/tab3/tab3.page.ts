import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Ionic standalone
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonList,
  IonItem, IonLabel, IonIcon, IonActionSheet, IonAlert, IonModal,
  IonInput, IonButton, IonButtons
} from '@ionic/angular/standalone';

// Interfaces
import { OwnerResponse } from '../interfaces/ownerResponse-interface';
import { UserInterface } from '../interfaces/user-interface';
import { PropertyInterface } from '../interfaces/property-interface';

// Socket
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

// Servicios
import { UserStorageService } from '../services/storage/user-storage.service';
import { OwnersService } from '../services/owners/owners.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { AlertService } from '../services/helpers/alert.service';
import { PropertiesService } from '../services/properties/properties.service';
import { AuthStorageService } from '../services/storage/auth-storage.service';

// Componentes
import { IncomesComponent } from '../components/incomes/incomes.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonList,
    IonItem, IonLabel, IonIcon, IonActionSheet, IonAlert, IonModal,
    IonInput, IonButton, IonButtons
  ]
})
export class Tab3Page implements OnInit, OnDestroy {
  private user: UserInterface | null = null;
  private userID: string = '';
  protected owner!: OwnerResponse;
  private socket?: Socket;

  public recurrentsState = false;

  // Estados UI
  public isActionSheetOpen = false;
  public isLogoutAlertOpen = false;
  public isPropertiesModalOpen = false;
  public isSecurityModalOpen = false;
  public isEditProfileModalOpen = false;

  // Edición perfil
  public editName: string = '';
  public editEmail: string = '';
  public editPhone: string = '';

  // Cambio de contraseña
  public currentPassword: string = '';
  public newPassword: string = '';
  public confirmPassword: string = '';

  // Lista de propiedades
  public properties: PropertyInterface[] = [];

  @ViewChild('incomesComponent') incomesComponent?: IncomesComponent;

  // ActionSheet (agregado "Cerrar sesión")
  public actionSheetButtons = [
    {
      text: 'Editar Información',
      icon: 'create-outline',
      handler: () => { this.openEditProfileModal(); return true; }
    },
    {
      text: 'Ver Datos Completos',
      icon: 'eye-outline',
      handler: () => { this.viewFullProfile(); return true; }
    },
    {
      text: 'Cerrar sesión',
      icon: 'log-out-outline',
      role: 'destructive',
      handler: () => { this.isLogoutAlertOpen = true; return true; }
    },
    { text: 'Cancelar', icon: 'close-outline', role: 'cancel' }
  ];

  // Alert de logout
  public logoutAlertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => { this.cancelLogout(); }
    },
    {
      text: 'Cerrar Sesión',
      handler: () => { this.confirmLogout(); }
    }
  ];

  constructor(
    private _userStorageService: UserStorageService,
    private _ownersService: OwnersService,
    private _ownerStorageService: OwnerStorageService,
    private alerts: AlertService,
    private router: Router,
    private _propertiesService: PropertiesService,
    private authStorage: AuthStorageService
  ) {
    this.socket = io(environment.URL);
  }

  async ngOnInit() {
    const user = await this._userStorageService.getUser?.();
    if (user) {
      this.user = user as UserInterface;
      this.userID = String(this.user.id);

      this._ownersService.getByID(this.userID).subscribe((owner) => {
        this.owner = owner;
        this._ownerStorageService.saveOwner(owner);
        this.loadEditData();
      });

      this.nuevoPropietarioConectado();
      this.escucharNotificacionesCheckin();
      this.loadOwnerProperties();
    }
  }

  ionViewWillEnter() {
    this.incomesComponent?.ngOnInit();
  }

  // ------- Datos -------
  private loadEditData() {
    if (this.owner && this.owner.user) {
      this.editName = this.owner.user.name || '';
      this.editEmail = this.owner.user.email || '';
      this.editPhone = this.owner.user.phone || '';
    } else {
      this.editName = 'Propietario';
      this.editEmail = 'email@ejemplo.com';
      this.editPhone = '+54 11 1234-5678';
    }
  }

  private async loadOwnerProperties() {
    try {
      (await this._propertiesService.getOwnerProperties()).subscribe({
        next: (properties: PropertyInterface[]) => {
          this.properties = properties;
          console.log('Propiedades sincronizadas:', this.properties);
        },
        error: (err) => {
          console.error('Error al sincronizar propiedades:', err);
          this.alerts.showAlert('Error de Carga', 'No se pudieron cargar sus propiedades.');
        }
      });
    } catch (e) {
      console.error('Error al obtener token para propiedades:', e);
    }
  }

  // ------- Sockets -------
  async escucharNotificacionesCheckin() {
    this.socket?.on('notificacion-check-in', async (payload) => {
      console.log('Payload recibido del socket:', payload);
      if (payload && payload.guestName) {
        const alertMessage = `
          <strong>Check-in</strong><br>
          <strong>Visita:</strong> ${payload.guestName}<br>
          <strong>Unidad:</strong> ${payload.unitName || 'No especificada'}
        `;
        await this.alerts.showAlert('Nueva Entrada', alertMessage);
        this.incomesComponent?.ngOnInit();
      } else {
        console.error('Payload de notificación de check-in inválido:', payload);
        await this.alerts.showAlert('Error de Notificación', 'Se recibió un formato de notificación incorrecto.');
      }
    });
  }

  async nuevoPropietarioConectado() {
    if (this.userID) this.socket?.emit('owner-connected', this.userID);
  }

  // ------- Perfil -------
  public onPersonalInfoClick() {
    this.isActionSheetOpen = true;
  }

  private openEditProfileModal() {
    this.isActionSheetOpen = false;
    this.isEditProfileModalOpen = true;
  }

  public saveProfileChanges() {
    if (!this.editName.trim() || !this.editEmail.trim()) {
      this.alerts.showAlert('Error', 'Nombre y email son obligatorios');
      return;
    }
    // Llamada a backend aquí si aplica
    this.alerts.showAlert('Perfil Actualizado', 'Los cambios han sido guardados exitosamente');
    this.isEditProfileModalOpen = false;
  }

  public closeEditProfileModal() {
    this.isEditProfileModalOpen = false;
    this.loadEditData();
  }

  private viewFullProfile() {
    const ownerInfo = this.owner || null;
    this.isActionSheetOpen = false;
    this.alerts.showAlert('Perfil Completo', `
      <strong>ID Usuario:</strong> ${ownerInfo?.user?.id || 'No disponible'}<br>
      <strong>Nombre:</strong> ${this.editName}<br>
      <strong>Email:</strong> ${this.editEmail}<br>
      <strong>Teléfono:</strong> ${this.editPhone}<br>
      <strong>Estado:</strong> Activo<br>
      <strong>Tipo:</strong> Propietario
    `);
  }

  // ------- Propiedades -------
  public onMyPropertiesClick() {
    this.isPropertiesModalOpen = true;
  }

  public closePropertiesModal() {
    this.isPropertiesModalOpen = false;
  }

  // ------- Seguridad -------
  public onSecurityClick() {
    this.isSecurityModalOpen = true;
  }

  public changePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.alerts.showAlert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.alerts.showAlert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (this.newPassword.length < 6) {
      this.alerts.showAlert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    // Llamada a backend aquí si aplica
    this.alerts.showAlert('Contraseña Actualizada', 'Su contraseña ha sido cambiada exitosamente');
    this.closeSecurityModal();
  }

  public closeSecurityModal() {
    this.isSecurityModalOpen = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  // ------- Logout -------
  public onLogoutClick() {
    this.isLogoutAlertOpen = true;
  }

  public async confirmLogout() {
    this.isLogoutAlertOpen = false;
    try {
      // Cerrar sockets y limpiar listeners
      if (this.socket) {
        this.socket.removeAllListeners?.();
        this.socket.disconnect();
        this.socket = undefined;
      }

      // Limpiar credenciales y caches
      await this.authStorage.clearJWT();

      // Si existen helpers de clear, usalos. Si no existen, no rompe.
      await (this._userStorageService as any)?.clearUser?.();
      await (this._ownerStorageService as any)?.clearOwner?.();

      // Limpio datos en memoria
      this.user = null;
      this.userID = '';
      this.properties = [];

      // Navegación sin posibilidad de volver
      await this.router.navigateByUrl('/login', { replaceUrl: true });

      // Aviso
      await this.alerts.showAlert('Sesión Cerrada', 'Cerraste sesión correctamente.');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      this.alerts.showAlert('Error', 'Hubo un problema al cerrar la sesión. Intente nuevamente.');
    }
  }

  public cancelLogout() {
    this.isLogoutAlertOpen = false;
  }

  // ------- Utilidades -------
  public viewRecurrents() {
    this.recurrentsState = !this.recurrentsState;
  }

  public getAvatarInitial(): string {
    if (this.owner?.user?.name) return this.owner.user.name.charAt(0).toUpperCase();
    return 'U';
  }

  public getOwnerName(): string {
    return this.editName || 'Propietario';
  }

  public getPropertyInfo(): string {
    return `${this.properties.length} propiedad${this.properties.length !== 1 ? 'es' : ''} registrada${this.properties.length !== 1 ? 's' : ''}`;
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.removeAllListeners?.();
      this.socket.disconnect();
    }
  }
}
