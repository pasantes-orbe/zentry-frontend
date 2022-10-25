import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckinInterface } from './checkin.interface';

@Component({
  selector: 'app-checkin',
  templateUrl: './checkin.page.html',
  styleUrls: ['./checkin.page.scss'],
})
export class CheckinPage implements OnInit {

  private formBuilder: FormBuilder;
  private form: FormGroup;

  protected incomeData: CheckinInterface;

  protected dateNow: String = new Date().toISOString();


  constructor(
    protected _formBuilder: FormBuilder
    ) {
      this.formBuilder = _formBuilder;
      this.form = this.createForm();
      this.incomeData = {    
        fullname: '',
        DNI: '',
        owner: '',
        date: '',
        transport: '',
        patent: '',
        observations: ''          
    }

    this.getIncomeData().date = this.dateNow;
  }

  ngOnInit() {
  }

  select(e){
    this.getIncomeData().transport = e.detail.value;
  }

  setObservations(e){
    this.getIncomeData().observations = e.detail.value;
  }

  public getIncomeData(): CheckinInterface{
    return this.incomeData;
  }

  submitIncome(){
    console.log(this.getIncomeData());
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      fullname: ['', [Validators.required, Validators.minLength(3)]],
      DNI: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(9), Validators.pattern("^[0-9]*$")]],
      owner: ['', [Validators.required]],
      date: ['', [Validators.required]],
      patent: ''
    });
  }

  public getForm(): FormGroup {
    return this.form;
  }

  getDate(event){
    
    const { value } = event.detail;

    console.log(value);

    this.getIncomeData().date = value;
    
  }

  getIncomeTime(event){
    const { value } = event.detail;

    console.log(value);
  }

}
