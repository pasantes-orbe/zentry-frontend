// VERSIÓN CON DEBUGGING CONTROLADO Y HELPERS ROBUSTOS
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, forkJoin, of, lastValueFrom, isObservable, Observable } from 'rxjs';

import { OwnersService } from 'src/app/services/owners/owners.service';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { AlertService } from 'src/app/services/helpers/alert.service';
import { CountryStorageService } from 'src/app/services/storage/country-storage.service';

import { Owner_CountryInterface } from 'src/app/interfaces/owner_country-interface';
import { Property_OwnerInterface } from 'src/app/interfaces/property_owner-interface';
import { NavbarBackComponent } from 'src/app/components/navbars/navbar-back/navbar-back.component';

@Component({
  selector: 'app-assign-country-to-owner',
  templateUrl: './assign-country-to-owner.page.html',
  styleUrls: ['./assign-country-to-owner.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule, NavbarBackComponent]
})
export class AssignCountryToOwnerPage implements OnInit {

  public form: FormGroup;

  public owners: Owner_CountryInterface[] = [];
  public properties: Property_OwnerInterface[] = [];

  public filteredOwners: Owner_CountryInterface[] = [];
  public filteredProperties: Property_OwnerInterface[] = [];

  public loading = true;

  constructor(
    private _alert: AlertService,
    private _router: Router,
    private _fb: FormBuilder,
    private _owners: OwnersService,
    private _properties: PropertiesService,
    private _toast: ToastController,
    private _countryStorage: CountryStorageService,
  ) {
    this.form = this._fb.group({
      user_id: [null, [Validators.required]],
      property_id: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadData();
  }

  public getForm(): FormGroup { return this.form; }

  // Helpers OWNER: soporta OwnerUser, user, User, etc.
  private getUser(o: any): any {
    return o?.OwnerUser ?? o?.user ?? o?.User ?? o?.owner ?? null;
  }
  public ownerId(o: any): number | null {
    const id = this.getUser(o)?.id ?? o?.id_user ?? o?.id;
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  public ownerAvatar(o: any): string {
    return this.getUser(o)?.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  }
  public ownerName(o: any): string {
    return this.getUser(o)?.name ?? '';
  }
  public ownerLastname(o: any): string {
    return this.getUser(o)?.lastname ?? '';
  }
  public ownerDni(o: any): string {
    return String(this.getUser(o)?.dni ?? 'S/N');
  }

  // Helpers PROPERTY: soporta property o plano
  private getProp(p: any): any {
    return p?.property ?? p;
  }
  public propertyId(p: any): number | null {
    const id = this.getProp(p)?.id ?? p?.id;
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  public propertyAvatar(p: any): string {
    return this.getProp(p)?.avatar || 'https://ionicframework.com/docs/img/demos/card-media.png';
  }
  public propertyName(p: any): string {
    return this.getProp(p)?.name ?? 'Sin nombre';
  }
  public propertyNumber(p: any): string {
    return String(this.getProp(p)?.number ?? 'S/N');
  }

  // trackBy
  public trackOwner = (_: number, o: any) => this.ownerId(o) as number;
  public trackProperty = (_: number, p: any) => this.propertyId(p) as number;

  // Carga concurrente con fallback en propiedades
  public async loadData(): Promise<void> {
    this.loading = true;

    const owners$ = this._owners.getAllByCountry().pipe(
      catchError(err => { console.error('Error propietarios:', err); return of<Owner_CountryInterface[]>([]); })
    );

    // Importante: usar método con fallback a distintas rutas
    const properties$ = (await this._properties.getByCountry()).pipe(
      catchError(err => { console.error('Error propiedades:', err); return of<Property_OwnerInterface[]>([]); })
    );

    forkJoin([owners$, properties$]).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: ([ownersData, propertiesData]) => {
        this.owners = ownersData || [];
        this.properties = propertiesData || [];
        this.filteredOwners = this.owners.filter(o => this.ownerId(o) !== null);
        this.filteredProperties = this.properties.filter(p => this.propertyId(p) !== null);
      },
      error: (err) => console.error('Fallo inesperado:', err)
    });
  }

  public onSearchOwners(ev: any): void {
    const term = (ev?.target?.value || '').toLowerCase();
    const src = [...this.owners];
    if (!term) { this.filteredOwners = src.filter(o => this.ownerId(o) !== null); return; }
    this.filteredOwners = src
      .filter(o =>
        this.ownerName(o).toLowerCase().includes(term) ||
        this.ownerLastname(o).toLowerCase().includes(term) ||
        this.ownerDni(o).toLowerCase().includes(term)
      )
      .filter(o => this.ownerId(o) !== null);
  }

  public onSearchProperties(ev: any): void {
    const term = (ev?.target?.value || '').toLowerCase();
    const src = [...this.properties];
    if (!term) { this.filteredProperties = src.filter(p => this.propertyId(p) !== null); return; }
    this.filteredProperties = src
      .filter(p =>
        this.propertyName(p).toLowerCase().includes(term) ||
        this.propertyNumber(p).toLowerCase().includes(term)
      )
      .filter(p => this.propertyId(p) !== null);
  }

  public async asignarPropiedadAlUsuario() {
    if (this.form.invalid) {
      this._alert.presentAlert('Formulario inválido. Seleccioná propietario y propiedad.');
      return;
    }

    const userId = Number(this.form.get('user_id')!.value);
    const propertyId = Number(this.form.get('property_id')!.value);

    if (!Number.isFinite(userId) || !Number.isFinite(propertyId) || userId <= 0 || propertyId <= 0) {
      this._alert.presentAlert('Error: IDs inválidos. Recargá y reintentá.');
      return;
    }

    try {
      // El OwnersService ya maneja loader/navegación (si lo dejaste así). No duplicamos loader acá.
      const rel = this._owners.relationWithProperty(userId, propertyId) as any;
      if (isObservable(rel)) { await lastValueFrom(rel); } else { await rel; }

      this.form.reset();
      // Si tu OwnersService no redirige, descomentá esto:
      // const country = await this._countryStorage.getCountry();
      // country?.id ? this._router.navigate(['/admin/country-dashboard', country.id]) : this._router.navigate(['/admin/home']);
    } catch (err: any) {
      console.error('Error al asignar propiedad:', err);
      const msg = err?.error?.msg || err?.message || 'No se pudo asignar la propiedad.';
      this._alert.presentAlert('Error: ' + msg);
    }
  }

  private async presentToast(message: string, color: string = 'primary'): Promise<void> {
    const toast = await this._toast.create({ message, duration: 2500, color, position: 'bottom' });
    await toast.present();
  }
}
