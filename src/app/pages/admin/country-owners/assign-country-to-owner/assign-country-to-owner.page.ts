import { Component, OnInit } from '@angular/core';
import { OwnersService } from '../../../../services/owners/owners.service';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { Router } from '@angular/router';
import { Owner_CountryInterface } from '../../../../interfaces/owner_country-interface';
import { Property_OwnerInterface } from '../../../../interfaces/property_owner-interface';

@Component({
  selector: 'app-assign-country-to-owner',
  templateUrl: './assign-country-to-owner.page.html',
  styleUrls: ['./assign-country-to-owner.page.scss'],
})
export class AssignCountryToOwnerPage implements OnInit {

  // CORRECCIÓN 1: Se declaran todas las propiedades como públicas y se inicializan.
  public form: FormGroup;
  public owners: Owner_CountryInterface[] = [];
  public properties: Property_OwnerInterface[] = [];
  public searchKey: string = '';
  public searchKey1: string = '';

  constructor(
    private _alertService: AlertService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _ownersService: OwnersService,
    private _propertiesService: PropertiesService
  ) {
    this.form = this.createForm();
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const ownersObservable = await this._ownersService.getAllByCountry();
      ownersObservable.subscribe(owners => this.owners = owners);

      const propertiesObservable = await this._propertiesService.getAllProperty_OwnerByCountryID();
      propertiesObservable.subscribe(properties => this.properties = properties);
    } catch (error) {
      console.error("Error al cargar los datos de la página:", error);
    }
  }

  public createForm(): FormGroup {
    return this._formBuilder.group({
      user_id: ['', [Validators.required]],
      property_id: ['', [Validators.required]],
    });
  }

  // CORRECCIÓN 2: Se reestructura el método para usar async/await y se corrigen las llamadas a las alertas.
  public async asignarPropiedadAlUsuario() {
    if (this.form.invalid) {
      // El error indicaba que la función solo espera 1 argumento.
      this._alertService.presentAlert('Formulario Inválido: Por favor, seleccione un propietario y una propiedad.');
      return;
    }

    const userId = this.form.get('user_id')?.value;
    const propertyId = this.form.get('property_id')?.value;

    try {
      // El error indicaba que la función devuelve una Promise, por lo que se usa 'await'.
      await this._ownersService.relationWithProperty(userId, propertyId);
      
      this._alertService.presentAlert('Éxito: La propiedad ha sido asignada correctamente.');
      
      // Se resetea el formulario tras el éxito.
      this.form.reset(); 

    } catch (err) {
      console.error("Error al asignar propiedad:", err);
      this._alertService.presentAlert('Error: No se pudo asignar la propiedad. Intente nuevamente.');
    }
  }
}
