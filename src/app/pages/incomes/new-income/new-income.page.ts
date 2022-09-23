import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-income',
  templateUrl: './new-income.page.html',
  styleUrls: ['./new-income.page.scss'],
})
export class NewIncomePage implements OnInit {

  protected incomeDate;
  protected incomeExit;

  constructor() { }

  ngOnInit() {
  }

  onSubmit(e){
    console.log({
      income: this.incomeDate,
      exit: this.incomeExit
    });
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
