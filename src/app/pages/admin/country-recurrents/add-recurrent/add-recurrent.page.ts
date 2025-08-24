import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchbarCustomEvent } from '@ionic/angular';

//Servicios
import { AlertService } from 'src/app/services/helpers/alert.service';
import { PropertiesService } from '../../../../services/properties/properties.service';
import { RecurrentsService } from '../../../../services/recurrents/recurrents.service';

//Interfaces
import { PropertyInterface } from '../../../../interfaces/property-interface';

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

@Component({
  selector: 'app-add-recurrent',
  templateUrl: './add-recurrent.page.html',
  styleUrls: ['./add-recurrent.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    NavbarBackComponent
  ]
})
export class AddRecurrentPage implements OnInit {

  // CORRECCIÓN: La propiedad 'form' ahora es pública para que el HTML pueda acceder a ella.
  public form: FormGroup;
  public properties: PropertyInterface[] = [];
  public selectedValue: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _propertiesService: PropertiesService,
    private _recurrentsService: RecurrentsService,
    private _router: Router,
    private _alertService: AlertService
  ) {
    this.form = this.createForm();
  }

  ngOnInit() {
  }

  private createForm(): FormGroup {
    return this._formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required, Validators.minLength(3)]],
      dni: ['', [Validators.required, Validators.min(1000000), Validators.max(100000000)]],
      property: ['', [Validators.required]],
    });
  }

  // CORRECCIÓN: Se añade el tipo 'any' al evento para solucionar el error de 'event.detail'.
  public async getProperties(event: any) {
    const termino = event.detail.value;

    if (termino && termino.length > 2) {
      try {
        const propertiesObservable = await this._propertiesService.getBySearchTerm(termino);
        propertiesObservable.subscribe((properties) => {
          this.properties = properties;
        });
      } catch (error) {
        console.error("Error al buscar propiedades:", error);
        this.properties = [];
      }
    } else {
      this.properties = [];
    }
  }

  public async saveRecurrent() {
    if (this.form.invalid) {
      this._alertService.presentAlert('Formulario Inválido: Por favor, complete todos los campos requeridos.');
      return;
    }

    const formValues = this.form.value;

    try {
      const response = await this._recurrentsService.addRecurrent(
        formValues.property,
        formValues.name,
        formValues.lastname,
        formValues.dni,
        "admin"
      );
      console.log("Recurrente guardado:", response);
      this._alertService.presentAlert('Éxito: El invitado/personal recurrente ha sido guardado correctamente.');
      this.form.reset();
      this.properties = [];
    } catch (err) {
      console.error("Error al guardar recurrente:", err);
      this._alertService.presentAlert('Error: No se pudo guardar el recurrente. Intente nuevamente.');
    }
  }
}
