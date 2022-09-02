import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  @ViewChild('passwordShowIcon') passIcon;

  constructor(
    private _router: Router
  ) { }

  ngOnInit() {
  }


  protected showPassword(input): void{

    (this.getPasswordType(input) === "password")
    ? this.setPasswordType(input, "text")
    : this.setPasswordType(input, "password");

    this.changeIcon(input);

  }

  private getPasswordType(input): string{
    return input.type;
  }

  private setPasswordType(input, type): void{
    input.type = type;
  }

  private changeIcon(input): void{

    (this.getPasswordType(input) === "password")
    ? this.passIcon.name = "eye-outline"
    : this.passIcon.name = "eye-off-outline"

  }



}
