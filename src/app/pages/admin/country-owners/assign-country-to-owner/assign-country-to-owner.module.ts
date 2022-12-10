import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssignCountryToOwnerPageRoutingModule } from './assign-country-to-owner-routing.module';

import { AssignCountryToOwnerPage } from './assign-country-to-owner.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssignCountryToOwnerPageRoutingModule
  ],
  declarations: [AssignCountryToOwnerPage]
})
export class AssignCountryToOwnerPageModule {}
