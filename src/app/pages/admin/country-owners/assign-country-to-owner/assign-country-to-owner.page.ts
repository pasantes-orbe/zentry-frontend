// --- Archivo: assign-country-to-owner.page.ts (Corregido y Refactorizado) ---

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
    NavbarBackComponent
    // El FilterByPipe ya no es necesario
  ]
})
export class AssignCountryToOwnerPage implements OnInit {

  public form: FormGroup;
  
  // Listas originales con todos los datos
  public owners: Owner_CountryInterface[] = [];
  public properties: Property_OwnerInterface[] = [];

  // Listas que se mostrarán en la vista y que serán filtradas
  public filteredOwners: Owner_CountryInterface[] = [];
  public filteredProperties: Property_OwnerInterface[] = [];

  public loading = true; // Añadimos estado de carga

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
    this.loading = true;

    try {
      // Cargar Propietarios desde el Backend
      const ownersObservable = await this._ownersService.getAllByCountry();
      ownersObservable.subscribe(ownersData => {
        this.owners = ownersData || []; // Aseguramos que sea un array
        this.filteredOwners = [...this.owners]; 
      });

      // Cargar Propiedades desde el Backend
      const propertiesObservable = await this._propertiesService.getAllProperty_OwnerByCountryID();
      propertiesObservable.subscribe(propertiesData => {
        this.properties = propertiesData || []; // Aseguramos que sea un array
        this.filteredProperties = [...this.properties];
      });

    } catch (error) {
      console.error("Error al cargar los datos de la página:", error);
      this._alertService.presentAlert('Error al cargar datos. Intente nuevamente.');
    } finally {
      this.loading = false;
    }
  }

  public onSearchOwners(event: any): void {
    const searchTerm = (event.target.value || '').toLowerCase();
    if (!searchTerm) {
      this.filteredOwners = [...this.owners];
      return;
    }
    this.filteredOwners = this.owners.filter(o => {
      const user = o.user;
      if (!user) return false;
      //CORRECCIÓN: Convertimos el DNI a string antes de usar .includes()
      return (user.name.toLowerCase().includes(searchTerm) ||
              user.lastname.toLowerCase().includes(searchTerm) ||
              String(user.dni).toLowerCase().includes(searchTerm));
    });
  }

  public onSearchProperties(event: any): void {
    const searchTerm = (event.target.value || '').toLowerCase();
    if (!searchTerm) {
      this.filteredProperties = [...this.properties];
      return;
    }
    this.filteredProperties = this.properties.filter(p => {
        const prop = p.property;
        if (!prop) return false;
        //CORRECCIÓN: Convertimos el número de propiedad a string
        return (prop.name.toLowerCase().includes(searchTerm) ||
                String(prop.number).toLowerCase().includes(searchTerm));
    });
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

  public getForm(): FormGroup {
    return this.form;
  }
}

