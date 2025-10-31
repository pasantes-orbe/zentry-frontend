import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, UntypedFormBuilder, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmailHelperService } from 'src/app/services/helpers/email-helper.service';
import { PasswordRecoverService } from '../../../services/auth/password-recover.service';

// ¡CORRECCIÓN 1: Importar SERVICIOS y TIPOS desde @ionic/angular!
import { AlertController, IonModal, ModalController } from '@ionic/angular';

// Importaciones de los COMPONENTES para el template desde @ionic/angular/standalone
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonLabel,
  IonInput
} from '@ionic/angular/standalone';

// Importaciones para los Íconos
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';


@Component({
  selector: 'app-password-recover',
  templateUrl: './password-recover.page.html',
  styleUrls: ['./password-recover.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonInput
  ],
})
export class PasswordRecoverPage implements OnInit {

  @ViewChild(IonModal) modal: IonModal;

  userInput;

  private formData: FormGroup;

  constructor(
    // Ahora que está importado correctamente, esta inyección funcionará
    private _modalCtrl: ModalController,
    private formBuilder: UntypedFormBuilder,
    protected _emailHelper: EmailHelperService,
    private _alertController: AlertController,
    private _passwordRecoverService: PasswordRecoverService,
  ) {
    addIcons({ closeOutline });
    this.buildFormData();
  }

  ngOnInit() {
  }

  cancel() {
    return this._modalCtrl.dismiss();
  }

  async send() {
    const email = this.getFormData().get('userInput').value;
    if (!email) {
      const a = await this._alertController.create({ header: 'Error', message: 'Ingresá un correo válido.' });
      await a.present();
      return;
    }
    const sending = await this._alertController.create({ header: 'Enviando', message: 'Procesando solicitud...' });
    await sending.present();
    this._passwordRecoverService.requestNewPassword(email).subscribe({
      next: async () => {
        await sending.dismiss();
        const ok = await this._alertController.create({ header: 'Solicitud enviada', message: 'El administrador recibió tu solicitud de reestablecimiento de contraseña.' });
        await ok.present();
        this.cancel();
      },
      error: async (err) => {
        await sending.dismiss();
        const msg = err?.error?.msg || err?.message || 'No se pudo enviar la solicitud. Intentalo nuevamente.';
        const e = await this._alertController.create({ header: 'Error', message: msg });
        await e.present();
      }
    });
  }

  private buildFormData(): void {
    this.formData = this.formBuilder.group({
      userInput: new UntypedFormControl(this.userInput, Validators.required)
    })
  }

  public getFormData(): FormGroup {
    return this.formData;
  }
}