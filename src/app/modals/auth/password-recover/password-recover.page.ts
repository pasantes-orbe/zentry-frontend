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
    const alert = await this._alertController.create({
      header: 'Solicitud enviada',
      message: 'El administrador recibió tu solicitud de reestablecimiento de contraseña.',
    })

    await alert.present();
    this._passwordRecoverService.requestNewPassword(this.getFormData().get('userInput').value)
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