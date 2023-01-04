import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewIncomePageRoutingModule } from './new-income-routing.module';

import { NewIncomePage } from './new-income.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewIncomePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [NewIncomePage]
})
export class NewIncomePageModule {}
