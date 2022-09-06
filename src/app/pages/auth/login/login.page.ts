import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PasswordRecoverPage } from 'src/app/modals/auth/password-recover/password-recover.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  @ViewChild('passwordShowIcon') passIcon;

  constructor(
    private _router: Router,
    private _modalCtrl: ModalController
  ) {}

  ngOnInit() {
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





}
