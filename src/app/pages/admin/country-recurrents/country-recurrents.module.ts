import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CountryRecurrentsPageRoutingModule } from './country-recurrents-routing.module';

import { CountryRecurrentsPage } from './country-recurrents.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CountryRecurrentsPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [CountryRecurrentsPage]
})
export class CountryRecurrentsPageModule {}
