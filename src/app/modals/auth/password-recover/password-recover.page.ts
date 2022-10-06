import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { AlertController, IonModal, ModalController } from '@ionic/angular';
import { EmailHelperService } from 'src/app/services/helpers/email-helper.service';

@Component({
  selector: 'app-password-recover',
  templateUrl: './password-recover.page.html',
  styleUrls: ['./password-recover.page.scss'],
  providers: [UntypedFormBuilder]
})
export class PasswordRecoverPage implements OnInit {

  @ViewChild(IonModal) modal: IonModal;

  userInput;

  private formData: FormGroup;

  constructor(
    private _modalCtrl: ModalController,
    private formBuilder: UntypedFormBuilder,
    protected _emailHelper: EmailHelperService,
    private _alertController: AlertController
  ) {
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
      message: 'El administrador recibio tu solicitud de reestablecimiento de contraseña.',
    })

    await alert.present();

  }

  private buildFormData(): void {
    this.formData = this.formBuilder.group({
      userInput: new UntypedFormControl(this.userInput, Validators.required)
    });
  }

  public getFormData(): FormGroup {
    return this.formData;
  }

}
