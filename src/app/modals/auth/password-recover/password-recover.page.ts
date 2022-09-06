import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { IonModal, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-password-recover',
  templateUrl: './password-recover.page.html',
  styleUrls: ['./password-recover.page.scss'],
  providers: [UntypedFormBuilder]
})
export class PasswordRecoverPage implements OnInit {

  @ViewChild(IonModal) modal: IonModal;

  userInput;
  
  public formData: FormGroup;

  constructor(private _modalCtrl: ModalController, private formBuilder: UntypedFormBuilder) {
    this.formData = this.formBuilder.group({
      userInput: new UntypedFormControl(this.userInput, Validators.required)
    });
  }

  ngOnInit() {
  }

  cancel() {
    return this._modalCtrl.dismiss();
  }

  send(){
    
  }

}
