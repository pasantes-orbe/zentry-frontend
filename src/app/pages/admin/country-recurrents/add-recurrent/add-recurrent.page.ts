import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { PropertiesService } from '../../../../services/properties/properties.service';
import { PropertyInterface } from '../../../../interfaces/property-interface';
import { RecurrentsService } from '../../../../services/recurrents/recurrents.service';
import { Router } from '@angular/router';
import { SearchbarCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-add-recurrent',
  templateUrl: './add-recurrent.page.html',
  styleUrls: ['./add-recurrent.page.scss'],
})
export class AddRecurrentPage implements OnInit {

  // CORRECCIÓN 1: Se cambian las propiedades a 'public' para que sean accesibles desde la plantilla HTML.
  public form: FormGroup;
  public properties: PropertyInterface[] = [];
  public selectedValue: any; // Se mantiene por si se usa en el HTML

  constructor(
    private _formBuilder: FormBuilder,
    private _propertiesService: PropertiesService,
    private _recurrentsService: RecurrentsService,
    private _router: Router,
    private _alertService: AlertService // Se inyecta AlertService para dar feedback
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

  // CORRECCIÓN 2: Se corrige la lógica para buscar propiedades.
  public async getProperties(event: SearchbarCustomEvent) {
    // Se añade el tipo correcto al evento para acceder a 'detail'.
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
      this.properties = []; // Limpia la lista si el término es muy corto.
    }
  }

  // CORRECCIÓN 3: Se añade el manejo de la respuesta del servicio al guardar.
  public saveRecurrent() {
    if (this.form.invalid) {
      this._alertService.presentAlert('Formulario Inválido: Por favor, complete todos los campos requeridos.');
      return;
    }

    const formValues = this.form.value;
    
    this._recurrentsService.addRecurrent(
      formValues.property,
      formValues.name,
      formValues.lastname,
      formValues.dni,
      "admin" // Se asume que este valor es correcto
    ).then((response) => {
      console.log("Recurrente guardado:", response);
      this._alertService.presentAlert('Éxito: El invitado/personal recurrente ha sido guardado correctamente.');
      this.form.reset();
      this.properties = []; // Limpia la lista de propiedades buscadas
      // Opcional: Redirigir al usuario.
      // this._router.navigate(['/ruta-deseada']);
    }).catch((err) => {
      console.error("Error al guardar recurrente:", err);
      this._alertService.presentAlert('Error:No se pudo guardar el recurrente. Intente nuevamente.');
    });
  }
}
