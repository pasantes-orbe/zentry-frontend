import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomesComponent } from './incomes/incomes.component';
import { IonicModule } from '@ionic/angular';
import { ReservationsComponent } from './reservations/reservations.component';
import { NavbarDefaultComponent } from './navbars/navbar-default/navbar-default.component';
import { NavbarBackComponent } from './navbars/navbar-back/navbar-back.component';
import { CountryMapComponent } from './maps/country-map/country-map.component';



@NgModule({
  declarations: [CountryMapComponent, IncomesComponent, ReservationsComponent, NavbarDefaultComponent, NavbarBackComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [CountryMapComponent, IncomesComponent, ReservationsComponent, NavbarDefaultComponent, NavbarBackComponent]
})
export class ComponentsModule { }
