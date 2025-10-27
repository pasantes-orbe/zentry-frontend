import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { LoadingService } from 'src/app/services/helpers/loading.service';
import { AmenitieService } from '../../../../services/amenities/amenitie.service';
import { PhotoService } from 'src/app/services/photos/photo.service';

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

@Component({
  selector: 'app-add-amenity',
  templateUrl: './add-amenity.page.html',
  styleUrls: ['./add-amenity.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    NavbarBackComponent
  ]
})
export class AddAmenityPage implements OnInit {

  public newImg: string | ArrayBuffer | null = 'https://ionicframework.com/docs/img/demos/card-media.png';
  public form: FormGroup;

  constructor(
    protected _formBuilder: FormBuilder,
    protected _loading: LoadingService,
    private _alertService: AlertService,
    private _amenitie: AmenitieService,
    private photoService: PhotoService,
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void { }

  async saveAmenitie(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = this.form.get('name')?.value as string;
    const address = this.form.get('address')?.value as string;
    const avatar = this.form.get('avatar')?.value as File | null;

    if (!(avatar instanceof File)) {
      // Esto es redundante gracias al form.invalid, pero asegura que se marque el error.
      this.form.get('avatar')?.setErrors({ required: true });
      this.form.get('avatar')?.markAsTouched();
      this._alertService.showAlert("¡Ooops!", "Por favor selecciona una foto para el lugar de reserva.");
      return;
    }

    await this._amenitie.addAmenitiy(name, address, avatar);
  }

  private createForm(): FormGroup {
    return this._formBuilder.group({
      name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      avatar: new FormControl<File | null>(null, [Validators.required])
    });
  }
  
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input?.files?.length) {
      return;
    }

    const file = input.files.item(0);
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.newImg = reader.result;
    };
    reader.readAsDataURL(file);

    // Asignamos el objeto File al control 'avatar'
    const avatarControl = this.form.get('avatar');
    avatarControl?.setValue(file);
    avatarControl?.markAsDirty();
    avatarControl?.markAsTouched();
    avatarControl?.updateValueAndValidity();

    // Esto permite seleccionar el mismo archivo si el usuario cambia de opinión
    input.value = '';
  }

  public getForm(): FormGroup {
    return this.form;
  }
}