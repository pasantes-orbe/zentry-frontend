import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomesComponent } from './incomes/incomes.component';
import { IonicModule } from '@ionic/angular';
import { ReservationsComponent } from './reservations/reservations.component';
import { NavbarDefaultComponent } from './navbars/navbar-default/navbar-default.component';
import { NavbarBackComponent } from './navbars/navbar-back/navbar-back.component';
import { CountryMapComponent } from './maps/country-map/country-map.component';
import { LoaderComponent } from './loader/loader.component';
import { NavbarGuardsComponent } from './navbars/navbar-guards/navbar-guards.component';
import { IncomesGuardsComponent } from './incomes-guards/incomes-guards.component';
import { NavbarAdminComponent } from './navbars/navbar-admin/navbar-admin.component';



@NgModule({
  declarations: [NavbarAdminComponent, IncomesGuardsComponent, NavbarGuardsComponent, LoaderComponent, CountryMapComponent, IncomesComponent, ReservationsComponent, NavbarDefaultComponent, NavbarBackComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [NavbarAdminComponent, IncomesGuardsComponent, NavbarGuardsComponent, LoaderComponent, CountryMapComponent, IncomesComponent, ReservationsComponent, NavbarDefaultComponent, NavbarBackComponent]
})
export class ComponentsModule { }
