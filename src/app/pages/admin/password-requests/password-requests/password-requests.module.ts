import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordRequestsPageRoutingModule } from './password-requests-routing.module';

import { PasswordRequestsPage } from './password-requests.page';
import { ComponentsModule } from '../../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasswordRequestsPageRoutingModule,
    ComponentsModule
  ],
  declarations: [PasswordRequestsPage]
})
export class PasswordRequestsPageModule {}
