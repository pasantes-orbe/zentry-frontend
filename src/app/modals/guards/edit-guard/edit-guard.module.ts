import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditGuardPageRoutingModule } from './edit-guard-routing.module';

import { EditGuardPage } from './edit-guard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditGuardPageRoutingModule
  ],
  declarations: [EditGuardPage]
})
export class EditGuardPageModule {}
