//src/app/pages/admin/country-properties/add-property/add-property.page.ts
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Servicios
import { AlertService } from 'src/app/services/helpers/alert.service';
import { PropertiesService } from 'src/app/services/properties/properties.service';

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

@Component({
  selector: 'app-add-property',
  templateUrl: './add-property.page.html',
  styleUrls: ['./add-property.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    NavbarBackComponent
  ]
})
export class AddPropertyPage implements OnInit {

  public newImg: any = "https://ionicframework.com/docs/img/demos/card-media.png";

  protected data: any;
  private formBuilder: FormBuilder;
  private form: FormGroup;

  constructor(
    protected _formBuilder: FormBuilder, 
    private _properties: PropertiesService, 
    protected _alertService: AlertService, 
    private http: HttpClient, 
    private _router: Router) {
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

  async addProperty() {
    // 1. Validar que el formulario sea válido antes de continuar
    if (this.getForm().invalid) {
      this._alertService.showAlert("Error", "Por favor, completa todos los campos correctamente.");
      return;
    }
    // 2. Crear el objeto FormData con los datos del formulario
    const formData = new FormData();
    formData.append('avatar', this.getForm().get('fileSource').value);
    formData.append('name', this.getForm().get('propertyName').value);
    formData.append('address', this.getForm().get('propertyAddress').value);
    formData.append('number', this.getForm().get('propertyNumber').value);

    // ❌ INCORRECTO: La llamada original no usa await y no maneja el resultado de la promesa.
    // this._properties.addCountry(this.getForm().get('fileSource').value, this.getForm().get('propertyName').value, this.getForm().get('propertyAddress').value, this.getForm().get('propertyNumber').value)
    
    // ✅ CORRECTO: Usamos un bloque try/catch para manejar la promesa que ahora devuelve el servicio.
    try {
      await this._alertService.setLoading(); // Muestra el loading
      
      // ✅ Await la llamada al nuevo método del servicio que ahora devuelve una Promise
      const res: any = await this._properties.addProperty(formData);
      
      await this._alertService.removeLoading(); // Oculta el loading si la llamada fue exitosa
      await this._alertService.showAlert("¡Listo!", res.msg);
      this._router.navigate([`/admin/ver-propiedades`]);
    } catch (err: any) {
      await this._alertService.removeLoading(); // Oculta el loading si hay un error
      console.error("Error al añadir la propiedad:", err);
      const errorMessage = err.error?.msg || "No se pudo agregar la propiedad. Inténtalo de nuevo.";
      await this._alertService.showAlert("¡Ooops!", errorMessage);
    }
    
  }

  public getForm(): FormGroup {
    return this.form;
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      propertyName: ['', [Validators.required, Validators.minLength(5)]],
      propertyAddress: ['', [Validators.required, Validators.minLength(5)]],
      propertyNumber: ['', [Validators.required, Validators.max(10000)]],
      propertyAvatar: new FormControl('', [Validators.required]),
      fileSource: new FormControl('', [Validators.required])
    });
  }
}