import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventsHistorialPageRoutingModule } from './events-historial-routing.module';

import { EventsHistorialPage } from './events-historial.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventsHistorialPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [EventsHistorialPage]
})
export class EventsHistorialPageModule {}
