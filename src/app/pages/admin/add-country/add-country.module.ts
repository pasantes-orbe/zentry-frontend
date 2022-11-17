import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddCountryPageRoutingModule } from './add-country-routing.module';

import { AddCountryPage } from './add-country.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddCountryPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule
  ],
  declarations: [AddCountryPage]
})
export class AddCountryPageModule {}
