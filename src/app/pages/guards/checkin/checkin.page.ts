// src/app/pages/guards/checkin/checkin.page.ts

import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  IonSearchbar,
  IonSelect,
  IonTextarea,
  SearchbarCustomEvent
} from '@ionic/angular';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

// Interfaces y servicios
import { CheckinInterface } from './checkin.interface';
import { UserStorageService } from '../../../services/storage/user-storage.service';
import { OwnersService } from '../../../services/owners/owners.service';
import { OwnerResponse } from '../../../interfaces/ownerResponse-interface';
import { CheckInService } from '../../../services/check-in/check-in.service';
import { AlertService } from 'src/app/services/helpers/alert.service';

// Pipe
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

@Component({
  selector: 'app-checkin',
  templateUrl: './checkin.page.html',
  styleUrls: ['./checkin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    FilterByPipe
  ]
})
export class CheckinPage {

  public form: FormGroup;
  public incomeData: CheckinInterface;
  public dateNow: string = new Date().toISOString();
  public userID!: string | number;

  public owners: OwnerResponse[] = [];
  public searchKey = '';
  public term = '';
  private ownersLoaded = false;
  private ownersLoading = false;
  public withoutOwner = false; // Toggle para ingreso sin propietario

  @ViewChild('textArea') public textArea!: IonTextarea;
  @ViewChild('searchBar') public searchBar!: IonSearchbar;
  @ViewChild('ionSelect') public ionSelect!: IonSelect;
  trackOwner = (_: number, o: any) => (o?.OwnerUser?.id ?? o?.id);
  constructor(
    private fb: FormBuilder,
    private userStorage: UserStorageService,
    private ownersService: OwnersService,
    private checkInService: CheckInService,
    private alert: AlertService
  ) {
    this.form = this.createForm();
    this.incomeData = {
      name: '',
      lastname: '',
      DNI: '',
      ownerID: '',
      date: this.dateNow,
      transport: '',
      patent: '',
      observations: ''
    };

    // Sync form -> incomeData
    this.form.valueChanges.subscribe(v => {
      this.incomeData = { ...this.incomeData, ...v };
    });
  }

  async ionViewWillEnter() {
    // No llamo a APIs acá (estás offline)
    const user = await this.userStorage.getUser();
    if (user) this.userID = user.id;

    if (!this.form.get('date')?.value) {
      this.form.get('date')?.setValue(this.dateNow);
    }
  }

  // Carga perezosa de owners: solo primera vez que el usuario busca algo (>=3 chars)
  private async loadOwnersOnce() {
    if (this.ownersLoaded || this.ownersLoading) return;
    this.ownersLoading = true;
    try {
      const owners$ = await this.ownersService.getAllByCountryID(); // Promise<Observable<OwnerResponse[]>>
      owners$.subscribe({
        next: data => {
          console.log('💡 Owners recibidos en el front:', data); // <-- ESTA LÍNEA IMPLEMENTALA
          this.owners = data || [];
          this.ownersLoaded = true;
          this.ownersLoading = false;
        },
        error: () => {
          this.ownersLoading = false;
          this.alert.presentAlert('No se pudieron cargar los propietarios.');
        }
      });
    } catch {
      this.ownersLoading = false;
      // silencio: en estático puede no existir el back
    }
  }

  // === Métodos existentes (mismas firmas) ===
  select(e: any) {
    const value = e?.detail?.value ?? '';
    this.form.get('transport')?.setValue(value);
    this.togglePatentValidator(value);
  }

  setObservations(e: any) {
    const value = e?.detail?.value ?? '';
    this.form.get('observations')?.setValue(value);
  }

  changePatent(e: any) {
    const value = (e?.detail?.value ?? '').toUpperCase().replace(/\s+/g, '');
    this.form.get('patent')?.setValue(value);
  }

  public setOwner(e: any) {
    const value = e?.detail?.value ?? '';
    this.form.get('ownerID')?.setValue(value);
  }

  public getIncomeData(): CheckinInterface {
    return this.incomeData;
  }

  async filtrarOwners(event: string | SearchbarCustomEvent) {
    const termino = typeof event === 'string' ? event : (event as any)?.detail?.value;
    this.searchKey = (termino || '').trim();
    if (!this.ownersLoaded && this.searchKey.length >= 3) {
      this.loadOwnersOnce();
    }
  }

  // Método para activar/desactivar validación de propietario
  toggleOwnerRequired() {
    const ownerControl = this.form.get('ownerID');
    if (this.withoutOwner) {
      // Si está activado "sin propietario", quitar validación requerida
      ownerControl?.clearValidators();
      ownerControl?.setValue(''); // Limpiar valor
      this.searchKey = ''; // Limpiar búsqueda
    } else {
      // Si está desactivado, volver a poner validación requerida
      ownerControl?.setValidators([Validators.required]);
    }
    ownerControl?.updateValueAndValidity();
  }

  submitIncome() {
    // Revalidar patente condicional antes de enviar
    const transport = this.form.get('transport')?.value;
    this.togglePatentValidator(transport);
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.alert.presentAlert('Formulario incompleto o inválido. Revisá los campos marcados.');
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    
    // Construir payload base
    const payload: any = {
      name: v.name,
      lastname: v.lastname,
      DNI: v.DNI,
      guardID: this.userID,
      date: v.date,
      observations: v.observations || '',
      transport: v.transport || '',
      patent: v.patent || ''
    };
    
    // Determinar el valor de ownerID según el toggle
    let ownerIdToSend: any;
    if (this.withoutOwner) {
      // Si está activado "sin propietario", enviar undefined para que el backend lo maneje como null
      ownerIdToSend = undefined;
    } else {
      // Si hay propietario seleccionado, enviarlo
      ownerIdToSend = v.ownerID;
    }

    // En estático podés mockear el servicio; si no, esto fallará
    this.checkInService.createCheckin(
      payload.name, payload.lastname, payload.DNI,
      ownerIdToSend, payload.guardID, payload.date,
      payload.observations, payload.transport, payload.patent
    ).then(() => {
      this.alert.presentAlert('Éxito: el check-in se registró correctamente.');
      this.resetForm();
    }).catch(err => {
      console.error('Error check-in:', err);
      this.alert.presentAlert('Error: no se pudo registrar el check-in. Probá de nuevo.');
    });
  }

  resetForm() {
    // Resetear el toggle
    this.withoutOwner = false;
    
    this.form.reset({
      name: '',
      lastname: '',
      DNI: '',
      ownerID: '',
      date: this.dateNow,
      transport: '',
      patent: '',
      observations: ''
    });
    
    // Restaurar validación de ownerID
    const ownerControl = this.form.get('ownerID');
    ownerControl?.setValidators([Validators.required]);
    ownerControl?.updateValueAndValidity();
    if (this.textArea) this.textArea.value = '';
    if (this.searchBar) this.searchBar.value = '';
    if (this.ionSelect) this.ionSelect.value = '';
    this.searchKey = '';
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required, Validators.minLength(3)]],
      DNI: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      ownerID: ['', [Validators.required]],
      date: ['', [Validators.required]],
      transport: [''],
      patent: ['', [this.patentValidatorOptional.bind(this)]],
      observations: ['']
    });
  }

  private patentValidatorOptional(control: AbstractControl): ValidationErrors | null {
    const transport = this.form?.get('transport')?.value;
    const val: string = (control.value || '').toString().toUpperCase();
    const requiere = transport && !['Bicicleta', 'A pie'].includes(transport);

    if (!requiere && !val) return null;     // no requerida
    if (requiere && !val) return { required: true };

    // AR: AAA999 o AA999AA
    const ok = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/i.test(val);
    return ok ? null : { pattern: true };
  }

  private togglePatentValidator(_: string) {
    const ctrl = this.form.get('patent');
    if (!ctrl) return;
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  public getForm(): FormGroup {
    return this.form;
  }

  getDate(e: any) {
    const value = e?.detail?.value ?? '';
    this.form.get('date')?.setValue(value);
  }

  getIncomeTime(e: any) {
    const { value } = e?.detail ?? {};
    console.log(value);
  }
}
