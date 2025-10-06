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
  const user = await this._userStorage.getUser();
  const roleName = this.getRoleName(user);

    if (roleName) {
    this._redirectService.redirectByRole(roleName);
    } else {
    this.router.navigate(['/login']);
   }
  }

  private getRoleName(user: any): string | null {
  if (!user) return null;
  // role único o lista de roles
  const r = user.role ?? (Array.isArray(user.roles) ? user.roles[0] : user.roles);
  return typeof r === 'string' ? r : r?.name ?? null;
  }
}
