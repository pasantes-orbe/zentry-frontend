//src/app/pages/admin/country-properties/add-property/add-property.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Servicios
import { AlertService } from 'src/app/services/helpers/alert.service';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

// Componentes
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';

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

  public newImg: any = 'https://ionicframework.com/docs/img/demos/card-media.png';

  protected data: any;
  private formBuilder: FormBuilder;
  private form: FormGroup;

  constructor(
    protected _formBuilder: FormBuilder,
    private _properties: PropertiesService,
    protected _alertService: AlertService,
    private _router: Router,
    private _countryStorage: CountryStorageService
  ) {
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
  }

  ngOnInit() {}

  onFileChange(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => this.newImg = reader.result;
    reader.readAsDataURL(file);

    this.form.patchValue({ fileSource: file });
  }

  async addProperty() {
    if (this.getForm().invalid) {
      this._alertService.showAlert('Error', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', this.getForm().get('fileSource')!.value);
    formData.append('name', this.getForm().get('propertyName')!.value);
    formData.append('address', this.getForm().get('propertyAddress')!.value);
    formData.append('number', this.getForm().get('propertyNumber')!.value);

    try {
      await this._alertService.setLoading('Guardando propiedad…');

      // El service ahora devuelve la respuesta; no navega ni muestra alerts
      await this._properties.addProperty(formData);

      await this._alertService.removeLoading();
      await this._alertService.showAlert('¡Listo!', 'La propiedad se agregó con éxito.');

      // Spinner breve y redirección al dashboard del country actual
      const country = await this._countryStorage.getCountry();
      const countryId = country?.id;

      if (countryId) {
        await this._alertService.setLoading('Redirigiendo al Dashboard…');
        this._router.navigate(['/admin/country-dashboard', countryId]).then(() => {
          setTimeout(() => { this._alertService.removeLoading(); }, 300);
        });
      } else {
        // Fallback si no hay country en storage
        this._router.navigate(['/admin/home']);
      }

    } catch (err: any) {
      await this._alertService.removeLoading();
      console.error('Error al añadir la propiedad:', err);
      const errorMessage = err?.error?.msg || err?.message || 'No se pudo agregar la propiedad. Intenta de nuevo.';
      await this._alertService.showAlert('¡Ooops!', errorMessage);
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
      fileSource: new FormControl('', [Validators.required]),
    });
  }
}
