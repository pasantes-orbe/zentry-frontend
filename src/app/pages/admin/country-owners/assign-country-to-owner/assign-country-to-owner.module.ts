import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssignCountryToOwnerPageRoutingModule } from './assign-country-to-owner-routing.module';

import { AssignCountryToOwnerPage } from './assign-country-to-owner.page';
import { ComponentsModule } from '../../../../components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssignCountryToOwnerPageRoutingModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [AssignCountryToOwnerPage]
})
export class AssignCountryToOwnerPageModule {}
