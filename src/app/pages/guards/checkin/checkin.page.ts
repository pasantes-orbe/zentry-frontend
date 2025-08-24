import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

//Interfaces y Servicios
import { CheckinInterface } from './checkin.interface';
import { UserStorageService } from '../../../services/storage/user-storage.service';
import { OwnersService } from '../../../services/owners/owners.service';
import { OwnerResponse } from '../../../interfaces/ownerResponse-interface';
import { CheckInService } from '../../../services/check-in/check-in.service';
import { IonSearchbar, IonSelect, IonTextarea, SearchbarCustomEvent } from '@ionic/angular';
import { AlertService } from 'src/app/services/helpers/alert.service';

// Pipes
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
export class CheckinPage implements OnInit {

  // CORRECCIÓN: Se cambian las propiedades a 'public' para que el HTML pueda acceder a ellas.
  public form: FormGroup;
  public incomeData: CheckinInterface;
  public dateNow: String = new Date().toISOString();
  public userID: any;
  public owners: OwnerResponse[] = [];
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
    private _alertService: AlertService
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

  ionViewWillEnter() {
    this.ngOnInit();
  }

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

  public getIncomeData(): CheckinInterface {
    return this.incomeData;
  }

  async filtrarOwners(event: any) { // CORRECCIÓN: Se cambia el tipo a 'any' para aceptar el evento del HTML.
    const termino = event.detail.value;
    if (termino && termino.length > 3) {
      const ownersObservable = await this._ownersService.getAllByCountryID();
      ownersObservable.subscribe(owners => {
        this.owners = owners;
      });
    } else {
      this.owners = [];
    }
  }

  submitIncome() {
    if (this.form.invalid) {
      // CORRECCIÓN: Se une el mensaje en un solo argumento para la alerta.
      this._alertService.presentAlert("Formulario Incompleto: Por favor, complete todos los campos requeridos.");
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

    // CORRECCIÓN: Se reemplaza '.subscribe' por '.then()' y '.catch()' para manejar la Promise.
    this._checkInService.createCheckin(
      checkinData.name, checkinData.lastname, checkinData.DNI,
      checkinData.ownerID, checkinData.guardID, checkinData.date,
      checkinData.observations, checkinData.transport, checkinData.patent
    ).then(response => {
      console.log("Check-in creado:", response);
      // CORRECCIÓN: Se une el mensaje en un solo argumento para la alerta.
      this._alertService.presentAlert("Éxito: El check-in se ha registrado correctamente.");
      this.resetForm();
    }).catch(err => {
      console.error("Error al crear check-in:", err);
      // CORRECCIÓN: Se une el mensaje en un solo argumento para la alerta.
      this._alertService.presentAlert("Error: No se pudo registrar el check-in. Intente nuevamente.");
    });
  }

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

  getIncomeTime(event: any) {
    const { value } = event.detail;
    console.log(value);
  }
}
