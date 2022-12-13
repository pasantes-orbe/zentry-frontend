import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssignCountryToOwnerPageRoutingModule } from './assign-country-to-owner-routing.module';

import { AssignCountryToOwnerPage } from './assign-country-to-owner.page';
import { ComponentsModule } from '../../../../components/components.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssignCountryToOwnerPageRoutingModule,
    ReactiveFormsModule,
    ComponentsModule,
    Ng2SearchPipeModule,
  ],
  declarations: [AssignCountryToOwnerPage]
})
export class AssignCountryToOwnerPageModule {}
