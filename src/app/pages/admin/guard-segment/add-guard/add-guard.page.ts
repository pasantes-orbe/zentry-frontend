import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

//Servicios
import { AlertService } from 'src/app/services/helpers/alert.service';
import { EmailHelperService } from 'src/app/services/helpers/email-helper.service';
import { RegisterService } from '../../../../services/auth/register.service';

// Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

@Component({
  selector: 'app-add-guard',
  templateUrl: './add-guard.page.html',
  styleUrls: ['./add-guard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    NavbarBackComponent
  ]
})
export class AddGuardPage implements OnInit {

  public newImg: any = "https://ionicframework.com/docs/img/demos/card-media.png";

  @ViewChild('passwordShowIcon') passIcon;
  private formBuilder: FormBuilder;
  private form: FormGroup;

  constructor(
    private _emailHelperService: EmailHelperService, 
    protected _formBuilder: FormBuilder, 
    protected _alertService: AlertService, 
    private http: HttpClient, 
    private _router: Router, 
    private _registerService: RegisterService
  ) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
  }
  
  ngOnInit() {
  }

  onFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño del archivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this._alertService.presentAlert('El archivo es muy grande. Máximo 5MB permitido.');
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this._alertService.presentAlert('Solo se permiten archivos de imagen.');
        return;
      }

      const reader = new FileReader();
      reader.onload = e => this.newImg = reader.result;
      reader.readAsDataURL(file);
      
      this.form.patchValue({
        fileSource: file
      });
    }
  }

  // Método para activar el file input desde el botón
  public triggerFileInput(): void {
    const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  addGuard(){
    if (this.form.invalid) {
      this._alertService.presentAlert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    this._registerService.register(
      this.getForm().get('vigilatorName').value,
      this.getForm().get('vigilatorLastname').value,
      this.getForm().get('vigilatorDNI').value,
      this.getForm().get('vigilatorEmail').value,
      this.getForm().get('vigilatorPassword').value,
      this.getForm().get('vigilatorPhone').value,
      this.getForm().get('vigilatorBirthdate').value,
      this.getForm().get('fileSource').value,
      'vigilador'
    );
  }

  public getForm(): FormGroup {
    return this.form;
  }

  private createForm(): FormGroup{
    return this.formBuilder.group({
      vigilatorName: ['', [Validators.required, Validators.minLength(3)]],
      vigilatorLastname:['', [Validators.required, Validators.minLength(5)]],
      vigilatorDNI:['',[Validators.required, Validators.min(1000000),Validators.max(100000000)]],
      vigilatorEmail: ['', [Validators.required, Validators.pattern(this._emailHelperService.getEmailPattern())]],
      vigilatorPassword: ['', [Validators.required, Validators.minLength(4)]],
      vigilatorPhone: ['', [Validators.required, Validators.max(10000000000)]],
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