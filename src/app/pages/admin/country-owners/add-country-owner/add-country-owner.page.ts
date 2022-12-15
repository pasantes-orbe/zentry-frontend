import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from 'src/app/services/auth/register.service';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { EmailHelperService } from 'src/app/services/helpers/email-helper.service';

@Component({
  selector: 'app-add-country-owner',
  templateUrl: './add-country-owner.page.html',
  styleUrls: ['./add-country-owner.page.scss'],
})
export class AddCountryOwnerPage implements OnInit {

  public newImg: any = 'https://ionicframework.com/docs/img/demos/card-media.png';

  @ViewChild('passwordShowIcon') passIcon;
  private formBuilder: FormBuilder;
  private form: FormGroup;

  constructor(private _registerOwner: RegisterService, protected _formBuilder: FormBuilder, protected _alertService: AlertService, private http: HttpClient, private _router: Router, private _emailHelperService: EmailHelperService ) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
  }

  ngOnInit() {

  }

  onFileChange(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = e => this.newImg = reader.result;

    reader.readAsDataURL(file);

    if (event.target.files.length > 0) {


      const file = event.target.files[0];
      this.form.patchValue({
        fileSource: file
      });
    }
  }

register(){
  this._registerOwner.register(this.getForm().get('ownerName').value,
                                this.getForm().get('ownerLastname').value,
                                this.getForm().get('ownerDNI').value,
                                this.getForm().get('ownerEmail').value,
                                this.getForm().get('ownerPassword').value,
                                this.getForm().get('ownerPhone').value,
                                this.getForm().get('ownerBirthdate').value,
                                this.getForm().get('fileSource').value,
                                'propietario');
}


  private createForm(): FormGroup{
    return this.formBuilder.group({
      ownerName: ['', [Validators.required, Validators.minLength(3)]],
      ownerLastname:['', [Validators.required, Validators.minLength(5)]],
      ownerDNI:['', [Validators.required, Validators.max(99999999)]],
      ownerEmail: ['', [Validators.required, Validators.pattern(this._emailHelperService.getEmailPattern())]],
      ownerPassword: ['', [Validators.required, Validators.minLength(4)]],
      ownerPhone: ['', [Validators.required, Validators.max(10000000000)]],
      ownerBirthdate: ['',Validators.required],
      ownerAvatar: new FormControl('', [Validators.required]),
      fileSource: new FormControl('', [Validators.required]),
    });
}

public getForm(): FormGroup {
  return this.form;
}


private changeIcon(input): void {
  (this.getPasswordType(input) === 'password')
    ? this.passIcon.name = 'eye-outline'
    : this.passIcon.name = 'eye-off-outline';

}

protected showPassword(input): void {

  (this.getPasswordType(input) === 'password')
    ? this.setPasswordType(input, 'text')
    : this.setPasswordType(input, 'password');

  this.changeIcon(input);

}
private getPasswordType(input): string {
  return input.type;
}

private setPasswordType(input, type): void {
  input.type = type;
}

}
