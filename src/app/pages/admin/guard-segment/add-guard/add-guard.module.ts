import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddGuardPageRoutingModule } from './add-guard-routing.module';

import { AddGuardPage } from './add-guard.page';
import { ComponentsModule } from '../../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddGuardPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule
  ],
  declarations: [AddGuardPage]
})
export class AddGuardPageModule {}
