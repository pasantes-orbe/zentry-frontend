import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckinOutHistorialPageRoutingModule } from './checkin-out-historial-routing.module';

import { CheckinOutHistorialPage } from './checkin-out-historial.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckinOutHistorialPageRoutingModule,
    ComponentsModule,
    Ng2SearchPipeModule
  ],
  declarations: [CheckinOutHistorialPage]
})
export class CheckinOutHistorialPageModule {}
