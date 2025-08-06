import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AntipanicHistorialPageRoutingModule } from './antipanic-historial-routing.module';

import { AntipanicHistorialPage } from './antipanic-historial.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AntipanicHistorialPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [AntipanicHistorialPage]
})
export class AntipanicHistorialPageModule {}
