import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";
import { IncomesComponent } from "src/app/components/incomes/incomes.component";

@Component({
  selector: 'app-incomes-page',
  templateUrl: './incomes.page.html',
  styleUrls: ['./incomes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NavbarBackComponent,
    IncomesComponent
  ],
})
export class IncomesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
