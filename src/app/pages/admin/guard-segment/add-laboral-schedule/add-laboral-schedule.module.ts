import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddLaboralSchedulePageRoutingModule } from './add-laboral-schedule-routing.module';

import { AddLaboralSchedulePage } from './add-laboral-schedule.page';
import { ComponentsModule } from '../../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddLaboralSchedulePageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule
  ],
  declarations: [AddLaboralSchedulePage]
})
export class AddLaboralSchedulePageModule {}
