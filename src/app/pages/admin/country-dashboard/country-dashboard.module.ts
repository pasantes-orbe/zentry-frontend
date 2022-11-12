import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CountryDashboardPageRoutingModule } from './country-dashboard-routing.module';

import { CountryDashboardPage } from './country-dashboard.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CountryDashboardPageRoutingModule,
    ComponentsModule
  ],
  declarations: [CountryDashboardPage]
})
export class CountryDashboardPageModule {}
