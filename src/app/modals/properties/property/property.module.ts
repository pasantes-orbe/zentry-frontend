import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyPageRoutingModule } from './property-routing.module';

import { PropertyPage } from './property.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PropertyPageRoutingModule,
    ComponentsModule
  ],
  declarations: [PropertyPage]
})
export class PropertyPageModule {}
