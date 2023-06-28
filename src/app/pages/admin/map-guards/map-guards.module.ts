import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapGuardsPageRoutingModule } from './map-guards-routing.module';

import { MapGuardsPage } from './map-guards.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    MapGuardsPageRoutingModule
  ],
  declarations: [MapGuardsPage]
})
export class MapGuardsPageModule {}
