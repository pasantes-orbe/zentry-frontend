import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IncomesPageRoutingModule } from './incomes-routing.module';

import { IncomesPage } from './incomes.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IncomesPageRoutingModule,
    ComponentsModule
  ],
  declarations: [IncomesPage]
})
export class IncomesPageModule {}
