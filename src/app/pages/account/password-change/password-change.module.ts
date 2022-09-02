import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordChangePageRoutingModule } from './password-change-routing.module';

import { PasswordChangePage } from './password-change.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasswordChangePageRoutingModule,
    ComponentsModule
  ],
  declarations: [PasswordChangePage]
})
export class PasswordChangePageModule {}
