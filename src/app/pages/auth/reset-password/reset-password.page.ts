import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonLabel, IonList, IonText
} from '@ionic/angular/standalone';
import { LoginService } from 'src/app/services/auth/login.service';
import { AlertService } from 'src/app/services/helpers/alert.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonLabel, IonList, IonText,
  ]
})
export class ResetPasswordPage implements OnInit {
  public token: string = '';
  public newPassword: string = '';
  public confirmPassword: string = '';
  public errorMsg: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private alerts: AlertService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token') || '';
    });
  }

  public async submit(): Promise<void> {
    this.errorMsg = '';
    if (!this.token) { this.errorMsg = 'Token inválido o ausente.'; return; }
    if (!this.newPassword || !this.confirmPassword) { this.errorMsg = 'Complete ambos campos.'; return; }
    if (this.newPassword.length < 6) { this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.errorMsg = 'Las contraseñas no coinciden.'; return; }

    this.loginService.resetPasswordWithToken(this.token, this.newPassword).subscribe({
      next: async (resp: any) => {
        const msg = resp?.msg || 'Contraseña restablecida con éxito';
        await this.alerts.showAlert('Listo', msg);
        await this.router.navigate(['/login']);
      },
      error: async (err) => {
        const msg = err?.error?.msg || 'No se pudo restablecer la contraseña';
        this.errorMsg = msg;
      }
    });
  }
}
