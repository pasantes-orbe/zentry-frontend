import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventsHistorialPageRoutingModule } from './events-historial-routing.module';

import { EventsHistorialPage } from './events-historial.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventsHistorialPageRoutingModule,
    ComponentsModule,
    Ng2SearchPipeModule
  ],
  declarations: [EventsHistorialPage]
})
export class EventsHistorialPageModule {}
