import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss'],
  providers: [UntypedFormBuilder]
})
export class RecoverPasswordComponent {

  private isModalOpen: boolean;
  private formData: FormGroup;
  public userInput: string;

  constructor(private _modalCtrl: ModalController, private formBuilder: UntypedFormBuilder) {
    // this.formData = new FormGroup({
    //     user: new FormControl()
    //   });

    this.formData = this.formBuilder.group({
      userInput: new UntypedFormControl(this.userInput, Validators.required)
    });
  }



  cancel() {
    return this._modalCtrl.dismiss();
  }

  public getUserInput(): string {
    return this.userInput;
  }

  public setUserInput(userInput: string): void {
    this.userInput = userInput;
  }


}
