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
import { environment } from 'src/environments/environment';

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
      // user_id ya no es requerido; se usa selección múltiple por checkboxes
      user_id: [null],
      property_id: [null, [Validators.required]],
    });
  }

  // IDs de usuarios asignados en cualquier propiedad (para mostrar solo "disponibles")
  private assignedOwnerIdsGlobally(): Set<number> {
    const ids: number[] = [];
    for (const p of (this.properties || [])) {
      const owners = Array.isArray((p as any)?.owners) ? (p as any).owners : [];
      owners.forEach((o: any) => {
        const uid = Number(o?.user?.id ?? o?.OwnerUser?.id ?? o?.id_user ?? o?.id);
        if (Number.isFinite(uid) && uid > 0) ids.push(uid);
      });
    }
    return new Set<number>(ids);
  }

  // IDs de usuarios ya asignados a la propiedad seleccionada
  private assignedOwnerIdsForSelectedProperty(): Set<number> {
    const pid = Number(this.form.get('property_id')?.value);
    if (!Number.isFinite(pid) || pid <= 0) return new Set<number>();
    const match = (this.properties || []).find(p => this.propertyId(p) === pid) as any;
    const owners = Array.isArray(match?.owners) ? match.owners : [];
    const ids = owners
      .map((o: any) => (o?.user?.id ?? o?.OwnerUser?.id ?? o?.id_user ?? o?.id))
      .map((v: any) => Number(v))
      .filter((n: number) => Number.isFinite(n) && n > 0);
    return new Set<number>(ids);
  }

  // Aplica el filtro de disponibilidad en base a la propiedad seleccionada
  private recomputeFilteredOwners(): void {
    const assigned = this.assignedOwnerIdsForSelectedProperty();
    if (assigned.size === 0) return; // sin propiedad seleccionada, no filtra
    this.filteredOwners = this.filteredOwners.filter(o => !assigned.has(this.ownerId(o)!));
    // Además, limpiar selección múltiple si marcaste alguien ya asignado
    this.selectedOwnerIds = this.selectedOwnerIds.filter(id => !assigned.has(id));
  }

  ngOnInit() {
    this.loadData();
    // Refiltrar propietarios cuando cambia la propiedad seleccionada
    this.form.get('property_id')?.valueChanges.subscribe(() => {
      this.recomputeFilteredOwners();
    });
  }

  ionViewWillEnter() {
    this.loadData();
  }

  public getForm(): FormGroup { return this.form; }

  // Selección múltiple de owners
  private selectedOwnerIds: number[] = [];
  public isOwnerSelected(id: number | null): boolean {
    if (!id) return false;
    return this.selectedOwnerIds.includes(id);
  }
  public toggleOwnerSelection(o: any): void {
    const id = this.ownerId(o);
    if (!id) return;
    const idx = this.selectedOwnerIds.indexOf(id);
    if (idx >= 0) {
      this.selectedOwnerIds.splice(idx, 1);
    } else {
      this.selectedOwnerIds.push(id);
    }
  }
  public hasSelectedOwners(): boolean { return this.selectedOwnerIds.length > 0; }

  // Helpers OWNER: soporta OwnerUser, user, User, etc.
  private getUser(o: any): any {
    return o?.OwnerUser ?? o?.user ?? o?.User ?? o?.owner ?? null;
  }
  private isValidUser(o: any): boolean {
    const u = this.getUser(o);
    return !!u && Number.isFinite(Number(u?.id)) && Number(u?.id) > 0;
  }
  private isOwnerActive(o: any): boolean {
    const u = this.getUser(o);
    return typeof u?.isActive === 'boolean' ? u.isActive : true;
  }
  public ownerId(o: any): number | null {
    const id = this.getUser(o)?.id ?? o?.id_user ?? o?.id;
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  public ownerAvatar(o: any): string {
    const a = this.getUser(o)?.avatar;
    const url = this.normalizeAvatarUrl(a);
    return url || 'https://ionicframework.com/docs/img/demos/avatar.svg';
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

  private normalizeAvatarUrl(a: any): string {
    if (!a || typeof a !== 'string' || a.length === 0) return '';
    if (/^https?:\/\//i.test(a)) return a;
    if (a.startsWith('/')) return `${environment.URL}${a}`;
    return `${environment.URL}/${a}`;
  }

  // Helpers PROPERTY: soporta property o plano
  private getProp(p: any): any {
    return p?.property ?? p;
  }
  private isValidProp(p: any): boolean {
    const prop = this.getProp(p);
    return !!prop && Number.isFinite(Number(prop?.id)) && Number(prop?.id) > 0;
  }
  private isPropertyActive(p: any): boolean {
    const prop = this.getProp(p);
    return typeof prop?.isActive === 'boolean' ? prop.isActive : true;
  }
  public propertyId(p: any): number | null {
    const id = this.getProp(p)?.id ?? p?.id;
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  public propertyAvatar(p: any): string {
    const a = this.getProp(p)?.avatar;
    const url = this.normalizeAvatarUrl(a);
    return url || 'https://ionicframework.com/docs/img/demos/card-media.png';
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

    const owners$ = this._owners.getActiveByCountry().pipe(
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
        const uniqOwnersMap = new Map<number, any>();
        (this.owners || []).forEach(o => { const id = this.ownerId(o); if (id) uniqOwnersMap.set(id, o); });
        this.filteredOwners = Array.from(uniqOwnersMap.values())
          .filter(o => this.ownerId(o) !== null)
          .filter(o => this.isValidUser(o))
          .filter(o => this.isOwnerActive(o));
        // Mostrar solo propietarios "disponibles" (no asignados a ninguna propiedad)
        const assignedGlobal = this.assignedOwnerIdsGlobally();
        this.filteredOwners = this.filteredOwners.filter(o => !assignedGlobal.has(this.ownerId(o)!));
        // Aplicar filtro de disponibilidad respecto a la propiedad elegida (si hay)
        this.recomputeFilteredOwners();
        const uniqPropsMap = new Map<number, any>();
        (this.properties || []).forEach(p => { const id = this.propertyId(p); if (id) uniqPropsMap.set(id, p); });
        this.filteredProperties = Array.from(uniqPropsMap.values())
          .filter(p => this.propertyId(p) !== null)
          .filter(p => this.isValidProp(p))
          .filter(p => this.isPropertyActive(p));
        // Mostrar solo propiedades "disponibles" (sin owners asignados)
        this.filteredProperties = this.filteredProperties.filter(p => Array.isArray((p as any)?.owners) ? (p as any).owners.length === 0 : true);
      },
      error: (err) => console.error('Fallo inesperado:', err)
    });
  }

  public onSearchOwners(ev: any): void {
    const term = (ev?.target?.value || '').toLowerCase();
    const src = [...this.owners];
    if (!term) { this.filteredOwners = src.filter(o => this.ownerId(o) !== null).filter(o => this.isValidUser(o)).filter(o => this.isOwnerActive(o)); return; }
    this.filteredOwners = src
      .filter(o =>
        this.ownerName(o).toLowerCase().includes(term) ||
        this.ownerLastname(o).toLowerCase().includes(term) ||
        this.ownerDni(o).toLowerCase().includes(term)
      )
      .filter(o => this.ownerId(o) !== null)
      .filter(o => this.isValidUser(o))
      .filter(o => this.isOwnerActive(o));
    // Refiltrar por disponibilidad global y con la propiedad seleccionada
    const assignedGlobal = this.assignedOwnerIdsGlobally();
    this.filteredOwners = this.filteredOwners.filter(o => !assignedGlobal.has(this.ownerId(o)!));
    this.recomputeFilteredOwners();
  }

  public onSearchProperties(ev: any): void {
    const term = (ev?.target?.value || '').toLowerCase();
    const src = [...this.properties];
    if (!term) { this.filteredProperties = src.filter(p => this.propertyId(p) !== null).filter(p => this.isValidProp(p)).filter(p => this.isPropertyActive(p)); return; }
    this.filteredProperties = src
      .filter(p =>
        this.propertyName(p).toLowerCase().includes(term) ||
        this.propertyNumber(p).toLowerCase().includes(term)
      )
      .filter(p => this.propertyId(p) !== null)
      .filter(p => this.isValidProp(p))
      .filter(p => this.isPropertyActive(p))
      .filter(p => Array.isArray((p as any)?.owners) ? (p as any).owners.length === 0 : true);
  }

  public async asignarPropiedadAlUsuario() {
    const propertyId = Number(this.form.get('property_id')!.value);
    if (!Number.isFinite(propertyId) || propertyId <= 0) {
      this._alert.presentAlert('Seleccioná una propiedad válida.');
      return;
    }
    if (!this.hasSelectedOwners()) {
      this._alert.presentAlert('Seleccioná al menos un propietario.');
      return;
    }

    // Ejecutar asignaciones en serie para feedback consistente
    try {
      for (const uid of this.selectedOwnerIds) {
        await this._owners.relationWithPropertySilent(uid, propertyId);
      }
      // Limpiar selección y remover propietarios ya asignados de la lista visible
      const assignedSet = new Set(this.selectedOwnerIds);
      this.selectedOwnerIds = [];
      this.filteredOwners = this.filteredOwners.filter(o => !assignedSet.has(this.ownerId(o)!));
      this.owners = this.owners.filter(o => !assignedSet.has(this.ownerId(o)!));
      // Marcar localmente la propiedad seleccionada como con owners asignados para que no aparezca más
      const pid = Number(this.form.get('property_id')!.value);
      const idx = this.filteredProperties.findIndex(p => this.propertyId(p) === pid);
      if (idx >= 0) {
        const propAny: any = this.filteredProperties[idx];
        if (!Array.isArray(propAny.owners)) propAny.owners = [];
        // insertar placeholders mínimos para reflejar asignación
        assignedSet.forEach(uid => { propAny.owners.push({ user: { id: uid } }); });
        // Volver a filtrar propiedades disponibles
        this.filteredProperties = this.filteredProperties.filter(p => Array.isArray((p as any)?.owners) ? (p as any).owners.length === 0 : true);
      }
      this.form.get('property_id')!.reset();
      await this.presentToast('Asignación completada', 'success');

      // Redirección opcional al dashboard del country actual
      const country = await this._countryStorage.getCountry();
      const countryId = country?.id;
      if (countryId) {
        this._router.navigate(['/admin/country-dashboard', countryId]);
      }
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
