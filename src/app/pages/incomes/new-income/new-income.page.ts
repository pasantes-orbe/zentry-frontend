// --- Archivo: src/app/pages/incomes/new-income/new-income.page.ts (Corregido) ---

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckInService } from '../../../services/check-in/check-in.service';
import { RecurrentsService } from '../../../services/recurrents/recurrents.service';
import { OwnerStorageService } from '../../../services/storage/owner-interface-storage.service';
import { Router } from '@angular/router';
import moment from 'moment';
import { AlertService } from 'src/app/services/helpers/alert.service';

@Component({
  selector: 'app-new-income',
  templateUrl: './new-income.page.html',
  styleUrls: ['./new-income.page.scss'],
})
export class NewIncomePage implements OnInit {

  public form: FormGroup;
  public incomeDate: any;
  public incomeExit: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _checkInService: CheckInService,
    private _recurrentsService: RecurrentsService,
    private _ownerStorage: OwnerStorageService,
    private _router: Router,
    private _alertService: AlertService
  ) {
    this.form = this.createForm();
  }

  ngOnInit() {
    const now = new Date();
    const nowFormatted = moment(now).format("YYYY-MM-DDTHH:mm:ss");
    this.form.controls['date'].setValue(nowFormatted);
  }

  createForm(): FormGroup {
    return this._formBuilder.group({
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      DNI: ['', [Validators.required]],
      isRecurrent: [true, [Validators.required]],
      date: ['',],
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this._alertService.presentAlert('Formulario Inválido Por favor, complete todos los campos requeridos.');
      return;
    }

    try {
      const owner = await this._ownerStorage.getOwner();
      const ownerID = owner.user.id;
      const id_country = owner.property.id_country;
      const formValues = this.form.value;

      if (formValues.isRecurrent) {
        const propertyID = owner.property.id;
        await this._recurrentsService.addRecurrent(
          propertyID,
          formValues.name,
          formValues.lastname,
          formValues.DNI,
          "owner"
        );
        this._alertService.presentAlert('Éxito El invitado recurrente ha sido guardado.');

      } else {
        await this._checkInService.createCheckInFromOwner(
          formValues.name,
          formValues.lastname,
          formValues.DNI,
          formValues.date,
          ownerID,
          id_country
        );
        this._alertService.presentAlert('Éxito La autorización de ingreso ha sido creada.');
      }

      this.form.reset();
      this._router.navigate(['/tabs/tab1']);

    } catch (error) {
      console.error("Error al procesar el formulario:", error);
      this._alertService.presentAlert('Error No se pudo completar la operación. Intente nuevamente.');
    }
  }

  getDateIncome(event: any) {
    const { value } = event.detail;
    this.incomeDate = value;
  }
}