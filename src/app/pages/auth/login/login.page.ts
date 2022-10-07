import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PasswordRecoverPage } from 'src/app/modals/auth/password-recover/password-recover.page';
import { LoginService } from 'src/app/services/auth/login.service';
import { LoadingService } from 'src/app/services/helpers/loading.service';
import { AuthStorageService } from 'src/app/services/storage/auth-storage.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';

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
    private _modalCtrl: ModalController,
    protected _formBuilder: FormBuilder,
    private _loginService: LoginService,
    private _authStorage: AuthStorageService,
    protected _loading: LoadingService,
    private _userStorage: UserStorageService
  ) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
  }

  ngOnInit() {
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

  login(ev) {

    if(!this.getForm().valid) return;

    this._loading.startLoading("Aguarde un momento...");

    const user = {
      email: this.getForm().get('user').value,
      password: this.getForm().get('password').value
    }

    setTimeout(() => {
      
    
    this._loginService.login(user).subscribe(
      data => {
        this.setErrorMessage(false);

        this._authStorage.saveJWT(data['token']);
        this._userStorage.saveUser(data['user']);
        this._router.navigate(['/home']);

      },
      fail => {
        console.log("ERR", fail);
        const { status, error } = fail;

        if(status == 0){          
          return this.setErrorMessage("Error de conexión con el servidor");
        }
        this.setErrorMessage(fail.error.msg);

      }
    );

    this._loading.stopLoading();

  }, 1000);

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
