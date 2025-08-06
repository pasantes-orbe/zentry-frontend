import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AllGuardsPageRoutingModule } from './all-guards-routing.module';

import { AllGuardsPage } from './all-guards.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AllGuardsPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [AllGuardsPage]
})
export class AllGuardsPageModule {}
