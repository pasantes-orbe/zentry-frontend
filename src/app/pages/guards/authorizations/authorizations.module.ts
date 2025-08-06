import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthorizationsPageRoutingModule } from './authorizations-routing.module';

import { AuthorizationsPage } from './authorizations.page';
import { ComponentsModule } from '../../../components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthorizationsPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [AuthorizationsPage]
})
export class AuthorizationsPageModule {}
