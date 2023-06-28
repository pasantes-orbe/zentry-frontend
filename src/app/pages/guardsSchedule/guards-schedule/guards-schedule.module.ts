import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GuardsSchedulePageRoutingModule } from './guards-schedule-routing.module';

import { GuardsSchedulePage } from './guards-schedule.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    GuardsSchedulePageRoutingModule
  ],
  declarations: [GuardsSchedulePage]
})
export class GuardsSchedulePageModule {}
