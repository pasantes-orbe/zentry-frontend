import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckinInterface } from './checkin.interface';
import { UserStorageService } from '../../../services/storage/user-storage.service';
import { OwnersService } from '../../../services/owners/owners.service';
import { OwnerResponse } from '../../../interfaces/ownerResponse-interface';
import { CheckInService } from '../../../services/check-in/check-in.service';
import { IonSearchbar, IonSelect, IonTextarea, SearchbarCustomEvent } from '@ionic/angular';
import { AlertService } from 'src/app/services/helpers/alert.service';

@Component({
  selector: 'app-checkin',
  templateUrl: './checkin.page.html',
  styleUrls: ['./checkin.page.scss'],
})
export class CheckinPage implements OnInit {

  // CORRECCIÓN 1: Se cambian las propiedades a 'public' para que sean accesibles desde la plantilla HTML.
  public form: FormGroup;
  public incomeData: CheckinInterface;
  public dateNow: String = new Date().toISOString();
  public userID: any;
  public owners: OwnerResponse[] = [];

  // CORRECCIÓN 2: Se declaran las propiedades que faltaban para el [(ngModel)] del HTML.
  public searchKey: string = '';
  public term: string = '';

  @ViewChild("textArea") public textArea: IonTextarea;
  @ViewChild("searchBar") public searchBar: IonSearchbar;
  @ViewChild("ionSelect") public ionSelect: IonSelect;

  constructor(
    private _formBuilder: FormBuilder,
    private _userStorageService: UserStorageService,
    private _ownersService: OwnersService,
    private _checkInService: CheckInService,
    private _alertService: AlertService // Se asume que tienes un servicio de alertas para feedback.
  ) {
    this.form = this.createForm();
    this.incomeData = {
      name: '',
      lastname: '',
      DNI: '',
      ownerID: '',
      date: '',
      transport: '',
      patent: '',
      observations: ''
    };
    this.incomeData.date = this.dateNow;
  }

  async ngOnInit() {
    const user = await this._userStorageService.getUser();
    if (user) {
      this.userID = user.id;
    }
  }

  // --- Métodos para actualizar el objeto incomeData desde el HTML ---
  select(e: any) {
    this.incomeData.transport = e.detail.value;
  }

  setObservations(e: any) {
    this.incomeData.observations = e.detail.value;
  }

  changePatent(e: any) {
    this.incomeData.patent = e.detail.value;
  }

  public setOwner(e: any) {
    this.incomeData.ownerID = e.detail.value;
  }

  // CORRECCIÓN 3: Se añade el tipo de evento correcto para evitar el error con 'event.detail'.
  async filtrarOwners(event: SearchbarCustomEvent) {
    const termino = event.detail.value;

    if (termino && termino.length > 3) {
      try {
        const ownersObservable = await this._ownersService.getAllByCountryID();
        ownersObservable.subscribe(owners => {
          this.owners = owners;
        });
      } catch (error) {
        console.error("Error al filtrar propietarios:", error);
      }
    } else {
      this.owners = []; // Limpia la lista si el término de búsqueda es corto.
    }
  }

  submitIncome() {
    if (this.form.invalid) {
      this._alertService.presentAlert("Formulario Incompleto", "Por favor, complete todos los campos requeridos.", "");
      return;
    }

    const checkinData = {
      name: this.form.get('name')?.value,
      lastname: this.form.get('lastname')?.value,
      DNI: this.form.get('DNI')?.value,
      ownerID: this.form.get('ownerID')?.value,
      guardID: this.userID,
      date: this.form.get('date')?.value,
      observations: this.incomeData.observations,
      transport: this.incomeData.transport,
      patent: this.incomeData.patent,
    };

    // CORRECCIÓN 4: Se añade el .subscribe() para manejar la respuesta del servicio y dar feedback.
    this._checkInService.createCheckin(
      checkinData.name, checkinData.lastname, checkinData.DNI,
      checkinData.ownerID, checkinData.guardID, checkinData.date,
      checkinData.observations, checkinData.transport, checkinData.patent
    ).subscribe({
      next: (response) => {
        console.log("Check-in creado:", response);
        this._alertService.presentAlert("Éxito", "El check-in se ha registrado correctamente.", );
        this.resetForm();
      },
      error: (err) => {
        console.error("Error al crear check-in:", err);
        this._alertService.presentAlert("Error", "No se pudo registrar el check-in.", "Intente nuevamente.");
      }
    });
  }

  // Se crea un método para centralizar la limpieza del formulario.
  resetForm() {
    this.form.reset();
    this.incomeData.observations = "";
    this.incomeData.patent = "";
    if (this.textArea) this.textArea.value = "";
    if (this.searchBar) this.searchBar.value = "";
    if (this.ionSelect) this.ionSelect.value = "";
  }

  private createForm(): FormGroup {
    return this._formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required, Validators.minLength(3)]],
      DNI: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(9), Validators.pattern("^[0-9]*$")]],
      ownerID: ['', [Validators.required]],
      date: ['', [Validators.required]],
    });
  }

  public getForm(): FormGroup {
    return this.form;
  }

  getDate(event: any) {
    const { value } = event.detail;
    this.incomeData.date = value;
  }
}
