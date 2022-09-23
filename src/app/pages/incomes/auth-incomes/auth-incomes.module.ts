import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthIncomesPageRoutingModule } from './auth-incomes-routing.module';

import { AuthIncomesPage } from './auth-incomes.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthIncomesPageRoutingModule,
    ComponentsModule
  ],
  declarations: [AuthIncomesPage]
})
export class AuthIncomesPageModule {}
