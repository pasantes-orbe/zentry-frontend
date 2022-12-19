import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import '@angular/common/locales/global/es';
import { IonicModule } from '@ionic/angular';
import { LOCALE_ID} from '@angular/core';
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
  declarations: [AddLaboralSchedulePage],
  providers: [ { provide: LOCALE_ID, useValue: 'es-ES' } ],
})
export class AddLaboralSchedulePageModule {}
