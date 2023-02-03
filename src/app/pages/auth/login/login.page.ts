import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PasswordRecoverPage } from 'src/app/modals/auth/password-recover/password-recover.page';
import { LoginService } from 'src/app/services/auth/login.service';
import { GuardsService } from 'src/app/services/guards/guards.service';
import { LoadingService } from 'src/app/services/helpers/loading.service';
import { RedirectService } from 'src/app/services/helpers/redirect.service';
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';
import { IntervalStorageService } from 'src/app/services/storage/interval-storage.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';
import { Storage } from '@ionic/storage';
import { PushService } from 'src/app/services/pushNotifications/push.service';
import { Capacitor } from '@capacitor/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  @ViewChild('passwordShowIcon') passIcon;

  private formBuilder: FormBuilder;
  private form: FormGroup;
  private errorMessage: any;

  constructor(
    private _router: Router,
    private storage: Storage,
    private _modalCtrl: ModalController,
    protected _formBuilder: FormBuilder,
    private _loginService: LoginService,
    private _guardsService: GuardsService,
    private _authStorage: AuthStorageService,
    protected _loading: LoadingService,
    private _userStorage: UserStorageService,
    private _intervalStorageService: IntervalStorageService,
    private _countryStorageService: CountryStorageService,
    private _redirectService: RedirectService,
    private _webSocketService: WebSocketService,
    private _pushService: PushService
  ) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
  }

   async ngOnInit() { 
    this._webSocketService.conectar()
  }

  private async ionViewWillEnter() {

    
    this.setErrorMessage(false);
    // Redireccionar si ya esta almacenado el usuario en storage
    const user = await this._userStorage.getUser();

    if (user) this._redirectService.redirectByRole(user['role'].name);


  }

  login() {

    if (!this.getForm().valid) return;

    this._loading.startLoading("Aguarde un momento...");
    this.setErrorMessage(false);

    const user = {
      email: this.getForm().get('user').value,
      password: this.getForm().get('password').value
    }

    // setTimeout(() => {


      this._loginService.login(user).subscribe(
        data => {

          this._authStorage.saveJWT(data['token']);
          console.log(data['user'])
          this._userStorage.saveUser(data['user']);


          const { name } = data['user'].role;

          console.log("Esta es la plataforma", Capacitor.getPlatform());

          if (Capacitor.getPlatform() === 'android') {
            this._pushService.setOneSignalID(data['user']['id']) // Si estoy en un android seteeo el id y le asigno el rol
            this._pushService.setTagToExternalId(data['user']['id'], name)
          }

          if(name === 'vigilador'){
            this._guardsService.getGuardByCountryId(data['user']['id']).subscribe(data => {
              console.log(data)
              this._countryStorageService.saveCountry(data['country'])
            })
          }
          this._redirectService.redirectByRole(name);
          this.setErrorMessage("Iniciando sesion...");
          this._loading.stopLoading();

        },
        fail => {
          console.log("ERR", fail);
          const { status, error } = fail;

          if (status == 0) {
            return this.setErrorMessage("Error de conexión con el servidor");
          }
          this.setErrorMessage(fail.error.msg);
          this._loading.stopLoading();

        }
      );

      

    // }, 1000);

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
