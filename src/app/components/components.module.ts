// src/app/components/components.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

// CAMBIO CLAVE: Se importa nuestro propio pipe desde su archivo local.
import { FilterByPipe } from '../pipes/filter-by.pipe';

// Pipes
import { SortPipe } from '../pipes/sort.pipe';

// Components
import { IncomesComponent } from './incomes/incomes.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { NavbarDefaultComponent } from './navbars/navbar-default/navbar-default.component';
import { NavbarBackComponent } from './navbars/navbar-back/navbar-back.component';
import { CountryMapComponent } from './maps/country-map/country-map.component';
import { LoaderComponent } from './loader/loader.component';
import { NavbarGuardsComponent } from './navbars/navbar-guards/navbar-guards.component';
import { IncomesGuardsComponent } from './incomes-guards/incomes-guards.component';
import { NavbarAdminComponent } from './navbars/navbar-admin/navbar-admin.component';
import { RecurrentsViewAllComponent } from './recurrentsViewAll/recurrents-view-all/recurrents-view-all.component';
import { InvitationsComponent } from './invitations/invitations/invitations.component';
import { CountryPopoverComponent } from './country-popover/country-popover.component';

@NgModule({
  declarations: [
    SortPipe,
    // Se declara nuestro propio FilterByPipe.
    FilterByPipe,
    NavbarAdminComponent,
    CountryPopoverComponent,
    IncomesGuardsComponent,
    NavbarGuardsComponent,
    LoaderComponent,
    CountryMapComponent,
    IncomesComponent,
    ReservationsComponent,
    NavbarDefaultComponent,
    NavbarBackComponent,
    RecurrentsViewAllComponent,
    InvitationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
  ],
  providers: [],
  exports: [
    SortPipe,
    // Se exporta nuestro propio FilterByPipe para que otros módulos puedan usarlo.
    FilterByPipe,
    NavbarAdminComponent,
    CountryPopoverComponent,
    IncomesGuardsComponent,
    NavbarGuardsComponent,
    LoaderComponent,
    CountryMapComponent,
    IncomesComponent,
    ReservationsComponent,
    NavbarDefaultComponent,
    NavbarBackComponent,
    RecurrentsViewAllComponent,
    InvitationsComponent,
  ]
})
export class ComponentsModule { }
// CAMBIO CLAVE: Se importa nuestro propio pipe desde su archivo local.