import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckInService } from '../../../services/check-in/check-in.service';
import { RecurrentsService } from '../../../services/recurrents/recurrents.service';
import { OwnerStorageService } from '../../../services/storage/owner-interface-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-income',
  templateUrl: './new-income.page.html',
  styleUrls: ['./new-income.page.scss'],
})
export class NewIncomePage implements OnInit {

  protected incomeDate;
  protected incomeExit;
  private formBuilder: FormBuilder;
  private form: FormGroup;


  constructor(protected _formBuilder: FormBuilder, private _checkInService: CheckInService, private _recurrentsService: RecurrentsService, private _ownerStorage: OwnerStorageService, private _router: Router) { 
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
  }

  async ngOnInit() {
  }


  createForm(){
    return this.formBuilder.group({
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      DNI: ['', [Validators.required]],
      isRecurrent: [true, [Validators.required]],
      date: [''],
    })
  }
  
  public getForm(): FormGroup {
    return this.form;
  }

  async onSubmit(){

    console.log(
      this.getForm().get('isRecurrent').value
    )

    const owner = await this._ownerStorage.getOwner()
    const ownerID = owner.user.id;
    const id_country = owner.property.id_country

    if(this.getForm().get('isRecurrent').value == true){
      const propertyID = owner.property.id
      this._recurrentsService.addRecurrent(
        propertyID,
        this.getForm().get('name').value,
        this.getForm().get('lastname').value,
        this.getForm().get('DNI').value,
        "owner"
      )
      ;



    } else {
      
      this._checkInService.createCheckInFromOwner(
        this.getForm().get('name').value,
        this.getForm().get('lastname').value,
        this.getForm().get('DNI').value,
        this.getForm().get('date').value,
        ownerID,
        id_country
      )
    }

    this.form.reset()
  }

  getDateIncome(event){
    const { value } = event.detail;

    console.log(value);

    this.incomeDate = value;
  }

  getDateExit(event){
    const { value } = event.detail;

    console.log(value);
    this.incomeExit = value;
  }

}
