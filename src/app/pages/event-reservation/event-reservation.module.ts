import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventReservationPageRoutingModule } from './event-reservation-routing.module';

import { EventReservationPage } from './event-reservation.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventReservationPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule
  ],
  declarations: [EventReservationPage]
})
export class EventReservationPageModule {}
