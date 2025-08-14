import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RedirectService } from 'src/app/services/helpers/redirect.service';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';

// Importa los componentes de Ionic que usa el HTML
import { IonContent, IonSpinner, IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.page.html',
  styleUrls: ['./splash-screen.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSpinner,
    IonImg
  ]
})
export class SplashScreenPage implements OnInit {

  constructor(
    private router: Router,
    private _userStorage: UserStorageService,
    private _redirectService: RedirectService
  ) { }

  ngOnInit() {
    this.ionViewWillEnter();
  }

  async ionViewWillEnter() {
    setTimeout(async () => {
      // CORRECCIÓN: Se usa _userStorage en lugar de _user_storage
      const user = await this._userStorage.getUser();
      // Descomenta esta lógica si quieres que redirija automáticamente si ya hay sesión
      // if(user){
      //   this._redirectService.redirectByRole(user['role'].name)
      // } else {
      this.router.navigate(["/login"]);
      // }
    }, 3000);
  }
}
