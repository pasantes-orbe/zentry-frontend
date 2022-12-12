import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddRecurrentPageRoutingModule } from './add-recurrent-routing.module';

import { AddRecurrentPage } from './add-recurrent.page';
import { ComponentsModule } from '../../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddRecurrentPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule
  ],
  declarations: [AddRecurrentPage]
})
export class AddRecurrentPageModule {}
