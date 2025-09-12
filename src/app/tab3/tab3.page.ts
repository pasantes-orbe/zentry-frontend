import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Usar componentes standalone en lugar de IonicModule completo
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonList,
  IonItem, IonLabel, IonIcon, IonActionSheet, IonAlert, IonModal,
  IonInput, IonButton, IonButtons
} from '@ionic/angular/standalone';

// Interfaces
import { OwnerResponse } from '../interfaces/ownerResponse-interface';
import { UserInterface } from '../interfaces/user-interface';

// Socket
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

// Servicios
import { UserStorageService } from '../services/storage/user-storage.service';
import { OwnersService } from '../services/owners/owners.service';
import { OwnerStorageService } from '../services/storage/owner-interface-storage.service';
import { AlertService } from '../services/helpers/alert.service';

// Componentes (solo se importan, no se usan en template para evitar warnings)
import { IncomesComponent } from '../components/incomes/incomes.component';
import { RecurrentsViewAllComponent } from '../components/recurrentsViewAll/recurrents-view-all/recurrents-view-all.component';

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
export class Tab3Page implements OnInit {
    private user: UserInterface;
    private userID: string;
    protected owner: OwnerResponse;
    private socket: Socket;
    public recurrentsState = false;

    // Estados para modals/alerts
    public isActionSheetOpen = false;
    public isLogoutAlertOpen = false;
    public isPropertiesModalOpen = false;
    public isSecurityModalOpen = false;
    public isEditProfileModalOpen = false;
    
    // Variables para edición de perfil
    public editName: string = '';
    public editEmail: string = '';
    public editPhone: string = '';
    
    // Variables para cambio de contraseña
    public currentPassword: string = '';
    public newPassword: string = '';
    public confirmPassword: string = '';
    
    // Opciones del action sheet - CORREGIDAS
    public actionSheetButtons = [
      {
        text: 'Editar Información',
        icon: 'create-outline',
        handler: () => {
          this.openEditProfileModal();
          return true;
        }
      },
      {
        text: 'Ver Datos Completos',
        icon: 'eye-outline', 
        handler: () => {
          this.viewFullProfile();
          return true;
        }
      },
      {
        text: 'Cancelar',
        icon: 'close-outline',
        role: 'cancel'
      }
    ];

    // Botones del alert de logout - CORREGIDO
    public logoutAlertButtons = [
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          this.cancelLogout();
        }
      },
      {
        text: 'Cerrar Sesión',
        handler: () => {
          this.confirmLogout();
        }
      }
    ];

    // Propiedades simuladas
    public properties = [
      { 
        id: 1, 
        address: 'Av. Principal 123, Torre A, Piso 15, Apto 4A', 
        type: 'Apartamento',
        area: '120 m²',
        status: 'Activa'
      },
      { 
        id: 2, 
        address: 'Calle Secundaria 456, Casa 2', 
        type: 'Casa',
        area: '250 m²',
        status: 'Activa'
      }
    ];

    @ViewChild('incomesComponent') incomesComponent: IncomesComponent;

    constructor(
      private _userStorageService: UserStorageService,
      private _ownersService: OwnersService,
      private _ownerStorageService: OwnerStorageService,
      private alerts: AlertService,
      private router: Router
    ) {
      this.socket = io(environment.URL);
    }

    async ngOnInit() {
      const user = await this._userStorageService.getUser();
      if (user) {
        this.userID = String(user.id);
        this._ownersService.getByID(this.userID).subscribe((owner) => {
          this.owner = owner;
          this._ownerStorageService.saveOwner(owner);
          // Cargar datos para edición
          this.loadEditData();
        });
        this.nuevoPropietarioConectado();
        this.escucharNotificacionesCheckin();
      }
    }

    ionViewWillEnter() {
      if (this.incomesComponent) {
        this.incomesComponent.ngOnInit();
      }
    }

    // Función para escuchar las notificaciones de check-in y manejar el error de fecha
    async escucharNotificacionesCheckin() {
      this.socket.on('notificacion-check-in', async (payload) => {
        console.log('Payload recibido del socket:', payload);

        // Asegurarse de que el payload no sea undefined y contenga los datos necesarios
        if (payload && payload.guestName) {
          // Construir un mensaje claro para el alert, evitando el error de fecha
          const alertMessage = `
            <strong>Check-in</strong><br>
            <strong>Visita:</strong> ${payload.guestName}<br>
            <strong>Unidad:</strong> ${payload.unitName || 'No especificada'}
          `;

          await this.alerts.showAlert('Nueva Entrada', alertMessage);
          if (this.incomesComponent) {
            this.incomesComponent.ngOnInit();
          }
        } else {
          console.error('Payload de notificación de check-in inválido:', payload);
          await this.alerts.showAlert('Error de Notificación', 'Se recibió un formato de notificación incorrecto.');
        }
      });
    }

    async nuevoPropietarioConectado() {
      this.socket.emit('owner-connected', this.userID);
    }

    // Cargar datos para edición
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

    // ==== FUNCIONES DE LOS BOTONES DEL PERFIL ====

    // Información Personal
    public onPersonalInfoClick() {
      console.log('Información Personal clickeada');
      this.isActionSheetOpen = true;
    }

    // Abrir modal de edición de perfil
    private openEditProfileModal() {
      this.isActionSheetOpen = false;
      this.isEditProfileModalOpen = true;
    }

    // Guardar cambios de perfil
    public saveProfileChanges() {
      if (!this.editName.trim() || !this.editEmail.trim()) {
        this.alerts.showAlert('Error', 'Nombre y email son obligatorios');
        return;
      }

      // Aquí harías la llamada al servicio para guardar
      this.alerts.showAlert('Perfil Actualizado', 'Los cambios han sido guardados exitosamente');

      this.isEditProfileModalOpen = false;
    }

    // Cerrar modal de edición
    public closeEditProfileModal() {
      this.isEditProfileModalOpen = false;
      this.loadEditData(); // Recargar datos originales
    }

    private viewFullProfile() {
      console.log('Viendo perfil completo...');
      this.isActionSheetOpen = false;
      
      const ownerInfo = this.owner || null;

      this.alerts.showAlert('Perfil Completo', `
        <strong>ID Usuario:</strong> ${ownerInfo?.user?.id || 'No disponible'}<br>
        <strong>Nombre:</strong> ${this.editName}<br>
        <strong>Email:</strong> ${this.editEmail}<br>
        <strong>Teléfono:</strong> ${this.editPhone}<br>
        <strong>Estado:</strong> Activo<br>
        <strong>Tipo:</strong> Propietario
      `);
    }

    // Mis Propiedades - CORREGIDA
    public onMyPropertiesClick() {
      console.log('Mis Propiedades clickeada');
      this.isPropertiesModalOpen = true;
    }

    // Cerrar modal de propiedades
    public closePropertiesModal() {
      this.isPropertiesModalOpen = false;
    }

    // Seguridad y Contraseña - CORREGIDA
    public onSecurityClick() {
      console.log('Seguridad y Contraseña clickeada');
      this.isSecurityModalOpen = true;
    }

    // Cambiar contraseña
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

      // Aquí harías la llamada al servicio
      this.alerts.showAlert('Contraseña Actualizada', 'Su contraseña ha sido cambiada exitosamente');

      this.closeSecurityModal();
    }

    // Cerrar modal de seguridad
    public closeSecurityModal() {
      this.isSecurityModalOpen = false;
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    }

    // Cerrar Sesión
    public onLogoutClick() {
      console.log('Cerrar Sesión clickeada');
      this.isLogoutAlertOpen = true;
    }

    // Confirmar logout - CORREGIDO
    public async confirmLogout() {
      console.log('Cerrando sesión...');
      this.isLogoutAlertOpen = false;
      
      try {
        // Desconectar socket
        if (this.socket) {
          this.socket.disconnect();
        }
        
        // Limpiar storage local (descomenta si tienes estos métodos)
        // await this._userStorageService.clearUser();
        // await this._ownerStorageService.clearOwner();
        
        // Redirigir al login
        await this.router.navigate(['/login']);
        
        // Mostrar mensaje después de redirigir
        await this.alerts.showAlert('Sesión Cerrada', 'Gracias por usar Zentry. ¡Hasta pronto!');
        
      } catch (error) {
        console.error('Error cerrando sesión:', error);
        this.alerts.showAlert('Error', 'Hubo un problema al cerrar la sesión. Intente nuevamente.');
      }
    }

    // Cancelar logout
    public cancelLogout() {
      this.isLogoutAlertOpen = false;
      console.log('Logout cancelado');
    }

    // ==== FUNCIONES ADICIONALES ====

    // Ver recurrentes (función existente mejorada)
    public viewRecurrents() {
      this.recurrentsState = !this.recurrentsState;
      console.log('Estado recurrentes:', this.recurrentsState ? 'Abierto' : 'Cerrado');
    }

    // Función para obtener la inicial del nombre para el avatar
    public getAvatarInitial(): string {
      // Usa la propiedad anidada 'user.name' para obtener la inicial
      if (this.owner && this.owner.user && this.owner.user.name) {
        return this.owner.user.name.charAt(0).toUpperCase();
      }
      return 'U';
    }

    // Función para obtener el nombre completo o placeholder
    public getOwnerName(): string {
      return this.editName || 'Propietario';
    }

    // Función para obtener la información de la propiedad
    public getPropertyInfo(): string {
      return `${this.properties.length} propiedad${this.properties.length !== 1 ? 'es' : ''} registrada${this.properties.length !== 1 ? 's' : ''}`;
    }

    // Limpiar recursos al salir
    ngOnDestroy() {
      if (this.socket) {
        this.socket.disconnect();
      }
    }
}