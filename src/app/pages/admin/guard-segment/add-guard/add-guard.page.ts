import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { RegisterService } from '../../../../services/auth/register.service';

@Component({
  selector: 'app-add-guard',
  templateUrl: './add-guard.page.html',
  styleUrls: ['./add-guard.page.scss'],
})
export class AddGuardPage implements OnInit {

  public newImg: any = "https://ionicframework.com/docs/img/demos/card-media.png";

  @ViewChild('passwordShowIcon') passIcon;
  private formBuilder: FormBuilder;
  private form: FormGroup;

  constructor(protected _formBuilder: FormBuilder, protected _alertService: AlertService, private http: HttpClient, private _router: Router, private _registerService: RegisterService) {
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

  addGuard(){
    this._registerService.register(this.getForm().get('vigilatorName').value,
    this.getForm().get('vigilatorLastname').value,
    this.getForm().get('vigilatorDNI').value,
    this.getForm().get('vigilatorEmail').value,
    this.getForm().get('vigilatorPassword').value,
    this.getForm().get('vigilatorPhone').value,
    this.getForm().get('vigilatorBirthdate').value,
    this.getForm().get('fileSource').value,
    'vigilador')

  }
  public getForm(): FormGroup {
    return this.form;
  }

  private createForm(): FormGroup{
    return this.formBuilder.group({
      vigilatorName: ['', [Validators.required, Validators.minLength(3)]],
      vigilatorLastname:['', [Validators.required, Validators.minLength(5)]],
      vigilatorDNI:['', Validators.required],
      vigilatorEmail: ['', Validators.required],
      vigilatorPassword: ['', Validators.required],
      vigilatorPhone: ['', Validators.required],
      vigilatorBirthdate: ['', Validators.required],
      vigilatorAvatar: new FormControl('', [Validators.required]),
      fileSource: new FormControl('', [Validators.required])
    });
}

private changeIcon(input): void {
  (this.getPasswordType(input) === "password")
    ? this.passIcon.name = "eye-outline"
    : this.passIcon.name = "eye-off-outline"

}

protected showPassword(input): void {

  (this.getPasswordType(input) === "password")
    ? this.setPasswordType(input, "text")
    : this.setPasswordType(input, "password");

  this.changeIcon(input);

}
private getPasswordType(input): string {
  return input.type;
}

private setPasswordType(input, type): void {
  input.type = type;
}

}
