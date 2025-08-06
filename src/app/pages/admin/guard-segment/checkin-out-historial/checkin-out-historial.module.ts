import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckinOutHistorialPageRoutingModule } from './checkin-out-historial-routing.module';

import { CheckinOutHistorialPage } from './checkin-out-historial.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckinOutHistorialPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [CheckinOutHistorialPage]
})
export class CheckinOutHistorialPageModule {}
