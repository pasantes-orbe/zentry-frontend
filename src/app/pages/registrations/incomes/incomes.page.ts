import { Component, OnInit } from '@angular/core';
import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";

@Component({
  selector: 'app-incomes-page',
  templateUrl: './incomes.page.html',
  styleUrls: ['./incomes.page.scss'],
  imports: [NavbarBackComponent],
})
export class IncomesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
