import { Component, ViewChild, OnInit, OnDestroy, } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Ionic standalone
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonList,
  IonItem, IonLabel, IonIcon, IonActionSheet, IonAlert, IonModal,
  IonInput, IonButton, IonButtons
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';

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
import { UserService } from '../services/user/user.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { AlertService } from '../services/helpers/alert.service';
import { PropertiesService } from '../services/properties/properties.service';
import { AuthStorageService } from '../services/storage/auth-storage.service';
import { LoginService } from '../services/auth/login.service';

// Componentes
import { IncomesComponent } from '../components/incomes/incomes.component';
import { FullProfileComponent } from '../components/full-profile/full-profile.component';

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
  private userAvatar: string | null = null;

  public recurrentsState = false;

  // Estados UI
  public isActionSheetOpen = false;
  public isLogoutAlertOpen = false;
  public isPropertiesModalOpen = false;
  public isSecurityModalOpen = false;
  public isEditProfileModalOpen = false;
  public isFullProfileModalOpen = false;

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
    private authStorage: AuthStorageService,
    private _userService: UserService,
    private _loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
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

      this._userService.getUserByID(this.userID).subscribe((u) => {
        // Refrescar datos principales para header (nombre/apellido/avatar)
        try {
          if (u) {
            const name = u?.name ?? this.owner?.user?.name ?? '';
            const lastname = u?.lastname ?? this.owner?.user?.lastname ?? '';
            this.editName = `${name ?? ''} ${lastname ?? ''}`.trim();
            this.editEmail = u?.email ?? this.editEmail;
            this.editPhone = u?.phone ?? this.editPhone;
            // Si existe estructura owner.user, sincronizar avatar si viene
            if ((this as any).owner && (this as any).owner.user) {
              (this as any).owner.user.avatar = u?.avatar ?? (this as any).owner.user.avatar;
              (this as any).owner.user.name = name;
              (this as any).owner.user.lastname = lastname;
              // Sincronizar estado activo con el backend
              const activeVal = (u as any)?.isActive ?? (u as any)?.is_active;
              if (typeof activeVal === 'boolean') {
                (this as any).owner.user.isActive = activeVal;
              }
            }
            this.userAvatar = u?.avatar ?? this.userAvatar;
            try { this.cdr.detectChanges(); } catch {}
          }
        } catch {}
      });

      this.nuevoPropietarioConectado();
      this.escucharNotificacionesCheckin();
      this.loadOwnerProperties();
    }
  }

  ionViewWillEnter() {
    this.incomesComponent?.ngOnInit();
    // Refrescar datos del usuario (incluido avatar) al entrar a la vista
    try {
      if (this.userID) {
        this._userService.getUserByID(this.userID).subscribe((u: any) => {
          const avatar = u?.avatar;
          if (avatar && (this as any).owner?.user) {
            (this as any).owner.user.avatar = avatar;
          }
          const name = u?.name ?? (this as any)?.owner?.user?.name ?? '';
          const lastname = u?.lastname ?? (this as any)?.owner?.user?.lastname ?? '';
          this.editName = `${name ?? ''} ${lastname ?? ''}`.trim();
          this.editEmail = u?.email ?? this.editEmail;
          this.editPhone = u?.phone ?? this.editPhone;
          // Sincronizar estado activo con el backend
          if ((this as any).owner?.user) {
            const activeVal = u?.isActive ?? u?.is_active;
            if (typeof activeVal === 'boolean') {
              (this as any).owner.user.isActive = activeVal;
            }
          }
          try { this.cdr.detectChanges(); } catch {}
        });
      }
    } catch {}
  }

  // ------- Datos -------
  private loadEditData() {
    if (this.owner && this.owner.user) {
      // Solo asignar si existen; no sobreescribir con placeholders
      this.editName = this.owner.user.name || this.editName;
      this.editEmail = this.owner.user.email || this.editEmail;
      this.editPhone = this.owner.user.phone || this.editPhone;
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
        const alertMessage = `<strong>Check-in</strong><br><strong>Visita:</strong> ${payload.guestName}<br><strong>Unidad:</strong> ${payload.unitName || 'No especificada'}`;
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

  private async viewFullProfile() {
    this.isActionSheetOpen = false;
    const modal = await this.modalCtrl.create({
      component: FullProfileComponent,
      cssClass: 'full-profile-modal',
      componentProps: {
        owner: this.owner,
        editName: this.editName,
        editEmail: this.editEmail,
        editPhone: this.editPhone,
        avatarUrl: this.getAvatarUrl()
      }
    });
    await modal.present();
  }

  public closeFullProfileModal() {
    this.isFullProfileModalOpen = false;
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

    this._loginService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (resp: any) => {
        const msg = resp?.msg || 'Su contraseña ha sido cambiada exitosamente';
        this.alerts.showAlert('Contraseña Actualizada', msg);
        this.closeSecurityModal();
      },
      error: (err) => {
        const msg = err?.error?.msg || 'No se pudo cambiar la contraseña. Intente nuevamente.';
        this.alerts.showAlert('Error', msg);
      }
    });
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
    const n = this.owner?.user?.name ?? this.editName ?? '';
    return n ? n.charAt(0).toUpperCase() : 'U';
  }

  public getAvatarUrl(): string {
    const avatar = (this as any)?.owner?.user?.avatar || this.userAvatar;
    const url = this.normalizeAvatarUrl(avatar);
    if (url) return url;
    return `https://placehold.co/128x128/374151/FFFF?text=${this.getAvatarInitial()}`;
  }

  private normalizeAvatarUrl(a: any): string {
    if (!a || typeof a !== 'string' || a.length === 0) return '';
    if (/^https?:\/\//i.test(a)) return a;
    if (a.startsWith('/')) return `${environment.URL}${a}`;
    return `${environment.URL}/${a}`;
  }

  public getOwnerName(): string {
    const name = (this as any)?.owner?.user?.name ?? '';
    const lastname = (this as any)?.owner?.user?.lastname ?? '';
    const full = `${name} ${lastname}`.trim();
    if (full) return full;
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
