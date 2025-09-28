// src/app/pages/admin/country-owners/assign-country-to-owner/assign-country-to-owner.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, catchError, of, finalize, Observable } from 'rxjs'; // Importamos finalize y Observable

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
    private _propertiesService: PropertiesService,
    private _toastCtrl: ToastController // Se añade para feedback
  ) {
    this.form = this.createForm();
  }

  ngOnInit() {
    this.loadData();
  }

  /**
   * Carga los propietarios y propiedades usando forkJoin para manejo concurrente de Observables.
   */
  public async loadData(): Promise<void> {
    this.loading = true;

    // 1. Definimos los Observables con manejo de errores local
    const owners$: Observable<Owner_CountryInterface[]> = this._ownersService.getAllByCountry().pipe(
      catchError(err => {
        console.error("Error al cargar propietarios:", err);
        // Mostrar alerta de error de carga para propietarios
        this.presentToast('Error al cargar propietarios. Se muestra lista vacía.', 'danger');
        return of([]); 
      })
    );

    // Asumimos que _propertiesService.getAllProperty_OwnerByCountryID() devuelve un Observable<Property_OwnerInterface[]>.
    const properties$: Observable<Property_OwnerInterface[]> = (await this._propertiesService.getAllProperty_OwnerByCountryID()).pipe(
      catchError(err => {
        console.error("Error al cargar propiedades:", err);
        // Mostrar alerta de error de carga para propiedades
        this.presentToast('Error al cargar propiedades. Se muestra lista vacía.', 'danger');
        return of([]); 
      })
    );

    // 2. Usamos forkJoin para esperar a que ambos Observables emitan un valor
    forkJoin([owners$, properties$]).pipe(
      // Utilizamos 'finalize' para desactivar el loader después de que la subscripción se complete (éxito o error).
      finalize(() => this.loading = false) 
    ).subscribe({
      next: ([ownersData, propertiesData]) => {
        // Asignación de Propietarios
        this.owners = ownersData || [];
        this.filteredOwners = [...this.owners];

        // Asignación de Propiedades
        this.properties = propertiesData || [];
        this.filteredProperties = [...this.properties];
      },
      error: (err) => {
         // Este bloque solo se alcanza si el flujo de RxJS falla de una manera no manejada
         console.error("Fallo inesperado después de catchError:", err);
      }
    });
  }

  public onSearchOwners(event: any): void {
    const searchTerm = (event.target.value || '').toLowerCase();
    if (!searchTerm) {
      this.filteredOwners = [...this.owners];
      return;
    }
    this.filteredOwners = this.owners.filter(o => {
      // 🚨 CORRECCIÓN FINAL: Solo usamos 'o.user' para coincidir con Owner_CountryInterface.
      const user = o.user; 
      
      if (!user) return false;
      
      return (user.name?.toLowerCase().includes(searchTerm) ||
              user.lastname?.toLowerCase().includes(searchTerm) ||
              // Se convierte DNI a string para que la búsqueda por inclusión funcione
              String(user.dni || '').toLowerCase().includes(searchTerm)); 
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
        
        return (prop.name?.toLowerCase().includes(searchTerm) ||
                prop.address?.toLowerCase().includes(searchTerm) ||
                // Asumo que 'prop.number' es una propiedad válida para la búsqueda
                String((prop as any).number || '').toLowerCase().includes(searchTerm));
    });
  }

  public createForm(): FormGroup {
    return this._formBuilder.group({
      user_id: ['', [Validators.required]],
      property_id: ['', [Validators.required]],
    });
  }

  // Se mantiene 'async' para el manejo de la alerta
  public async asignarPropiedadAlUsuario() {
    if (this.form.invalid) {
      this._alertService.presentAlert('Formulario Inválido: Por favor, seleccione un propietario y una propiedad.');
      return;
    }
    const userId = this.form.get('user_id')?.value;
    const propertyId = this.form.get('property_id')?.value;
    
    // Asumimos que relationWithProperty ya maneja su subscripción/promesa internamente.
    this._ownersService.relationWithProperty(userId, propertyId);
    
    // Opcional: Mostrar un toast de éxito temporal
    this.presentToast('Asignación enviada...', 'success');
    
    this.form.reset();
  }

  public getForm(): FormGroup {
    return this.form;
  }

  private async presentToast(message: string, color: string = 'primary'): Promise<void> {
    const toast = await this._toastCtrl.create({
      message: message,
      duration: 2500,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}