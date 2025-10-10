// src/app/pages/auth/login/login.page.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { OwnerStorageService } from 'src/app/services/storage/owner-interface-storage.service';

// Componentes Standalone de Ionic
import {
  IonContent, IonHeader, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonText, IonCard, IonCardHeader, IonAvatar, IonCardContent, 
} from '@ionic/angular/standalone';

// Íconos
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

// Servicios y otros
import { PasswordRecoverPage } from 'src/app/modals/auth/password-recover/password-recover.page';
import { LoginService } from 'src/app/services/auth/login.service';
import { GuardsService } from 'src/app/services/guards/guards.service';
import { LoadingService } from 'src/app/services/helpers/loading.service';
import { RedirectService } from 'src/app/services/helpers/redirect.service';
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { PushService } from 'src/app/services/pushNotifications/push.service';
import { Capacitor } from '@capacitor/core';
import { LoaderComponent } from '../../../components/loader/loader.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoaderComponent,
    IonContent,
    IonHeader,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
    IonCard,
    IonCardHeader,
    IonAvatar,
    IonCardContent,
  ]
})
export class LoginPage implements OnInit {

  @ViewChild('passwordShowIcon') passIcon;

  private formBuilder: FormBuilder;
  private form: FormGroup;
  private errorMessage: any;

  constructor(
    private _router: Router,
    private _modalCtrl: ModalController,
    protected _formBuilder: FormBuilder,
    private _loginService: LoginService,
    private _guardsService: GuardsService,
    private _authStorage: AuthStorageService,
    protected _loading: LoadingService,
    private _userStorage: UserStorageService,
    private _countryStorageService: CountryStorageService,
    private _redirectService: RedirectService,
    private _webSocketService: WebSocketService,
    private _pushService: PushService,
    private _ownerStorage: OwnerStorageService
  ) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
    addIcons({ eyeOutline, eyeOffOutline });
  }

  async ngOnInit() {
    //this._webSocketService.conectar();
  }

  private async ionViewWillEnter() {
    this.setErrorMessage(false);
    const user = await this._userStorage.getUser();
    // Comentario: Se mantiene el chequeo de sesión activa, si el usuario existe, se redirige.
    if (user) this._redirectService.redirectByRole(user['role'].name);
  }

  // INICIO DE MODIFICACIÓN: Se cambia el método 'login()' a 'async login()' (Línea 134)
  async login() { 
    if (!this.getForm().valid) return;
    // Comentario: Se inicia el loader.
    this._loading.startLoading("Aguarde un momento...");
    this.setErrorMessage(false);
    const user = {
      email: this.getForm().get('user').value,
      password: this.getForm().get('password').value
    }
    
    // INICIO DE MODIFICACIÓN: Se reemplaza la suscripción por un bloque try/catch/finally con await/toPromise().
    try {
      // 1. Login
      const data: any = await this._loginService.login(user).toPromise();

      // DEBUG: Ver qué devuelve el backend (Se mantienen tus logs)
      console.log('==========================================');
      console.log('RESPUESTA COMPLETA DEL LOGIN:', data);
      console.log('USER:', data['user']);
      console.log('USER NAME:', data['user']?.name, data['user']?.lastname);
      console.log('USER EMAIL:', data['user']?.email);
      console.log('---');
      console.log('OWNER:', data['owner']);
      console.log('OWNER ID:', data['owner']?.id);
      console.log('OWNER NAME:', data['owner']?.user?.name, data['owner']?.user?.lastname);
      console.log('OWNER EMAIL:', data['owner']?.user?.email);
      console.log('PROPERTY NUMBER:', data['owner']?.property?.number);
      console.log('PROPERTY NAME:', data['owner']?.property?.name);
      console.log('==========================================');

      // 2. Guardar Token, Usuario y Owner
      await this._authStorage.saveJWT(data['token']);
      await this._userStorage.saveUser(data['user']);
      
      if (data['owner']) {
        await this._ownerStorage.saveOwner(data['owner']);
        console.log('Owner guardado en storage correctamente');
      }

      //(CORRECCIÓN CRÍTICA P-WS)
      // Conectar WebSocket SOLO después de haber guardado el JWT.
      await this._webSocketService.conectar(); 

      // 3. Obtener Rol (Protección contra TypeError)
      const roleName = data['user']?.role?.name; // Se añade '?' para protección.
      if (!roleName) throw { error: { msg: "El rol del usuario no está definido o es nulo." }};

      // 4. Lógica de Notificaciones
      if (Capacitor.getPlatform() === 'android') {
        this._pushService.setOneSignalID(data['user']['id'])
      }

      // 5. Redirección y lógica específica del Vigilador
      if (roleName == "vigilador") {
        // Comentario: Flujo Vigilador: Se espera a obtener y guardar el country antes de redirigir.
        const guardRes: any = await this._guardsService.getGuardByCountryId(data['user']['id']).toPromise();
        
        if (guardRes && guardRes['country']) {
          await this._countryStorageService.saveCountry(guardRes['country']);
          // Comentario: Redirección ÚNICA tras guardar el country. Soluciona el loop.
          this._redirectService.redirectByRole(roleName); 
          this.setErrorMessage("Iniciando sesion...");
        } else {
          // Comentario: Caso vigilador sin país asignado: No redirige, solo muestra aviso.
          this.setErrorMessage("Vigilador no tiene un Countries asignado. Contacte a un administrador.");
        }

      } else {
        // Comentario: Otros Roles: Redirige inmediatamente.
        this._redirectService.redirectByRole(roleName);
      }

    } catch (fail) {
      // Manejo unificado de errores (Login, Country o Rol no encontrado)
      console.error("ERR", fail);
      const status = fail.status;
      
      if (status == 0) {
        this.setErrorMessage("Error de conexión con el servidor");
      } else if (fail.error && fail.error.msg) {
        // Error estándar del backend
        this.setErrorMessage(fail.error.msg);
      } else {
        // Error genérico o error lanzado internamente (ej: rol no definido)
        this.setErrorMessage("Credenciales incorrectas o error interno.");
      }

    } finally {
      // Comentario: Cierre del Loader (Garantizado en éxito o error). Soluciona loader pegado.
      this._loading.stopLoading();
    }
    // FIN DE MODIFICACIÓN: Se reemplazó el bloque de suscripción.
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      user: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  public getForm(): FormGroup {
    return this.form;
  }

  async openModal() {
    const modal = await this._modalCtrl.create({
      component: PasswordRecoverPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    console.log(data, role);
  }

  protected showPassword(input): void {
    (this.getPasswordType(input) === "password")
      ? this.setPasswordType(input, "text")
      : this.setPasswordType(input, "password");
    this.changeIcon(input);
  }

  private changeIcon(input): void {
    (this.getPasswordType(input) === "password")
      ? this.passIcon.name = "eye-outline"
      : this.passIcon.name = "eye-off-outline"
  }

  private getPasswordType(input): string {
    return input.type;
  }

  private setPasswordType(input, type): void {
    input.type = type;
  }

  public getErrorMessage(): any {
    return this.errorMessage;
  }

  public setErrorMessage(errorMessage: any): void {
    this.errorMessage = errorMessage;
  }
}