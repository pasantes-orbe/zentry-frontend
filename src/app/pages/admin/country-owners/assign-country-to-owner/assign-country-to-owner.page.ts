// --- Archivo: assign-country-to-owner.page.ts (Corregido) ---

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Servicios
import { OwnersService } from '../../../../services/owners/owners.service';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { AlertService } from 'src/app/services/helpers/alert.service';

//Interfaces
import { Owner_CountryInterface } from '../../../../interfaces/owner_country-interface';
import { Property_OwnerInterface } from '../../../../interfaces/property_owner-interface';

//Componentes
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

//Pipes
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe'

@Component({
  selector: 'app-assign-country-to-owner',
  templateUrl: './assign-country-to-owner.page.html',
  styleUrls: ['./assign-country-to-owner.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    NavbarBackComponent,
    FilterByPipe
  ]
})
export class AssignCountryToOwnerPage implements OnInit {

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

  public async asignarPropiedadAlUsuario() {
    if (this.form.invalid) {
      this._alertService.presentAlert('Formulario Inválido: Por favor, seleccione un propietario y una propiedad.');
      return;
    }

    const userId = this.form.get('user_id')?.value;
    const propertyId = this.form.get('property_id')?.value;

    try {
      await this._ownersService.relationWithProperty(userId, propertyId);
      this._alertService.presentAlert('Éxito: La propiedad ha sido asignada correctamente.');
      this.form.reset();
    } catch (err) {
      console.error("Error al asignar propiedad:", err);
      this._alertService.presentAlert('Error: No se pudo asignar la propiedad. Intente nuevamente.');
    }
  }

  //  Función agregada para que funcione el HTML
  public getForm(): FormGroup {
    return this.form;
  }
}
