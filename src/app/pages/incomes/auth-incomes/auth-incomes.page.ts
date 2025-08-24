import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { NavbarBackComponent } from "src/app/components/navbars/navbar-back/navbar-back.component";
import { IncomesComponent } from "src/app/components/incomes/incomes.component";

@Component({
  selector: 'app-auth-incomes',
  templateUrl: './auth-incomes.page.html',
  styleUrls: ['./auth-incomes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    NavbarBackComponent,
    IncomesComponent
  ]
})
export class AuthIncomesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
